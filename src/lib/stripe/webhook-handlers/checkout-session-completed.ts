import type { Prisma } from '@prisma/client';
import pino from 'pino';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import {
  extractCustomerId,
  extractSubscriptionId,
  getPlanTierFromStatus,
  SECONDS_TO_MS,
} from './helpers';

const logger = pino();

export interface CheckoutCompletedResult {
  shouldSendEmail: boolean;
  userEmail?: string;
  userName?: string;
  userId: string;
  subscriptionId: string;
  planTier: string;
  eventId: string;
}

export async function handleCheckoutSessionCompleted(
  event: Stripe.Event,
  tx: Prisma.TransactionClient
): Promise<CheckoutCompletedResult> {
  const session = event.data.object as Stripe.Checkout.Session;
  const subscriptionId = extractSubscriptionId(session.subscription);
  const customerId = extractCustomerId(session.customer);

  logger.info(
    {
      operation: 'handleCheckoutSessionCompleted',
      eventId: event.id,
      eventType: event.type,
      subscriptionId,
      customerId,
    },
    'Processing checkout session completed webhook'
  );

  if (!subscriptionId || !customerId) {
    logger.warn(
      { eventId: event.id, subscriptionId, customerId },
      'Missing subscription or customer ID in checkout session'
    );
    return {
      shouldSendEmail: false,
      userId: '',
      subscriptionId: subscriptionId || '',
      planTier: 'FREE',
      eventId: event.id,
    };
  }

  const stripe = getStripe();
  const subscriptionResp = await stripe.subscriptions.retrieve(subscriptionId);
  const subscription = subscriptionResp as unknown as {
    current_period_end?: number;
    status: string;
    metadata?: Record<string, string>;
  };
  const currentPeriodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * SECONDS_TO_MS)
    : null;
  const userId = subscription.metadata?.userId;

  if (!userId) {
    logger.error(
      { subscriptionId, eventId: event.id, metadata: subscription.metadata },
      'Missing userId in subscription metadata'
    );
    throw new Error('Invalid subscription metadata');
  }

  // Verify user exists before updating
  const user = await tx.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true, planTier: true },
  });

  if (!user) {
    logger.error({ userId, subscriptionId, eventId: event.id }, 'User not found');
    throw new Error('User not found for subscription');
  }

  const oldPlanTier = user.planTier;
  const newPlanTier = getPlanTierFromStatus(subscription.status);
  const subscriptionStatus = subscription.status;

  logger.info(
    {
      operation: 'updateUserSubscription',
      eventId: event.id,
      userId,
      subscriptionId,
      oldPlanTier,
      newPlanTier,
      subscriptionStatus,
      resolvedPlanTier: newPlanTier,
    },
    'Updating user subscription data'
  );

  // Update user with subscription details
  await tx.user.update({
    where: { id: userId },
    data: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      subscriptionStatus,
      planTier: newPlanTier,
      currentPeriodEnd,
      cancelAtPeriodEnd: false,
    },
  });

  logger.info(
    {
      operation: 'updateUserSubscription',
      eventId: event.id,
      userId,
      subscriptionId,
      planTier: newPlanTier,
      subscriptionStatus,
      result: 'success',
      updatedFields: [
        'stripeCustomerId',
        'stripeSubscriptionId',
        'subscriptionStatus',
        'planTier',
        'currentPeriodEnd',
        'cancelAtPeriodEnd',
      ],
    },
    'User subscription data updated successfully'
  );

  // Return data for email event emission (happens outside transaction)
  return {
    shouldSendEmail: !!user.email,
    userEmail: user.email || undefined,
    userName: user.name || undefined,
    userId: user.id,
    subscriptionId,
    planTier: newPlanTier,
    eventId: event.id,
  };
}
