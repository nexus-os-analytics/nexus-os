import type { PlanTier } from '@prisma/client';
import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import pino from 'pino';
import type Stripe from 'stripe';
import prisma from '@/lib/prisma';
import { getStripe } from '@/lib/stripe';

const logger = pino();

export const runtime = 'nodejs';

// Constant for Unix timestamp conversion (seconds to milliseconds)
const SECONDS_TO_MS = 1000;

/**
 * Maps Stripe subscription status to PlanTier
 * Only active/trialing subscriptions grant PRO access
 */
function getPlanTierFromStatus(status: string): PlanTier {
  switch (status) {
    case 'active':
    case 'trialing':
      return 'PRO';
    default:
      return 'FREE';
  }
}

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
    await prisma.$transaction(async (tx) => {
      switch (event.type) {
        case 'checkout.session.completed': {
          const session = event.data.object as Stripe.Checkout.Session;
          const subscriptionId =
            typeof session.subscription === 'string'
              ? (session.subscription as string)
              : ((session.subscription as Stripe.Subscription | null)?.id ?? null);
          const customerId =
            typeof session.customer === 'string'
              ? (session.customer as string)
              : ((session.customer as Stripe.Customer | null)?.id ?? null);

          if (subscriptionId && customerId) {
            const subscriptionResp = await stripe.subscriptions.retrieve(subscriptionId);
            const sub = subscriptionResp as unknown as {
              current_period_end?: number;
              status?: string;
              metadata?: Record<string, string>;
            };
            const currentPeriodEnd = sub.current_period_end
              ? new Date(sub.current_period_end * SECONDS_TO_MS)
              : null;
            const userId = sub.metadata?.userId;

            if (!userId) {
              logger.error(
                { subscriptionId, eventId: event.id },
                'Missing userId in subscription metadata'
              );
              throw new Error('Invalid subscription metadata');
            }

            // Verify user exists before updating
            const user = await tx.user.findUnique({ where: { id: userId } });
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
                subscriptionStatus: sub.status,
                planTier: getPlanTierFromStatus(sub.status ?? 'incomplete'),
                currentPeriodEnd,
              },
            });

            logger.info(
              { userId, subscriptionId, status: sub.status },
              'Checkout session completed'
            );
          }
          break;
        }

        case 'customer.subscription.updated':
        case 'customer.subscription.deleted': {
          const subscriptionObj = event.data.object as Stripe.Subscription;
          const sub = subscriptionObj as unknown as {
            current_period_end?: number;
            status?: string;
            customer?: string | { id: string };
          };
          const currentPeriodEnd = sub.current_period_end
            ? new Date(sub.current_period_end * SECONDS_TO_MS)
            : null;
          const customerId = typeof sub.customer === 'string' ? (sub.customer as string) : null;

          if (customerId) {
            // Find user by Stripe customer ID
            const user = await tx.user.findFirst({
              where: { stripeCustomerId: customerId },
            });

            if (!user) {
              logger.warn(
                { customerId, eventType: event.type, eventId: event.id },
                'No user found with stripeCustomerId'
              );
              break;
            }

            // Update subscription status
            await tx.user.update({
              where: { id: user.id },
              data: {
                subscriptionStatus: sub.status,
                currentPeriodEnd,
                planTier:
                  event.type === 'customer.subscription.deleted'
                    ? 'FREE'
                    : getPlanTierFromStatus(sub.status ?? 'incomplete'),
              },
            });

            logger.info(
              { userId: user.id, customerId, status: sub.status, eventType: event.type },
              'Subscription updated'
            );
          }
          break;
        }

        case 'invoice.payment_failed': {
          const invoice = event.data.object as Stripe.Invoice;
          const customerId =
            typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;

          if (customerId) {
            const user = await tx.user.findFirst({
              where: { stripeCustomerId: customerId },
            });

            if (user) {
              // Downgrade user to FREE on payment failure
              await tx.user.update({
                where: { id: user.id },
                data: {
                  planTier: 'FREE',
                  subscriptionStatus: 'past_due',
                },
              });

              logger.warn(
                { userId: user.id, customerId },
                'Payment failed - user downgraded to FREE'
              );
            }
          }
          break;
        }

        case 'invoice.payment_succeeded': {
          const invoice = event.data.object as Stripe.Invoice;
          const customerId =
            typeof invoice.customer === 'string' ? invoice.customer : invoice.customer?.id;

          if (customerId) {
            const user = await tx.user.findFirst({
              where: { stripeCustomerId: customerId },
            });

            if (user) {
              logger.info(
                { userId: user.id, customerId },
                'Payment succeeded - subscription renewed'
              );
            }
          }
          break;
        }

        case 'payment_intent.payment_failed': {
          const paymentIntent = event.data.object as Stripe.PaymentIntent;
          const customerId =
            typeof paymentIntent.customer === 'string'
              ? paymentIntent.customer
              : paymentIntent.customer?.id;

          logger.warn({ customerId, paymentIntentId: paymentIntent.id }, 'Payment intent failed');
          break;
        }

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
