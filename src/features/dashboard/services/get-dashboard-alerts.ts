import type { BlingRuptureRisk, Prisma } from '@prisma/client';
import prisma from '@/lib/prisma';
import type { DashboardProductAlert } from '../types';

interface GetAlertsParams {
  integrationId: string;
  limit?: number;
  cursor?: string; // ISO timestamp or id
  filters?: {
    type?: ('RUPTURE' | 'OPPORTUNITY')[];
    risk?: ('LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL')[];
    acknowledged?: boolean;
  };
}

export async function getDashboardAlerts({
  integrationId,
  limit = 20,
  cursor,
  filters,
}: GetAlertsParams): Promise<{
  data: DashboardProductAlert[];
  nextCursor: string | null;
  hasNextPage: boolean;
}> {
  // Parse cursor - pode ser ID ou timestamp
  let cursorWhere: Prisma.BlingAlertWhereInput | undefined;

  if (cursor) {
    // Verifica se é um ID UUID
    const isUUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(cursor);

    if (isUUID) {
      // Cursor é um ID
      cursorWhere = {
        id: cursor,
      };
    } else {
      // Cursor é um timestamp ISO
      try {
        const cursorDate = new Date(cursor);
        cursorWhere = {
          generatedAt: {
            lt: cursorDate.toISOString(),
          },
        };
      } catch {
        // Caso inválido, ignora o cursor
        cursorWhere = undefined;
      }
    }
  }

  // Build base where clause
  const where: Prisma.BlingAlertWhereInput = {
    AND: [
      {
        product: {
          integrationId: integrationId,
        },
      },
      ...(cursorWhere ? [cursorWhere] : []),
      ...(filters?.type && filters?.type.length > 0 ? [{ type: { in: filters?.type } }] : []),
      ...(filters?.risk && filters?.risk.length > 0 ? [{ risk: { in: filters?.risk } }] : []),
      ...(filters?.acknowledged !== undefined ? [{ acknowledged: filters?.acknowledged }] : []),
    ],
  };

  // Buscar alertas com seus produtos
  const alerts = await prisma.blingAlert.findMany({
    where,
    include: {
      product: {
        include: {
          category: true,
          integration: {
            select: {
              id: true,
              products: { select: { id: true, name: true } },
            },
          },
          settings: true,
        },
      },
    },
    orderBy: [{ generatedAt: 'desc' }, { id: 'desc' }],
    take: limit + 1, // Pegar um extra para verificar se há mais páginas
  });

  // Verificar se há mais páginas
  const hasNextPage = alerts.length > limit;
  const items = hasNextPage ? alerts.slice(0, -1) : alerts;

  // Determinar o próximo cursor
  let nextCursor: string | null = null;
  if (hasNextPage && items.length > 0) {
    const lastItem = items[items.length - 1];
    // Usar generatedAt como cursor (mais consistente para ordenação)
    nextCursor = lastItem.generatedAt.toISOString();
    // Alternativa: usar ID como fallback se generatedAt for igual para múltiplos itens
    // nextCursor = lastItem.id;
  }

  // Converter para o formato DashboardProductAlert
  const data: DashboardProductAlert[] = items.map((alert) => {
    const metrics = alert.metrics as Prisma.JsonObject;
    const finalRecommendation = alert.finalRecommendation as Prisma.JsonObject;
    const recommendations = alert.recommendations as string | null;

    return {
      product: {
        id: alert.product.id,
        blingProductId: alert.product.blingProductId,
        categoryId: alert.product.categoryId,
        name: alert.product.name,
        sku: alert.product.sku,
        costPrice: alert.product.costPrice,
        salePrice: alert.product.salePrice,
        avgMonthlySales: alert.product.avgMonthlySales ?? 0,
        stock: alert.product.stock,
        image: alert.product.image,
        shortDescription: alert.product.shortDescription,
        lastSaleDate: alert.product.lastSaleDate?.toISOString() || null,
        integrationId: alert.product.integrationId,
        createdAt: alert.product.createdAt.toISOString(),
        updatedAt: alert.product.updatedAt.toISOString(),
        // Campos não presentes no schema atual: usar defaults/derivados
        capitalCostRate: 0,
        isActive: true,
        replenishmentTime: Number(alert.product.settings?.leadTimeDays ?? 0),
        safetyStock: Number(alert.product.settings?.safetyDays ?? 0),
        storageCostRate: 0,
        // Dados relacionados opcionais
        category: alert.product.category
          ? {
              id: alert.product.category.id,
              name: alert.product.category.name,
              // Adicione outros campos do category se necessário
            }
          : null,
      },
      alert: {
        id: alert.id,
        productId: alert.productId,
        type: alert.type,
        risk: alert.risk as BlingRuptureRisk,
        riskLabel: alert.riskLabel as string,
        acknowledged: alert.acknowledged,
        executedAt: alert.executedAt?.toISOString() || null,
        generatedAt: alert.generatedAt.toISOString(),
        jobId: alert.jobId as string,
        createdAt: alert.createdAt.toISOString(),
        updatedAt: alert.updatedAt.toISOString(),
        pricing: alert.pricing as any,
        expirationDate: alert.expirationDate?.toISOString() || null,
        financialImpact: alert.financialImpact,
        priority: alert.priority,
        urgencyScore: alert.urgencyScore,
        // Campos parseados do JSON
        finalRecommendation: {
          id: Number(finalRecommendation?.id) || 0,
          action: String(finalRecommendation?.action || ''),
          justification: String(finalRecommendation?.justification || ''),
          estimatedFinancialImpact: String(finalRecommendation?.estimatedFinancialImpact || ''),
          executionTime: String(finalRecommendation?.executionTime || ''),
          risk: String(finalRecommendation?.risk || ''),
          financialImpactValue: Number(finalRecommendation?.financialImpactValue) || 0,
        },
        metrics: {
          idleDays: Number(metrics?.idleDays) || 0,
          stockTurnover: Number(metrics?.stockTurnover) || 0,
          stockCoverageDays: Number(metrics?.stockCoverageDays) || 0,
          trend: Number(metrics?.trend) || 0,
          capitalStuck: Number(metrics?.capitalStuck) || 0,
          daysRemaining: Number(metrics?.daysRemaining) || 0,
        },
        recommendations: recommendations
          ? Array.isArray(recommendations)
            ? recommendations
            : JSON.parse(recommendations)
          : [],
      },
    };
  });

  return {
    data,
    nextCursor,
    hasNextPage,
  };
}
