import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PixPaymentStatus } from '@prisma/client';
import pino from 'pino';
import prisma from '@/lib/prisma';
import {
  PIX_KEY,
  PIX_MERCHANT_NAME,
  PIX_MERCHANT_CITY,
  PIX_PRO_AMOUNT_BRL,
  PIX_PAYMENTS_EMAIL,
} from '@/lib/constants';
import { generatePixPayload } from '@/lib/pix/generatePixPayload';
import { generateQrCodeBase64 } from '@/lib/pix/generateQrCode';
import { authOptions } from '@/lib/next-auth';

const logger = pino();

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  if (!PIX_KEY) {
    logger.error('PIX_KEY environment variable is not set');
    return NextResponse.json(
      { error: 'PIX payment is not configured' },
      { status: 503 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { id: true, email: true, name: true },
  });
  if (!user) {
    return NextResponse.json({ error: 'User not found' }, { status: 404 });
  }

  const amount = PIX_PRO_AMOUNT_BRL;
  const pixExternalId = `pix-${Date.now()}-${user.id.slice(0, 8)}`;

  const payload = generatePixPayload({
    pixKey: PIX_KEY,
    amount,
    merchantName: PIX_MERCHANT_NAME,
    merchantCity: PIX_MERCHANT_CITY,
    txId: pixExternalId,
  });

  const [payment, qrCodeBase64] = await Promise.all([
    prisma.manualPixPayment.create({
      data: {
        userId: user.id,
        amount,
        status: PixPaymentStatus.AGUARDANDO_PAGAMENTO,
        pixKey: PIX_KEY,
        pixExternalId,
        qrCodePayload: payload,
      },
    }),
    generateQrCodeBase64(payload),
  ]);

  logger.info(
    { paymentId: payment.id, userId: user.id, amount },
    'Manual PIX payment created'
  );

  return NextResponse.json({
    id: payment.id,
    amount: Number(payment.amount),
    pixKey: PIX_KEY,
    pixExternalId,
    qrCodeBase64,
    paymentsEmail: PIX_PAYMENTS_EMAIL,
    createdAt: payment.createdAt.toISOString(),
  });
}
