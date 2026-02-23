import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { PixPaymentStatus } from '@prisma/client';
import pino from 'pino';
import { getPermissions } from '@/features/auth/services';
import { inngest } from '@/lib/inngest/client';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/next-auth';

const logger = pino();

const VALID_NEW_STATUSES: PixPaymentStatus[] = [
  PixPaymentStatus.PAGAMENTO_CONFIRMADO,
  PixPaymentStatus.PAGAMENTO_RECUSADO,
];

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const allowedRoles = getPermissions('payments.write') as string[];
  const canWrite =
    allowedRoles.length > 0 && allowedRoles.includes(session.user.role as string);
  if (!canWrite) {
    return NextResponse.json(
      { error: 'Acesso negado. Apenas administradores podem alterar status.' },
      { status: 403 }
    );
  }

  const { id: paymentId } = await params;
  let body: { status?: string };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid JSON body' }, { status: 400 });
  }

  const newStatus = body.status as PixPaymentStatus | undefined;
  if (!newStatus || !VALID_NEW_STATUSES.includes(newStatus)) {
    return NextResponse.json(
      { error: 'status must be PAGAMENTO_CONFIRMADO or PAGAMENTO_RECUSADO' },
      { status: 400 }
    );
  }

  const payment = await prisma.manualPixPayment.findUnique({
    where: { id: paymentId },
    include: { user: { select: { id: true, email: true, name: true } } },
  });

  if (!payment) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
  }

  if (payment.status !== PixPaymentStatus.AGUARDANDO_PAGAMENTO) {
    return NextResponse.json(
      { error: 'Payment status can no longer be changed' },
      { status: 409 }
    );
  }

  const previousStatus = payment.status;

  await prisma.$transaction(async (tx) => {
    await tx.manualPixPayment.update({
      where: { id: paymentId },
      data: { status: newStatus },
    });

    if (newStatus === PixPaymentStatus.PAGAMENTO_CONFIRMADO) {
      const currentPeriodEnd = new Date();
      currentPeriodEnd.setMonth(currentPeriodEnd.getMonth() + 1);
      await tx.user.update({
        where: { id: payment.userId },
        data: {
          planTier: 'PRO',
          subscriptionStatus: 'active',
          currentPeriodEnd,
          cancelAtPeriodEnd: false,
        },
      });
    }

    await tx.auditLog.create({
      data: {
        userId: session.user!.id,
        action: 'STATUS_UPDATED',
        resource: 'ManualPixPayment',
        payload: {
          paymentId,
          previousStatus,
          newStatus,
        },
      },
    });
  });

  logger.info(
    {
      paymentId,
      previousStatus,
      newStatus,
      adminUserId: session.user.id,
    },
    'PIX payment status updated'
  );

  const eventId = `pix-status-${paymentId}-${Date.now()}`;
  await inngest.send({
    name: 'billing/pix-payment-status-updated',
    data: {
      paymentId,
      userId: payment.userId,
      newStatus,
      userEmail: payment.user.email,
      userName: payment.user.name ?? undefined,
      eventId,
    },
  });

  return NextResponse.json({
    id: paymentId,
    status: newStatus,
  });
}
