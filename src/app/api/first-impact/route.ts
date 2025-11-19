import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/next-auth';
import prisma from '@/lib/prisma';
import type { FirstImpactData } from '@/types';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.email) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { email: session.user.email },
      select: { id: true },
    });
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado.' }, { status: 404 });
    }

    const userId = user.id;

    // Capital parado
    const capitalTiedAgg = await prisma.productAlert.aggregate({
      _sum: { capitalTied: true },
      where: {
        type: 'dead_stock',
        daysSinceLastSale: { gte: 30 },
        integration: { userId },
      },
    });
    const capitalTied = Number(capitalTiedAgg._sum.capitalTied ?? 0);

    // Ruptura
    const ruptureCount = await prisma.productAlert.count({
      where: {
        type: 'rupture',
        daysRemaining: { lte: 3 },
        integration: { userId },
      },
    });

    // Oportunidades
    const opportunityCount = await prisma.productAlert.count({
      where: {
        type: 'opportunity',
        salesGrowth: { gt: 0 },
        integration: { userId },
      },
    });

    // Top ações (3 melhores)
    const topActionsRaw = await prisma.productAlert.findMany({
      where: {
        integration: { userId },
        OR: [{ type: 'rupture' }, { type: 'dead_stock' }, { type: 'opportunity' }],
      },
      orderBy: [{ type: 'asc' }, { salesGrowth: 'desc' }],
      take: 3,
      select: {
        productName: true,
        type: true,
        salesGrowth: true,
        category: true,
      },
    });

    const topActions = topActionsRaw.map((p) => {
      let action = '';
      if (p.type === 'rupture') action = 'Repor estoque urgentemente';
      else if (p.type === 'dead_stock') action = 'Aplicar liquidação controlada';
      else if (p.type === 'opportunity') action = 'Impulsionar campanha de alta';

      return {
        productName: p.productName,
        action,
        impact: `Categoria: ${p.category}, Crescimento: ${p.salesGrowth ?? 0}%`,
      };
    });

    const data: FirstImpactData = {
      capitalTied,
      ruptureCount,
      opportunityCount,
      topActions,
    };

    return NextResponse.json(data);
  } catch (err) {
    console.error('[first-impact]', err);
    return NextResponse.json({ error: 'Erro ao buscar dados do First Impact.' }, { status: 500 });
  }
}
