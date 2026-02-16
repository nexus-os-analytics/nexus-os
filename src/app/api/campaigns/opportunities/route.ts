/**
 * GET /api/campaigns/opportunities
 *
 * Returns products eligible for LIQUIDATION or OPPORTUNITY campaigns
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/next-auth';
import prisma from '@/lib/prisma';
import type { CampaignOpportunities } from '@/features/campaigns/types';

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const userId = session.user.id;

    // Get products with DEAD_STOCK or LIQUIDATION alerts
    const liquidationProducts = await prisma.blingProduct.findMany({
      where: {
        integration: {
          userId,
        },
        alert: {
          type: {
            in: ['DEAD_STOCK', 'LIQUIDATION'],
          },
        },
      },
      include: {
        alert: true,
      },
      orderBy: [{ alert: { capitalStuck: 'desc' } }, { alert: { excessCapital: 'desc' } }],
      take: 50, // Limit for performance
    });

    // Get products with OPPORTUNITY alerts
    const opportunityProducts = await prisma.blingProduct.findMany({
      where: {
        integration: {
          userId,
        },
        alert: {
          type: 'OPPORTUNITY',
        },
      },
      include: {
        alert: true,
      },
      orderBy: {
        alert: { growthTrend: 'desc' },
      },
      take: 50, // Limit for performance
    });

    // Calculate totals
    const totalAtRisk = liquidationProducts.reduce((sum: number, p) => {
      const capitalStuck = p.alert?.capitalStuck || 0;
      const excessCapital = p.alert?.excessCapital || 0;
      return sum + capitalStuck + excessCapital;
    }, 0);

    const averageGrowth =
      opportunityProducts.length > 0
        ? opportunityProducts.reduce((sum: number, p) => sum + (p.alert?.growthTrend || 0), 0) /
          opportunityProducts.length
        : 0;

    const response: CampaignOpportunities = {
      liquidation: {
        count: liquidationProducts.length,
        products: liquidationProducts,
        totalAtRisk,
      },
      opportunity: {
        count: opportunityProducts.length,
        products: opportunityProducts,
        averageGrowth,
      },
    };

    return NextResponse.json(response);
  } catch (error) {
    console.error('Error fetching campaign opportunities:', error);
    return NextResponse.json(
      { error: 'Erro ao buscar oportunidades de campanha' },
      { status: 500 }
    );
  }
}
