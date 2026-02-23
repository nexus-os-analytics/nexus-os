import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getPermissions } from '@/features/auth/services';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/next-auth';

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const { id } = await params;
  const payment = await prisma.manualPixPayment.findUnique({
    where: { id },
    select: {
      id: true,
      userId: true,
      amount: true,
      status: true,
      pixExternalId: true,
      createdAt: true,
      updatedAt: true,
    },
  });

  if (!payment) {
    return NextResponse.json({ error: 'Payment not found' }, { status: 404 });
  }

  const isOwner = payment.userId === session.user.id;
  const allowedRoles = getPermissions('payments.read') as string[];
  const isAdmin =
    allowedRoles.length > 0 && allowedRoles.includes(session.user.role as string);

  if (!isOwner && !isAdmin) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  return NextResponse.json({
    id: payment.id,
    status: payment.status,
    amount: Number(payment.amount),
    pixExternalId: payment.pixExternalId,
    createdAt: payment.createdAt.toISOString(),
    updatedAt: payment.updatedAt.toISOString(),
  });
}
