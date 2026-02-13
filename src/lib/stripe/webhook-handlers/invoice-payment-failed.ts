import type { Prisma } from '@prisma/client';
import pino from 'pino';
import type Stripe from 'stripe';
import { extractCustomerId, sendNotificationEmail } from './helpers';

const logger = pino();
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function handleInvoicePaymentFailed(
  event: Stripe.Event,
  tx: Prisma.TransactionClient
): Promise<void> {
  const invoice = event.data.object as Stripe.Invoice;
  const customerId = extractCustomerId(invoice.customer);

  if (!customerId) {
    logger.warn({ eventId: event.id }, 'Missing customer ID in invoice');
    return;
  }

  const user = await tx.user.findFirst({
    where: { stripeCustomerId: customerId },
    select: { id: true, email: true, name: true, planTier: true },
  });

  if (!user) {
    logger.warn({ customerId, eventId: event.id }, 'User not found for payment failure');
    return;
  }

  // Downgrade user to FREE on payment failure
  await tx.user.update({
    where: { id: user.id },
    data: {
      planTier: 'FREE',
      subscriptionStatus: 'past_due',
    },
  });

  logger.warn(
    { userId: user.id, customerId, oldPlanTier: user.planTier },
    'Payment failed - user downgraded to FREE'
  );

  // Send critical payment failure email
  if (user.email) {
    await sendNotificationEmail({
      toEmail: user.email,
      toName: user.name || 'Cliente',
      subject: 'Falha no pagamento da sua assinatura PRO - Ação necessária',
      link: `${APP_URL}/minha-conta`,
      templateName: 'paymentFailed',
      context: { userId: user.id, customerId },
    });
  }
}
