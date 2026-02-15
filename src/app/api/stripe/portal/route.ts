import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { APP_URL } from '@/lib/constants';
import { authOptions } from '@/lib/next-auth';
import prisma from '@/lib/prisma';
import { getStripe } from '@/lib/stripe';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const stripe = getStripe();

  // Use transaction to prevent race condition when creating Stripe customer
  const customerId = await prisma.$transaction(async (tx) => {
    const user = await tx.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, stripeCustomerId: true, email: true },
    });

    if (!user) {
      throw new Error('User not found');
    }

    // Return existing customer ID if available
    if (user.stripeCustomerId) {
      return user.stripeCustomerId;
    }

    // Create new Stripe customer and update user atomically
    const customer = await stripe.customers.create({
      email: user.email ?? session.user.email,
    });

    await tx.user.update({
      where: { id: user.id },
      data: { stripeCustomerId: customer.id },
    });

    return customer.id;
  });

  const portal = await stripe.billingPortal.sessions.create({
    customer: customerId,
    return_url: `${APP_URL}/minha-conta?refresh=true`,
  });

  return NextResponse.json({ url: portal.url });
}
