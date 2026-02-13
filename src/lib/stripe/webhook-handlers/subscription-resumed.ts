import type { Prisma } from '@prisma/client';
import pino from 'pino';
import type Stripe from 'stripe';
import { extractCustomerId, getPlanTierFromStatus, SECONDS_TO_MS } from './helpers';

const logger = pino();

export async function handleSubscriptionResumed(
  event: Stripe.Event,
  tx: Prisma.TransactionClient
): Promise<void> {
  const subscriptionObj = event.data.object as Stripe.Subscription;
  const subscription = subscriptionObj as unknown as {
    id: string;
    status: string;
    customer: unknown;
    current_period_end?: number;
  };
  const customerId = extractCustomerId(subscription.customer);
  const currentPeriodEnd = subscription.current_period_end
    ? new Date(subscription.current_period_end * SECONDS_TO_MS)
    : null;

  logger.info(
    {
      eventType: event.type,
      customerId,
      subscriptionId: subscription.id,
      status: subscription.status,
    },
    'Processing subscription resume'
  );

  if (!customerId) {
    logger.error({ eventType: event.type, eventId: event.id }, 'Missing customerId');
    return;
  }

  const user = await tx.user.findFirst({
    where: { stripeCustomerId: customerId },
    select: { id: true, planTier: true, subscriptionStatus: true },
  });

  if (!user) {
    logger.warn({ customerId, eventType: event.type, eventId: event.id }, 'User not found');
    return;
  }

  // Restore subscription based on current status
  const newPlanTier = getPlanTierFromStatus(subscription.status);

  await tx.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: subscription.status,
      planTier: newPlanTier,
      currentPeriodEnd,
      cancelAtPeriodEnd: false,
    },
  });

  logger.info(
    { userId: user.id, customerId, newPlanTier, status: subscription.status },
    'Subscription resumed successfully'
  );
}
