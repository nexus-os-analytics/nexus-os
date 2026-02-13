import type { Prisma } from '@prisma/client';
import pino from 'pino';
import type Stripe from 'stripe';
import { extractCustomerId, sendNotificationEmail } from './helpers';

const logger = pino();
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function handleSubscriptionTrialWillEnd(
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
      trialEnd: subscription.trial_end,
    },
    'Processing trial ending notification'
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

  if (user.planTier !== 'PRO') {
    logger.warn(
      { customerId, userId: user.id, planTier: user.planTier },
      'User is not PRO - skipping trial ending email'
    );
    return;
  }

  logger.info({ userId: user.id, customerId }, 'Sending trial ending notification');

  // Send trial ending warning email (3 days before expiry)
  if (user.email) {
    await sendNotificationEmail({
      toEmail: user.email,
      toName: user.name || 'Cliente',
      subject: 'Seu período de teste PRO termina em 3 dias ⏰',
      link: `${APP_URL}/minha-conta`,
      templateName: 'subscriptionTrialEnding',
      context: { userId: user.id, subscriptionId: subscription.id },
    });
  }
}
