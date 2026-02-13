import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { APP_URL } from '@/lib/constants';
import { authOptions } from '@/lib/next-auth';
import { getStripe } from '@/lib/stripe';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const priceId = process.env.STRIPE_PRICE_PRO_MONTHLY;
  if (!priceId) {
    return NextResponse.json({ error: 'Missing STRIPE_PRICE_PRO_MONTHLY' }, { status: 500 });
  }

  const stripe = getStripe();
  const checkout = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: session.user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${APP_URL}/stripe/success`,
    cancel_url: `${APP_URL}/stripe/cancelado`,
    allow_promotion_codes: true,
    subscription_data: {
      metadata: { userId: session.user.id, planTier: 'PRO' },
    },
  });

  return NextResponse.json({ url: checkout.url });
}
