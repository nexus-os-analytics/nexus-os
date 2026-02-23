import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getPermissions } from '@/features/auth/services';
import prisma from '@/lib/prisma';
import { authOptions } from '@/lib/next-auth';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Not authenticated' }, { status: 401 });
  }

  const allowedRoles = getPermissions('payments.read') as string[];
  const canRead =
    allowedRoles.length > 0 && allowedRoles.includes(session.user.role as string);
  if (!canRead) {
    return NextResponse.json(
      { error: 'Acesso negado. Apenas administradores podem listar pagamentos.' },
      { status: 403 }
    );
  }

  const { searchParams } = new URL(req.url);
  const status = searchParams.get('status') ?? undefined;
  const page = Math.max(1, Number(searchParams.get('page') ?? '1'));
  const pageSize = Math.min(50, Math.max(1, Number(searchParams.get('pageSize') ?? '20')));
  const skip = (page - 1) * pageSize;

  const where = status ? { status: status as 'AGUARDANDO_PAGAMENTO' | 'PAGAMENTO_CONFIRMADO' | 'PAGAMENTO_RECUSADO' | 'EXPIRADO' } : undefined;

  const [items, total] = await Promise.all([
    prisma.manualPixPayment.findMany({
      where,
      orderBy: { createdAt: 'desc' },
      skip,
      take: pageSize,
      include: {
        user: { select: { id: true, name: true, email: true } },
      },
    }),
    prisma.manualPixPayment.count({ where }),
  ]);

  return NextResponse.json({
    items: items.map((p) => ({
      id: p.id,
      amount: Number(p.amount),
      status: p.status,
      pixExternalId: p.pixExternalId,
      createdAt: p.createdAt.toISOString(),
      updatedAt: p.updatedAt.toISOString(),
      user: p.user,
    })),
    total,
    page,
    pageSize,
  });
}
