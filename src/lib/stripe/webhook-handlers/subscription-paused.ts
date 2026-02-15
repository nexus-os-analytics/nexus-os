import type { Prisma } from '@prisma/client';
import pino from 'pino';
import type Stripe from 'stripe';
import { extractCustomerId } from './helpers';

const logger = pino();

export async function handleSubscriptionPaused(
  event: Stripe.Event,
  tx: Prisma.TransactionClient
): Promise<void> {
  const subscription = event.data.object as Stripe.Subscription;
  const customerId = extractCustomerId(subscription.customer);

  logger.info(
    {
      eventType: event.type,
      customerId,
      subscriptionId: subscription.id,
      status: subscription.status,
    },
    'Processing subscription pause'
  );

  if (!customerId) {
    logger.error({ eventType: event.type, eventId: event.id }, 'Missing customerId');
    return;
  }

  const user = await tx.user.findFirst({
    where: { stripeCustomerId: customerId },
    select: { id: true, planTier: true },
  });

  if (!user) {
    logger.warn({ customerId, eventType: event.type, eventId: event.id }, 'User not found');
    return;
  }

  // Update subscription status to paused
  await tx.user.update({
    where: { id: user.id },
    data: {
      subscriptionStatus: 'paused',
      planTier: 'FREE', // Downgrade to FREE while paused
    },
  });

  logger.info({ userId: user.id, customerId }, 'Subscription paused - user downgraded to FREE');
}
