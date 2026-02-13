import type { Prisma } from '@prisma/client';
import pino from 'pino';
import type Stripe from 'stripe';
import { extractCustomerId, getPlanTierFromStatus, SECONDS_TO_MS } from './helpers';

const logger = pino();

export async function handleSubscriptionUpdated(
  event: Stripe.Event,
  tx: Prisma.TransactionClient
): Promise<void> {
  const subscriptionObj = event.data.object as Stripe.Subscription;
  const subscription = subscriptionObj as unknown as {
    id: string;
    status: string;
    customer: unknown;
    current_period_end?: number;
    cancel_at_period_end?: boolean;
  };
  const currentPeriodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * SECONDS_TO_MS)
    : null;
  const customerId = extractCustomerId(subscription.customer);

  logger.info(
    {
      eventType: event.type,
      customerId,
      subscriptionId: subscription.id,
      status: subscription.status,
      cancel_at_period_end: subscription.cancel_at_period_end,
    },
    'Processing subscription update'
  );

  if (!customerId) {
    logger.error({ eventType: event.type, eventId: event.id }, 'Missing customerId');
    return;
  }

  // Find user by Stripe customer ID
  const user = await tx.user.findFirst({
    where: { stripeCustomerId: customerId },
    select: { id: true, planTier: true, subscriptionStatus: true },
  });

  if (!user) {
    logger.warn({ customerId, eventType: event.type, eventId: event.id }, 'User not found');
    return;
  }

  // Determine new plan tier and status
  let newPlanTier: 'PRO' | 'FREE';
  let newStatus: string;
  let cancelAtPeriodEnd: boolean;

  if (subscription.cancel_at_period_end) {
    // User canceled but subscription still active until period end
    // Keep PRO access until end of billing period
    newPlanTier =
      subscription.status === 'active' || subscription.status === 'trialing' ? 'PRO' : 'FREE';
    newStatus = 'canceling';
    cancelAtPeriodEnd = true;
  } else {
    // Normal subscription update (could be reactivation)
    newPlanTier = getPlanTierFromStatus(subscription.status);
    newStatus = subscription.status;
    cancelAtPeriodEnd = false;
  }

  logger.info(
    {
      userId: user.id,
      oldPlanTier: user.planTier,
      newPlanTier,
      oldStatus: user.subscriptionStatus,
      newStatus,
      cancel_at_period_end: subscription.cancel_at_period_end,
      cancelAtPeriodEnd,
    },
    'Updating user subscription'
  );

  // Update subscription status
  await tx.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: newStatus,
      currentPeriodEnd,
      planTier: newPlanTier,
      stripeSubscriptionId: subscription.id,
      cancelAtPeriodEnd,
    },
  });

  logger.info(
    {
      userId: user.id,
      customerId,
      planTier: newPlanTier,
      status: newStatus,
      cancelAtPeriodEnd,
    },
    'Subscription updated successfully'
  );
}
