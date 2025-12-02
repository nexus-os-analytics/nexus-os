import prisma from '@/lib/prisma';
import type {
  DashboardFinalRecommendation,
  DashboardFirstImpact,
  DashboardMetrics,
} from '../types';

export async function getDashboardFirstImpact(
  integrationId: string,
  limit: number = 5
): Promise<DashboardFirstImpact> {
  // Buscar todos os alertas mais recentes dos produtos da integração
  const recentAlerts = await prisma.blingAlert.findMany({
    where: {
      product: {
        integrationId: integrationId,
      },
      type: {
        in: ['RUPTURE', 'OPPORTUNITY'],
      },
    },
    include: {
      product: {
        select: {
          name: true,
        },
      },
    },
    orderBy: {
      generatedAt: 'desc',
    },
    // Não usar take aqui, vamos processar todos
  });

  // Agrupar por produto para pegar apenas o alerta mais recente de cada
  const latestAlertsByProduct = new Map();

  for (const alert of recentAlerts) {
    if (!latestAlertsByProduct.has(alert.productId)) {
      latestAlertsByProduct.set(alert.productId, alert);
    }
  }

  const { capitalStuck, ruptureCount, opportunityCount, topActions } = processLatestAlerts(
    Array.from(latestAlertsByProduct.values())
  );

  // Ordenar topActions (por capitalStuck decrescente)
  const sortedTopActions = topActions
    .sort((a, b) => b.metrics.capitalStuck - a.metrics.capitalStuck)
    .slice(0, limit);

  return {
    capitalStuck,
    ruptureCount,
    opportunityCount,
    topActions: sortedTopActions,
  };
}

// Helper function to process alerts and reduce cognitive complexity
function processLatestAlerts(alerts: Array<any>): DashboardFirstImpact {
  let capitalStuck = 0;
  let ruptureCount = 0;
  let opportunityCount = 0;
  const topActions: Array<{
    productName: string;
    action: string;
    metrics: DashboardMetrics;
  }> = [];

  for (const alert of alerts) {
    // Extrair métricas do campo JSON
    const metrics = JSON.parse(alert.metrics || '{}') as DashboardMetrics;

    // Calcular capital parado
    if (metrics?.capitalStuck) {
      capitalStuck += Number(metrics.capitalStuck) || 0;
    }

    // Contar tipos de alertas
    if (alert.type === 'RUPTURE') {
      ruptureCount++;
    } else if (alert.type === 'OPPORTUNITY') {
      opportunityCount++;
    }

    // Extrair finalRecommendation para ações
    const finalRec = JSON.parse(alert.finalRecommendation || '{}') as DashboardFinalRecommendation;

    // Adicionar às topActions se houver recomendação e métricas
    if (finalRec?.action && metrics) {
      topActions.push({
        productName: alert.product.name,
        action: String(finalRec.action),
        metrics: {
          idleDays: Number(metrics.idleDays) || 0,
          stockTurnover: Number(metrics.stockTurnover) || 0,
          stockCoverageDays: Number(metrics.stockCoverageDays) || 0,
          trend: Number(metrics.trend) || 0,
          capitalStuck: Number(metrics.capitalStuck) || 0,
          daysRemaining: Number(metrics.daysRemaining) || 0,
        },
      });
    }
  }

  return { capitalStuck, ruptureCount, opportunityCount, topActions: topActions.slice(0, 3) };
}
