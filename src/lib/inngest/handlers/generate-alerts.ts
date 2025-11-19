/** biome-ignore-all lint/suspicious/noConsole: <explanation> */
import type { AlertType } from '@prisma/client';
import { createBlingClient } from '@/lib/bling';
import prisma from '@/lib/prisma';
import { inngest } from '../client';

function formatDate(d: Date): string {
  return d.toISOString().slice(0, 10);
}

/**
 * Versão 2 — Geração de alertas inteligentes:
 *  - Risco de Ruptura (critico)
 *  - Dinheiro Parado / Liquidação
 *  - Oportunidades (separadas)
 */
async function generateAlertsHandler() {
  console.log('[generate-alerts:v2] Iniciando geração de alertas...');

  const DAY_MS = 864e5;
  const PERIODS = {
    days90: 90,
    days30: 30,
    days14: 14,
    days7: 7,
    weekDays: 7,
    minGrowth: 30,
    minStockDays: 15,
    mockConfidence: 0.8,
    percent: 100,
  };

  const integrations = await prisma.blingIntegration.findMany({
    include: { user: { include: { userSettings: true } } },
  });
  if (!integrations.length) {
    console.log('[generate-alerts:v2] Nenhuma integração encontrada.');
    return;
  }

  const now = new Date();
  const end = formatDate(now);
  // const start90 = formatDate(new Date(now.getTime() - PERIODS.days90 * DAY_MS));
  const start30 = formatDate(new Date(now.getTime() - PERIODS.days30 * DAY_MS));
  const start14 = formatDate(new Date(now.getTime() - PERIODS.days14 * DAY_MS));
  const start7 = formatDate(new Date(now.getTime() - PERIODS.days7 * DAY_MS));

  for (const integration of integrations) {
    const { id: integrationId, userId, accessToken, user } = integration;
    const client = createBlingClient({ accessToken });
    const settings = user.userSettings ?? {
      capitalCost: 3,
      storageCost: 0.5,
      defaultRestockTime: 15,
      safetyDays: 5,
      recoveryTarget: 80,
      maxRecoveryPeriod: 30,
    };

    console.log(`[generate-alerts:v2] Usuário ${userId} com parâmetros:`, settings);

    const products = await prisma.blingProduct.findMany({ where: { integrationId } });
    if (!products.length) continue;

    // Fetch orders and stock history in parallel
    const [orders30, orders7, ordersPrev7, stockHistory] = await Promise.all([
      client.fetchOrders(start30, end),
      client.fetchOrders(start7, end),
      client.fetchOrders(start14, start7),
      client.fetchStockHistory(products.map((p) => p.blingId)),
    ]);

    // Como não há itens nos pedidos, usamos totalProdutos como proxy de vendas agregadas
    function aggregateSalesByTotalProdutos(orders: Array<any>): number {
      return orders.reduce((acc: number, order: any) => acc + Number(order.totalProdutos ?? 0), 0);
    }

    // Vendas totais no período
    const sold30 = aggregateSalesByTotalProdutos(orders30);
    const sold7 = aggregateSalesByTotalProdutos(orders7);
    const soldPrev7 = aggregateSalesByTotalProdutos(ordersPrev7);

    for (const prod of products) {
      const sku = prod.sku;
      const name = prod.name;
      const stock = prod.stockAmount ?? 0;
      const cost = prod.costPrice ?? 0;
      const price = prod.price ?? 0;
      const category = prod.category ?? 'Sem categoria';

      // Como não temos vendas por SKU, usamos o total agregado para todos os produtos
      const total30 = sold30;
      const last7 = sold7;
      const prev7 = soldPrev7;

      // Stock info from Bling API response
      const stockInfo = stockHistory[sku];
      const daysWithStock = stockInfo ? 1 : 1; // Placeholder, improve if API provides daily history
      const vvd = total30 / daysWithStock;

      // Days of stock remaining
      const der = vvd > 0 ? stock / vvd : Infinity;

      // Weekly growth
      let growth = 0;
      if (prev7 === 0) {
        growth = last7 > 0 ? PERIODS.percent : 0;
      } else {
        growth = ((last7 - prev7) / prev7) * PERIODS.percent;
      }

      // Reorder point
      const reorderPoint = vvd * settings.defaultRestockTime + vvd * settings.safetyDays;

      const alerts: Array<{ type: string; data: Record<string, any> }> = [];

      // Rupture risk
      if (stock <= reorderPoint && stock > 0) {
        let type: AlertType = 'rupture';
        if (der <= settings.safetyDays) type = 'rupture';
        else if (der <= settings.defaultRestockTime) type = 'dead_stock';
        alerts.push({
          type,
          data: {
            productName: name,
            sku,
            category,
            imageUrl: prod.imageUrl,
            daysRemaining: Math.round(der),
            stockAmount: stock,
            vvd,
            replenishmentTime: settings.defaultRestockTime,
            safetyDays: settings.safetyDays,
          },
        });
      }

      // Dead stock / liquidation
      if (total30 === 0 && stock > 0) {
        const capitalTied = cost * stock;
        const capitalCost = settings.capitalCost / PERIODS.percent;
        // const storageCost = settings.storageCost / PERIODS.percent;
        const recoveryGoal = settings.recoveryTarget / PERIODS.percent;
        const liquidationPrice = Math.max(cost * recoveryGoal, cost * (1 + capitalCost));
        alerts.push({
          type: 'dead_stock',
          data: {
            productName: name,
            sku,
            category,
            imageUrl: prod.imageUrl,
            capitalTied,
            costPrice: cost,
            sellingPrice: price,
            recommendedPrice: Number(liquidationPrice.toFixed(2)),
            recoveryPercent: Number(((liquidationPrice / cost) * PERIODS.percent).toFixed(1)),
            daysSinceLastSale: 45, // TODO: calcular pela última venda real
          },
        });
      }

      // Opportunity
      if (growth > PERIODS.minGrowth && der > PERIODS.minStockDays && total30 > 0) {
        alerts.push({
          type: 'opportunity',
          data: {
            productName: name,
            sku,
            category,
            imageUrl: prod.imageUrl,
            salesGrowth: Number(growth.toFixed(1)),
            vvdLast7Days: last7 / PERIODS.weekDays,
            vvdPrevious7Days: prev7 / PERIODS.weekDays,
            confidence: PERIODS.mockConfidence,
          },
        });
      }

      // Persist alerts in DB
      for (const a of alerts) {
        await prisma.productAlert.upsert({
          where: {
            id: prod.id,
          },
          update: { ...a.data, updatedAt: new Date() },
          create: {
            ...a.data,
            type: a.type as AlertType,
            integrationId,
            blingProductId: prod.id,
            productName: name,
            sku: sku,
            category: category,
          },
        });
      }
    }
    console.debug(`[generate-alerts:v2] Concluído para usuário ${userId}`);
  }
  console.debug('[generate-alerts:v2] Finalizado para todas as integrações.');
  return { ok: true };
}

export const generateAlerts = inngest.createFunction(
  { id: 'bling-generate-alerts' },
  { event: 'bling/generate-alerts' },
  async () => {
    await generateAlertsHandler();
  }
);
