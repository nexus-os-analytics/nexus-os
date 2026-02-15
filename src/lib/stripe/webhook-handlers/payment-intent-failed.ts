import type { Prisma } from '@prisma/client';
import pino from 'pino';
import type Stripe from 'stripe';
import { extractCustomerId } from './helpers';

const logger = pino();

export async function handlePaymentIntentFailed(
  event: Stripe.Event,
  _tx: Prisma.TransactionClient
): Promise<void> {
  const paymentIntent = event.data.object as Stripe.PaymentIntent;
  const customerId = extractCustomerId(paymentIntent.customer);

  logger.warn(
    { customerId, paymentIntentId: paymentIntent.id, eventId: event.id },
    'Payment intent failed'
  );

  // This is mainly for logging purposes
  // The actual subscription status will be handled by invoice.payment_failed
}
