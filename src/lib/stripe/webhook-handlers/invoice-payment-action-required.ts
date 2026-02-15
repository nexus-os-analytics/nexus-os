import type { Prisma } from '@prisma/client';
import pino from 'pino';
import type Stripe from 'stripe';
import { extractCustomerId, sendNotificationEmail } from './helpers';

const logger = pino();
const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';

export async function handleInvoicePaymentActionRequired(
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
    select: { id: true, email: true, name: true },
  });

  if (!user) {
    logger.warn({ customerId, eventId: event.id }, 'User not found');
    return;
  }

  logger.info(
    { userId: user.id, customerId, invoiceId: invoice.id },
    'Payment action required - sending notification'
  );

  // Send email with link to complete payment action (e.g., 3D Secure)
  if (user.email) {
    await sendNotificationEmail({
      toEmail: user.email,
      toName: user.name || 'Cliente',
      subject: 'Ação necessária para confirmar seu pagamento - Nexus OS',
      link: invoice.hosted_invoice_url || `${APP_URL}/minha-conta`,
      templateName: 'paymentFailed',
      context: { userId: user.id, invoiceId: invoice.id, actionRequired: true },
    });
  }
}
