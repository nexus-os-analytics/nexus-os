import type { Prisma } from '@prisma/client';
import pino from 'pino';
import type Stripe from 'stripe';
import { getStripe } from '@/lib/stripe';
import { extractCustomerId, extractSubscriptionId, sendNotificationEmail } from './helpers';

const logger = pino();
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function handleInvoicePaymentSucceeded(
  event: Stripe.Event,
  tx: Prisma.TransactionClient
): Promise<void> {
  const invoice = event.data.object as Stripe.Invoice;
  const invoiceObj = invoice as unknown as { customer: unknown; subscription?: unknown };
  const customerId = extractCustomerId(invoiceObj.customer);
  const subscriptionId = extractSubscriptionId(invoiceObj.subscription);

  if (!customerId) {
    logger.warn({ eventId: event.id }, 'Missing customer ID in invoice');
    return;
  }

  if (!subscriptionId) {
    logger.info({ eventId: event.id }, 'Invoice not related to subscription');
    return;
  }

  const user = await tx.user.findFirst({
    where: { stripeCustomerId: customerId },
    select: { id: true, email: true, name: true, planTier: true, subscriptionStatus: true },
  });

  if (!user) {
    logger.warn({ customerId, eventId: event.id }, 'User not found for payment confirmation');
    return;
  }

  // If user was downgraded due to payment failure, restore PRO access
  if (user.planTier === 'FREE' && user.subscriptionStatus === 'past_due') {
    // Fetch current subscription status from Stripe
    const stripe = getStripe();
    const subscription = await stripe.subscriptions.retrieve(subscriptionId);

    if (subscription.status === 'active' || subscription.status === 'trialing') {
      await tx.user.update({
        where: { id: user.id },
        data: {
          planTier: 'PRO',
          subscriptionStatus: subscription.status,
          cancelAtPeriodEnd: subscription.cancel_at_period_end || false,
        },
      });

      logger.info(
        { userId: user.id, customerId },
        'Payment succeeded - user restored to PRO after payment recovery'
      );

      // Send payment recovery success email
      if (user.email) {
        await sendNotificationEmail({
          toEmail: user.email,
          toName: user.name || 'Cliente',
          subject: 'Pagamento processado com sucesso! Bem-vindo de volta ao PRO',
          link: `${APP_URL}/minha-conta`,
          templateName: 'paymentConfirmed',
          context: { userId: user.id, customerId, recovery: true },
        });
      }
    } else {
      logger.info(
        { userId: user.id, customerId, subscriptionStatus: subscription.status },
        'Payment succeeded but subscription not active'
      );
    }
  } else {
    logger.info({ userId: user.id, customerId }, 'Payment succeeded - subscription renewed');

    // Send renewal confirmation email
    if (user.email) {
      await sendNotificationEmail({
        toEmail: user.email,
        toName: user.name || 'Cliente',
        subject: 'Pagamento confirmado - Nexus OS PRO',
        link: `${APP_URL}/minha-conta`,
        templateName: 'paymentConfirmed',
        context: { userId: user.id, customerId },
      });
    }
  }
}
