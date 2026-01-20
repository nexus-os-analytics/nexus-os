import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/next-auth';
import prisma from '@/lib/prisma';
import { stripe } from '@/lib/stripe';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id || !session.user.email) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  // Ensure we have a stripeCustomerId for the user
  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  let customerId = user.stripeCustomerId || null;
  if (!customerId) {
    const customer = await stripe.customers.create({ email: session.user.email });
    customerId = customer.id;
    await prisma.user.update({
      where: { id: session.user.id },
      data: { stripeCustomerId: customerId },
    });
  }

  const portal = await stripe.billingPortal.sessions.create({
    customer: customerId as string,
    return_url: `${process.env.NEXT_PUBLIC_APP_URL}/minha-conta`,
  });

  return NextResponse.json({ url: portal.url });
}
