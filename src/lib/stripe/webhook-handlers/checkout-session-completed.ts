import type { Prisma } from '@prisma/client';
import pino from 'pino';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import {
  extractCustomerId,
  extractSubscriptionId,
  getPlanTierFromStatus,
  SECONDS_TO_MS,
  sendNotificationEmail,
} from './helpers';

const logger = pino();
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function handleCheckoutSessionCompleted(
  event: Stripe.Event,
  tx: Prisma.TransactionClient
): Promise<void> {
  const session = event.data.object as Stripe.Checkout.Session;
  const subscriptionId = extractSubscriptionId(session.subscription);
  const customerId = extractCustomerId(session.customer);

  if (!subscriptionId || !customerId) {
    logger.warn({ eventId: event.id }, 'Missing subscription or customer ID in checkout session');
    return;
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
    logger.error({ subscriptionId, eventId: event.id }, 'Missing userId in subscription metadata');
    throw new Error('Invalid subscription metadata');
  }

  // Verify user exists before updating
  const user = await tx.user.findUnique({
    where: { id: userId },
    select: { id: true, email: true, name: true },
  });

  if (!user) {
    logger.error({ userId, subscriptionId, eventId: event.id }, 'User not found');
    throw new Error('User not found for subscription');
  }

  // Update user with subscription details
  await tx.user.update({
    where: { id: userId },
    data: {
      stripeCustomerId: customerId,
      stripeSubscriptionId: subscriptionId,
      subscriptionStatus: subscription.status,
      planTier: getPlanTierFromStatus(subscription.status),
      currentPeriodEnd,
      cancelAtPeriodEnd: false,
    },
  });

  logger.info(
    { userId, subscriptionId, status: subscription.status },
    'Checkout session completed'
  );

  // Send welcome PRO email
  if (user.email) {
    await sendNotificationEmail({
      toEmail: user.email,
      toName: user.name || 'Cliente',
      subject: 'Bem-vindo ao Nexus OS PRO! 🚀',
      link: `${APP_URL}/minha-conta`,
      templateName: 'paymentConfirmed',
      context: { userId: user.id, subscriptionId },
    });
  }
}
