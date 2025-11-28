import { type NextRequest, NextResponse } from 'next/server';
import type {
  AlertMetrics,
  InfiniteAlertsResponse,
  PricingRecommendation,
  Product,
  ProductAlert,
} from '@/features/dashboard/types';
import prisma from '@/lib/prisma';

const PAGE_SIZE_DEFAULT = 20;

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);

  const limit = Number(searchParams.get('limit')) || PAGE_SIZE_DEFAULT;
  const cursor = searchParams.get('cursor'); // ISO timestamp or id

  const cursorQuery = cursor
    ? {
        generatedAt: {
          lt: new Date(cursor),
        },
      }
    : {};

  const alerts = await prisma.blingAlert.findMany({
    where: {
      ...cursorQuery,
    },
    orderBy: [{ generatedAt: 'desc' }, { id: 'desc' }],
    take: limit + 1,
    include: {
      product: {
        include: {
          settings: true,
          stockBalances: true,
        },
      },
    },
  });

  const hasMore = alerts.length > limit;
  const paginated = hasMore ? alerts.slice(0, -1) : alerts;

  const mapped: ProductAlert[] = paginated.map((alert) => {
    const product = alert.product;
    // Campos extras persistidos como JSON em BlingAlert
    const extra = alert as unknown as {
      idleDays?: number;
      stockCoverageDays?: number;
      stockTurnover?: number;
      vvd?: number;
      vvd7?: number;
      vvd30?: number;
      vvd90?: number;
      trend?: number;
      capitalStuck?: number;
      dataConfidence?: number;
      pricingSuggestion?: any;
      finalRecommendation?: any;
    };

    const productObj: Product = {
      id: product.id,
      blingProductId: product.blingProductId ? Number(product.blingProductId) : undefined,
      sku: product.sku ?? '',
      name: product.name ?? '',
      imageUrl: product.image ?? undefined,
      shortDescription: product.shortDescription ?? undefined,
      categoryName: 'Sem categoria',
      costPrice: product.costPrice ?? undefined,
      salePrice: product.salePrice ?? undefined,
      stock: product.stock ?? 0,
      avgMonthlySales: product.avgMonthlySales ?? null,
      lastSaleDate: product.lastSaleDate?.toISOString() ?? null,
      integrationId: product.integrationId ?? undefined,
      productSettings: product.settings
        ? {
            leadTimeDays: product.settings.leadTimeDays ?? undefined,
            safetyDays: product.settings.safetyDays ?? undefined,
            recoveryTarget: product.settings.recoveryTarget ?? undefined,
            opportunityGrowthThreshold: product.settings.opportunityGrowthThreshold ?? undefined,
            liqdationIdleThresholdDays: product.settings.liquidationIdleThresholdDays ?? undefined,
            minSalesForOpportunity: product.settings.minSalesForOpportunity ?? undefined,
            newProductMinDays: product.settings.newProductMinDays ?? undefined,
          }
        : null,
    };

    // recomputar métricas ou mapear do banco se estiverem persistidas
    const metrics: AlertMetrics = {
      idleDays: extra.idleDays ?? 0,
      stockCoverageDays: extra.stockCoverageDays ?? Infinity,
      stockTurnover: extra.stockTurnover ?? 0,
      vvd: extra.vvd ?? undefined,
      vvd7: extra.vvd7 ?? undefined,
      vvd30: extra.vvd30 ?? undefined,
      vvd90: extra.vvd90 ?? undefined,
      trend: extra.trend ?? undefined,
      capitalStuck: extra.capitalStuck ?? undefined,
      dataConfidence: extra.dataConfidence ?? undefined,
    };

    const pricing: PricingRecommendation | null = extra.pricingSuggestion
      ? {
          optimalPrice: extra.pricingSuggestion.optimalPrice ?? undefined,
          capitalRecoveryPercent: extra.pricingSuggestion.capitalRecoveryPercent ?? undefined,
          probabilityOfSale: extra.pricingSuggestion.probabilityOfSale ?? undefined,
          recommendedDays: extra.pricingSuggestion.recommendedDays ?? undefined,
          discountPercent: extra.pricingSuggestion.discountPercent ?? undefined,
          expectedRevenue: extra.pricingSuggestion.expectedRevenue ?? undefined,
          scenarios: extra.pricingSuggestion.scenarios ?? undefined,
          feasible: extra.pricingSuggestion.feasible ?? undefined,
          reasonNotFeasible: extra.pricingSuggestion.reasonNotFeasible ?? null,
        }
      : null;

    return {
      id: alert.id,
      productId: alert.productId,
      blingProductId: alert.productId ? Number(alert.productId) : undefined,
      type: alert.type as any,
      typeLabel:
        alert.type === 'RUPTURE'
          ? 'Ruptura'
          : alert.type === 'DEAD_STOCK'
            ? 'Dinheiro parado'
            : 'Oportunidade',
      risk: alert.risk as any,
      riskLabel: alert.risk?.toLowerCase() as any,
      recommendationsStrings: Array.isArray(alert.recommendations)
        ? (alert.recommendations as string[])
        : [],
      finalRecommendation: extra.finalRecommendation ?? null,
      product: productObj,
      metrics,
      pricingRecommendation: pricing,
      acknowledged: alert.acknowledged ?? undefined,
      executedAt: alert.executedAt?.toISOString() ?? null,
      generatedAt: alert.generatedAt.toISOString(),
      createdAt: alert.createdAt?.toISOString() ?? undefined,
      updatedAt: alert.updatedAt?.toISOString() ?? undefined,
    };
  });

  const nextCursor = hasMore ? paginated[paginated.length - 1].generatedAt.toISOString() : null;

  const response: InfiniteAlertsResponse = {
    data: mapped,
    nextCursor,
    hasMore,
    total: undefined,
  };

  return NextResponse.json(response);
}
