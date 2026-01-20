import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import pino from 'pino';
import type Stripe from 'stripe';
import prisma from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

const logger = pino();

export const runtime = 'nodejs';

export async function POST(req: Request) {
  const hdrs = await headers();
  const body = await req.text();
  const sig = hdrs.get('stripe-signature')!;

  try {
    const event = stripe.webhooks.constructEvent(body, sig, process.env.STRIPE_WEBHOOK_SECRET!);

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
            ? new Date(sub.current_period_end * 1000)
            : null;
          const userId = sub.metadata?.userId;

          if (userId) {
            await prisma.user.update({
              where: { id: userId },
              data: {
                stripeCustomerId: customerId,
                stripeSubscriptionId: subscriptionId,
                subscriptionStatus: sub.status,
                planTier: 'PRO',
                currentPeriodEnd,
              },
            });
          }
        }
        break;
      }

      case 'customer.subscription.updated':
      case 'customer.subscription.deleted':
        {
          const subscriptionObj = event.data.object as Stripe.Subscription;
          const sub = subscriptionObj as unknown as {
            current_period_end?: number;
            status?: string;
            customer?: string | { id: string };
          };
          const currentPeriodEnd = sub.current_period_end
            ? new Date(sub.current_period_end * 1000)
            : null;
          const customerId = typeof sub.customer === 'string' ? (sub.customer as string) : null;

          if (customerId) {
            await prisma.user.updateMany({
              where: { stripeCustomerId: customerId },
              data: {
                subscriptionStatus: sub.status,
                currentPeriodEnd,
                planTier: event.type === 'customer.subscription.deleted' ? 'FREE' : undefined,
              },
            });
          }
        }
        break;
    }

    return NextResponse.json({ received: true });
  } catch (error) {
    const err =
      error instanceof Error
        ? error
        : new Error(typeof error === 'string' ? error : 'Unknown error');
    logger.error({ err }, 'Error processing Stripe webhook');
    return NextResponse.json({ error: 'Webhook handler failed' }, { status: 400 });
  }
}
