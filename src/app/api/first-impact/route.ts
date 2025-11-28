import { BlingAlertType } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { authOptions } from '@/lib/next-auth';
import prisma from '@/lib/prisma';
import type { FirstImpactData } from '@/types';

const RISK_ORDER = {
  CRITICAL: 3,
  HIGH: 2,
  LOW: 1,
};

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

    // Carrega todos os alerts ativos junto com produto
    const alerts = await prisma.blingAlert.findMany({
      where: {
        product: { integration: { userId } },
      },
      include: {
        product: true,
      },
    });

    // Rupturas
    const ruptureCount = alerts.filter((a) => a.type === BlingAlertType.RUPTURE).length;

    // Oportunidades
    const opportunityCount = alerts.filter((a) => a.type === BlingAlertType.OPPORTUNITY).length;

    // Capital parado = produtos DEAD_STOCK * custo * estoque
    const capitalTied = alerts
      .filter((a) => a.type === BlingAlertType.DEAD_STOCK)
      .reduce((sum, a) => {
        const p = a.product;
        if (!p) return sum;
        // Usa costPrice, se não houver, usa salePrice, se não houver, 0
        const unitValue = p.costPrice || p.salePrice || 0;
        return sum + (p.stock ?? 0) * unitValue;
      }, 0);

    // Top Actions (prioridade: risk desc -> novo primeiro)
    const topActionsRaw = [...alerts]
      .sort((a, b) => {
        const rA = a.risk ? (RISK_ORDER[a.risk as keyof typeof RISK_ORDER] ?? 0) : 0;
        const rB = b.risk ? (RISK_ORDER[b.risk as keyof typeof RISK_ORDER] ?? 0) : 0;
        if (rA !== rB) return rB - rA;
        return new Date(b.generatedAt).getTime() - new Date(a.generatedAt).getTime();
      })
      .slice(0, 3);

    const topActions = topActionsRaw.map((a) => {
      const p = a.product;

      let action = '';
      if (a.type === 'RUPTURE') action = 'Repor estoque urgentemente';
      else if (a.type === 'DEAD_STOCK') action = 'Aplicar liquidação controlada';
      else if (a.type === 'OPPORTUNITY') action = 'Impulsionar campanha de alta';

      return {
        productName: p?.name ?? 'Produto',
        action,
        impact: `Estoque: ${p?.stock ?? 0} un, Margem: ${((((p?.salePrice ?? 0) - (p?.costPrice ?? 0)) / (p?.salePrice || 1)) * 100).toFixed(1)}%`,
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
