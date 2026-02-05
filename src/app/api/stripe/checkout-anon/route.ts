import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';
import { getStripe } from '@/lib/stripe';

export async function POST(req: Request) {
  try {
    const { email } = (await req.json()) as { email?: string };
    if (!email) {
      return NextResponse.json({ error: 'E-mail é obrigatório' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    const priceId = process.env.STRIPE_PRICE_PRO_MONTHLY;
    if (!priceId) {
      return NextResponse.json({ error: 'Missing STRIPE_PRICE_PRO_MONTHLY' }, { status: 500 });
    }

    const stripe = getStripe();
    const checkout = await stripe.checkout.sessions.create({
      mode: 'subscription',
      customer_email: email,
      line_items: [{ price: priceId, quantity: 1 }],
      success_url: `${process.env.NEXT_PUBLIC_APP_URL}/login?checkout=success`,
      cancel_url: `${process.env.NEXT_PUBLIC_APP_URL}/precos`,
      allow_promotion_codes: true,
      subscription_data: {
        metadata: { userId: user.id, planTier: 'PRO' },
      },
    });

    return NextResponse.json({ url: checkout.url });
  } catch (err) {
    console.error('checkout-anon error', err);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
