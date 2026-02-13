import type { Prisma } from '@prisma/client';
import pino from 'pino';
import type Stripe from 'stripe';
import { extractCustomerId, sendNotificationEmail } from './helpers';

const logger = pino();
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function handleSubscriptionDeleted(
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
    'Processing subscription deletion'
  );

  if (!customerId) {
    logger.error({ eventType: event.type, eventId: event.id }, 'Missing customerId');
    return;
  }

  // Find user by Stripe customer ID
  const user = await tx.user.findFirst({
    where: { stripeCustomerId: customerId },
    select: { id: true, email: true, name: true, planTier: true },
  });

  if (!user) {
    logger.warn({ customerId, eventType: event.type, eventId: event.id }, 'User not found');
    return;
  }

  // Subscription fully deleted/expired - downgrade to FREE
  await tx.user.update({
    where: { id: user.id },
    data: {
      planTier: 'FREE',
      subscriptionStatus: 'canceled',
      stripeSubscriptionId: null,
      currentPeriodEnd: null,
      cancelAtPeriodEnd: false,
    },
  });

  logger.info(
    { userId: user.id, customerId, oldPlanTier: user.planTier },
    'Subscription deleted - user downgraded to FREE'
  );

  // Send cancellation confirmation email
  if (user.email) {
    await sendNotificationEmail({
      toEmail: user.email,
      toName: user.name || 'Cliente',
      subject: 'Sua assinatura PRO foi cancelada - Nexus OS',
      link: `${APP_URL}/precos`,
      templateName: 'subscriptionCanceled',
      context: { userId: user.id, subscriptionId: subscription.id },
    });
  }
}
