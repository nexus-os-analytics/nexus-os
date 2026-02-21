import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getPlanLimits } from '@/features/billing/entitlements';
import { BlingIntegration, createBlingRepository } from '@/lib/bling';
import { authOptions } from '@/lib/next-auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const planTier = session.user?.planTier ?? 'FREE';
    const integration = await BlingIntegration.getBlingIntegration(userId);

    // If integration is missing, return an empty overview to keep UX stable
    if (!integration) {
      const base = {
        capitalStuck: 0,
        ruptureCount: 0,
        opportunityCount: 0,
        topActions: [],
      };
      if (planTier === 'FREE') {
        const limits = getPlanLimits('FREE');
        return NextResponse.json({
          ...base,
          productCount: 0,
          productLimit: limits.products === 'unlimited' ? null : limits.products,
        });
      }
      return NextResponse.json(base);
    }

    const blingRepository = createBlingRepository({ integrationId: integration.id });
    const result = await blingRepository.getOverviewMetrics({ integrationId: integration.id });

    if (planTier === 'FREE') {
      const productCount = await prisma.blingProduct.count({
        where: { integrationId: integration.id },
      });
      const limits = getPlanLimits('FREE');
      return NextResponse.json({
        ...result,
        productCount,
        productLimit: limits.products === 'unlimited' ? null : limits.products,
      });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('[overview-metrics]', err);
    return NextResponse.json({ error: 'Erro ao buscar dados da visão geral.' }, { status: 500 });
  }
}
