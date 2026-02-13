import { NextResponse } from 'next/server';
import pino from 'pino';
import { APP_URL } from '@/lib/constants';
import prisma from '@/lib/prisma';
import { getStripe } from '@/lib/stripe';

const logger = pino();

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
      success_url: `${APP_URL}/stripe/success`,
      cancel_url: `${APP_URL}/stripe/cancelado`,
      allow_promotion_codes: true,
      subscription_data: {
        metadata: { userId: user.id, planTier: 'PRO' },
      },
    });

    return NextResponse.json({ url: checkout.url });
  } catch (err) {
    const error = err instanceof Error ? err : new Error(String(err));
    logger.error(
      { err: error, email: (err as { email?: string }).email },
      'Failed to create anonymous checkout session'
    );
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
