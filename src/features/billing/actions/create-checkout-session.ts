'use server';

import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/next-auth';
import prisma from '@/lib/prisma';
import { getStripe } from '@/lib/stripe';

interface CreateCheckoutInput {
  planTier: 'PRO' | 'FREE'; // Expect PRO for paid plan
}

export async function createCheckoutSession({ planTier }: CreateCheckoutInput) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    throw new Error('Not authenticated');
  }

  if (planTier !== 'PRO') {
    throw new Error('Only PRO plan supports checkout');
  }

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) throw new Error('User not found');

  const priceId = process.env.STRIPE_PRICE_PRO_MONTHLY;
  if (!priceId) throw new Error('Missing STRIPE_PRICE_PRO_MONTHLY env');

  const stripe = getStripe();
  const checkout = await stripe.checkout.sessions.create({
    mode: 'subscription',
    customer_email: user.email,
    line_items: [{ price: priceId, quantity: 1 }],
    success_url: `${process.env.NEXT_PUBLIC_APP_URL}/stripe/success?session_id={CHECKOUT_SESSION_ID}`,
    cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/precos`,
    allow_promotion_codes: true,
    subscription_data: {
      metadata: { userId: user.id, planTier: 'PRO' },
    },
  });

  return checkout.url as string;
}
