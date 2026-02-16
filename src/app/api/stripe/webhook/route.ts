import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import pino from 'pino';
import { inngest } from '@/lib/inngest/client';
import prisma from '@/lib/prisma';
import { getStripe } from '@/lib/stripe';
import {
  handleCheckoutSessionCompleted,
  handleInvoicePaymentActionRequired,
  handleInvoicePaymentFailed,
  handleInvoicePaymentSucceeded,
  handlePaymentIntentFailed,
  handleSubscriptionDeleted,
  handleSubscriptionPaused,
  handleSubscriptionResumed,
  handleSubscriptionTrialWillEnd,
  handleSubscriptionUpdated,
  type CheckoutCompletedResult,
} from '@/lib/stripe/webhook-handlers';

const logger = pino();

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const hdrs = await headers();
  const body = await req.text();
  const sig = hdrs.get('stripe-signature');

  // Validate webhook signature header
  if (!sig) {
    logger.error('Missing stripe-signature header');
    return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
  }

  // Validate webhook secret exists
  const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET;
  if (!webhookSecret) {
    logger.error('Missing STRIPE_WEBHOOK_SECRET environment variable');
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 });
  }

  try {
    const stripe = getStripe();
    const event = stripe.webhooks.constructEvent(body, sig, webhookSecret);

    // Idempotency check: verify event hasn't been processed
    const existingEvent = await prisma.webhookEvent.findUnique({
      where: { eventId: event.id },
    });

    if (existingEvent) {
      logger.info({ eventId: event.id, type: event.type }, 'Webhook event already processed');
      return NextResponse.json({ received: true, duplicate: true });
    }

    // Process event within transaction for atomicity
    let checkoutResult: CheckoutCompletedResult | null = null;

    await prisma.$transaction(async (tx) => {
      switch (event.type) {
        case 'checkout.session.completed':
          checkoutResult = await handleCheckoutSessionCompleted(event, tx);
          break;

        case 'customer.subscription.updated':
          await handleSubscriptionUpdated(event, tx);
          break;

        case 'customer.subscription.deleted':
          await handleSubscriptionDeleted(event, tx);
          break;

        case 'customer.subscription.trial_will_end':
          await handleSubscriptionTrialWillEnd(event, tx);
          break;

        case 'customer.subscription.paused':
          await handleSubscriptionPaused(event, tx);
          break;

        case 'customer.subscription.resumed':
          await handleSubscriptionResumed(event, tx);
          break;

        case 'invoice.payment_failed':
          await handleInvoicePaymentFailed(event, tx);
          break;

        case 'invoice.payment_succeeded':
          await handleInvoicePaymentSucceeded(event, tx);
          break;

        case 'invoice.payment_action_required':
          await handleInvoicePaymentActionRequired(event, tx);
          break;

        case 'payment_intent.payment_failed':
          await handlePaymentIntentFailed(event, tx);
          break;

        default:
          logger.info({ eventType: event.type }, 'Unhandled webhook event type');
      }

      // Record event as processed
      await tx.webhookEvent.create({
        data: {
          eventId: event.id,
          type: event.type,
          processed: true,
          processedAt: new Date(),
          payload: event as unknown as never,
        },
      });
    });

    // After transaction commits, emit Inngest event for email delivery (fire-and-forget)
    const result = checkoutResult as CheckoutCompletedResult | null;
    if (result && result.shouldSendEmail && result.userEmail) {
      const emailData = {
        userId: result.userId,
        subscriptionId: result.subscriptionId,
        userEmail: result.userEmail,
        userName: result.userName || 'Cliente',
        planTier: result.planTier,
        eventId: result.eventId,
      };

      try {
        await inngest.send({
          name: 'billing/payment-confirmed',
          data: emailData,
        });

        logger.info(
          {
            operation: 'emitInngestEvent',
            eventName: 'billing/payment-confirmed',
            eventId: event.id,
            userId: emailData.userId,
            subscriptionId: emailData.subscriptionId,
          },
          'Inngest event emitted for email delivery'
        );
      } catch (inngestError) {
        // Email event emission failure should not fail the webhook
        // The critical database update already succeeded
        logger.error(
          {
            error: inngestError,
            eventId: event.id,
            userId: emailData.userId,
          },
          'Failed to emit Inngest event for email delivery (non-critical)'
        );
      }
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const err =
      error instanceof Error
        ? error
        : new Error(typeof error === 'string' ? error : 'Unknown error');
    logger.error(
      { err, eventId: (error as { id?: string }).id },
      'Error processing Stripe webhook'
    );

    // Record failed event
    try {
      await prisma.webhookEvent.create({
        data: {
          eventId: (error as { event?: { id: string } }).event?.id ?? `failed-${Date.now()}`,
          type: (error as { event?: { type: string } }).event?.type ?? 'unknown',
          processed: false,
          processedAt: new Date(),
          payload: {},
          error: err.message,
        },
      });
    } catch (dbError) {
      logger.error({ err: dbError }, 'Failed to record webhook error in database');
    }

    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 400 });
  }
}
