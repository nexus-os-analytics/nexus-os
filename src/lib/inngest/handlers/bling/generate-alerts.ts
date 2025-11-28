// src/handlers/generate-alerts.ts

import { BlingSyncStatus } from '@prisma/client';
import pino from 'pino';
import { evaluateAllProducts } from '@/lib/bling';
import type {
  Product as EngineProduct,
  SalesHistory as EngineSale,
  StockBalance as EngineStock,
  ProductEvaluation,
} from '@/lib/bling/bling-types';
import prisma from '@/lib/prisma';
import { inngest } from '../../client';

const logger = pino();

/** Helper maps */
function mapToRiskEnum(risk?: 'low' | 'medium' | 'high') {
  if (!risk) return 'LOW';
  if (risk === 'high') return 'CRITICAL';
  if (risk === 'medium') return 'HIGH';
  return 'LOW';
}

function mapToRiskLabel(risk?: 'low' | 'medium' | 'high') {
  if (!risk) return 'baixo';
  if (risk === 'high') return 'crítico';
  if (risk === 'medium') return 'médio';
  return 'baixo';
}

/** tipo do alerta legível */
function mapToAlertType(ev: Partial<ProductEvaluation>) {
  const action = (ev.recommendation?.action ?? '').toLowerCase();
  const recs = (ev.recommendationsStrings ?? []).join(' ').toLowerCase();

  if (
    action.includes('reorder') ||
    recs.includes('reorder') ||
    action.includes('rupture') ||
    recs.includes('repor')
  )
    return 'RUPTURE';
  if (
    action.includes('liquidate') ||
    recs.includes('liquidate') ||
    recs.includes('liquidar') ||
    recs.includes('money stuck') ||
    recs.includes('capital parado') ||
    recs.includes('encalhado')
  )
    return 'DEAD_STOCK';
  return 'OPPORTUNITY';
}

/** Build salesBySku map expected by engine */
function buildSalesBySkuMap(
  salesRows: Array<{
    id: string;
    blingSaleId: string | null;
    date: Date;
    productId: string | null;
    productSku: string | null;
    quantity: number;
    totalValue: number;
  }>,
  skuToBlingId: Record<string, number>
): Record<string, EngineSale[]> {
  const bySku: Record<string, EngineSale[]> = {};
  for (const s of salesRows) {
    const sku = s.productSku ?? 'unknown';
    const blingProductId = skuToBlingId[sku] ?? 0;
    const engineSale: EngineSale = {
      id: Number(s.blingSaleId) || 0,
      date: s.date.toISOString(),
      productId: blingProductId,
      productSku: sku,
      quantity: s.quantity,
      totalValue: s.totalValue,
    };
    if (!bySku[sku]) bySku[sku] = [];
    bySku[sku].push(engineSale);
  }
  for (const k of Object.keys(bySku)) {
    bySku[k].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }
  return bySku;
}

/** Map DB product -> engine product (product.id MUST be numeric bling id) */
function mapToEngineProductRow(p: any): EngineProduct {
  const blingIdNum = Number(p.blingProductId) || 0;
  return {
    id: blingIdNum,
    name: p.name,
    sku: p.sku,
    costPrice: p.costPrice ?? 0,
    salePrice: p.salePrice ?? 0,
    stock: p.stock ?? 0,
    image: p.image ?? null,
    shortDescription: p.shortDescription ?? null,
    avgMonthlySales: p.avgMonthlySales ?? 0,
    lastSaleDate: p.lastSaleDate ? p.lastSaleDate.toISOString() : null,
    categoryId: null,
  };
}

/** Map DB stock balances -> engine stock balances (engine expects numeric bling id in productId) */
function mapStockBalancesToEngine(
  stockRows: Array<{ productId: string; productSku: string; stock: number }>,
  dbIdToBlingId: Record<string, number>
): EngineStock[] {
  return stockRows.map((s) => {
    const blingId = dbIdToBlingId[s.productId] ?? 0;
    return {
      productId: blingId,
      productSku: s.productSku,
      stock: s.stock,
    };
  });
}

/** sanitize metrics to avoid Infinity / NaN in JSON fields */
function sanitizeMetrics(maybe: any) {
  const out: Record<string, any> = {};
  if (!maybe || typeof maybe !== 'object') return maybe;
  for (const [k, v] of Object.entries(maybe)) {
    if (typeof v === 'number') {
      out[k] = Number.isFinite(v) ? v : null;
    } else {
      out[k] = v;
    }
  }
  return out;
}

export const generateAlerts = inngest.createFunction(
  { id: 'bling/generate-alerts' },
  { event: 'bling/generate-alerts' },
  async ({ event, step }) => {
    const { integrationId, userId, jobId } = event.data as {
      integrationId: string;
      userId?: string;
      jobId?: string;
    };

    logger.info(`[bling/generate-alerts] start for user ${userId} integration ${integrationId}`);

    try {
      // 1) Load DB data
      const products = await prisma.blingProduct.findMany({
        where: { integrationId },
        include: { stockBalances: true },
      });

      if (!products || products.length === 0) {
        logger.info(`[bling/generate-alerts] no products for integration ${integrationId}`);
        return;
      }

      const productDbIds = products.map((p) => p.id);
      const sales = await prisma.blingSalesHistory.findMany({
        where: { productId: { in: productDbIds } },
        orderBy: { date: 'asc' },
      });
      const stockBalances = await prisma.blingStockBalance.findMany({
        where: { productId: { in: productDbIds } },
      });

      // 2) build maps
      const skuToBlingId: Record<string, number> = {};
      const dbIdToBlingId: Record<string, number> = {};
      const blingIdToDbId: Record<number, string> = {};
      for (const p of products) {
        const blingIdNum = Number(p.blingProductId) || 0;
        skuToBlingId[p.sku] = blingIdNum;
        dbIdToBlingId[p.id] = blingIdNum;
        if (blingIdNum) blingIdToDbId[blingIdNum] = p.id;
      }

      // 3) map to engine shapes
      const engineProducts: EngineProduct[] = products.map(mapToEngineProductRow);
      const salesBySku = buildSalesBySkuMap(
        sales.map((s) => ({
          id: s.id,
          blingSaleId: s.blingSaleId ?? null,
          date: s.date,
          productId: s.productId ?? null,
          productSku: s.productSku ?? '',
          quantity: s.quantity,
          totalValue: s.totalValue,
        })),
        skuToBlingId
      );
      const engineStockBalances = mapStockBalancesToEngine(
        stockBalances.map((s) => ({
          productId: s.productId,
          productSku: s.productSku,
          stock: s.stock,
        })),
        dbIdToBlingId
      );

      // 4) run engine (same behavior as PoC)
      logger.info(`[bling/generate-alerts] running engine for ${engineProducts.length} products`);
      const evaluations: ProductEvaluation[] = await evaluateAllProducts(
        engineProducts,
        salesBySku,
        engineStockBalances
      );

      // 5) persist: upsert per productId (we made productId unique in prisma schema)
      const upserted: string[] = [];
      for (const ev of evaluations) {
        const blingNumericId = ev.productId;
        const internalProductId = blingIdToDbId[blingNumericId];

        if (!internalProductId) {
          logger.warn(`[bling/generate-alerts] no internal product for bling id ${blingNumericId}`);
          continue;
        }

        const recommendationsStrings = ev.recommendationsStrings ?? [];
        const alertType = mapToAlertType(ev);
        const riskEnumValue = mapToRiskEnum(ev.recommendation?.risk) as any; // Prisma enum
        const riskLabel = mapToRiskLabel(ev.recommendation?.risk);

        // sanitize metrics & finalRecommendation to ensure JSON-serializable numbers
        const sanitizedMetrics = sanitizeMetrics(ev.metrics ?? {});
        const finalRecommendation = ev.recommendation ?? null;
        const pricing = (ev as any).pricingRecommendation ?? null;

        // upsert by productId (requires productId unique in schema)
        const upsertResult = await prisma.blingAlert.upsert({
          where: { productId: internalProductId },
          create: {
            productId: internalProductId,
            type: alertType as any,
            risk: riskEnumValue,
            riskLabel,
            recommendations: JSON.stringify(recommendationsStrings),
            finalRecommendation: finalRecommendation ? (finalRecommendation as any) : null,
            metrics: sanitizedMetrics,
            pricing: pricing ? pricing : null,
            generatedAt: new Date(),
            jobId: jobId ?? null,
            acknowledged: false,
          },
          update: {
            type: alertType as any,
            risk: riskEnumValue,
            riskLabel,
            recommendations: JSON.stringify(recommendationsStrings),
            finalRecommendation: finalRecommendation ? (finalRecommendation as any) : null,
            metrics: sanitizedMetrics,
            pricing: pricing ? pricing : null,
            generatedAt: new Date(),
            jobId: jobId ?? null,
            acknowledged: false,
          },
        });

        upserted.push(upsertResult.id);
      }

      logger.info(
        `[bling/generate-alerts] upserted ${upserted.length} alerts for integration ${integrationId}`
      );

      // emit completion event
      await step.sendEvent('bling/sync:complete', {
        name: 'bling/sync:complete',
        data: { userId, integrationId, jobId },
      });

      // 6) Done - update user sync status to COMPLETED
      await prisma.user.update({
        where: { id: userId },
        data: { blingSyncStatus: BlingSyncStatus.COMPLETED },
      });
    } catch (err) {
      logger.error({ err, integrationId, jobId }, 'generate-alerts failed');
      throw err;
    }
  }
);
