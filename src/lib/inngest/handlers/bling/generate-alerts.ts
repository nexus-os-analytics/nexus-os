// src/handlers/generate-alerts.ts
import pino from 'pino';
import { evaluateAllProducts } from '@/lib/bling';
import type {
  Product as EngineProduct,
  SalesHistory as EngineSale,
  StockBalance as EngineStock,
} from '@/lib/bling/bling-types'; // ajuste o path se necessário
import prisma from '@/lib/prisma';
import { inngest } from '../../client';

const logger = pino();

/**
 * Map engine risk ('low'|'medium'|'high') to Prisma BlingRuptureRisk enum values
 */
function mapToRiskEnum(risk?: 'low' | 'medium' | 'high') {
  if (!risk) return 'LOW';
  if (risk === 'high') return 'CRITICAL';
  if (risk === 'medium') return 'HIGH';
  return 'LOW';
}

/**
 * Map evaluation to BlingAlertType heuristic
 */
function mapToAlertType(ev: {
  recommendation?: { action?: string };
  recommendationsStrings?: string[];
}) {
  const action = (ev.recommendation?.action ?? '').toLowerCase();
  const recs = (ev.recommendationsStrings ?? []).join(' ').toLowerCase();

  if (action.includes('reorder') || recs.includes('reorder') || action.includes('rupture'))
    return 'RUPTURE';
  if (
    action.includes('liquidate') ||
    recs.includes('liquidate') ||
    recs.includes('money stuck') ||
    recs.includes('encalhado')
  )
    return 'DEAD_STOCK';
  return 'OPPORTUNITY';
}

/**
 * Build salesBySku: Record<string, EngineSale[]>
 * Map DB rows to engine SalesHistory shape and group by SKU
 */
function buildSalesBySkuMap(
  salesRows: Array<{
    id: string;
    blingSaleId: string | null;
    date: Date;
    productId: string | null; // DB internal product id (UUID)
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

  // ensure chronological order (important for VVD and trend)
  for (const k of Object.keys(bySku)) {
    bySku[k].sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  }

  return bySku;
}

/**
 * Map Prisma BlingProduct -> engine Product
 * product.id MUST be the numeric blingProductId (external id) because price-engine uses it
 * to lookup product settings (getProductSettings expects blingId as number)
 */
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
    categoryId: null, // category external id not available as number; keep null
  };
}

/**
 * Map DB stock balances (prisma) to engine StockBalance[]
 * Engine expects productId = numeric bling id
 */
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

export const generateAlerts = inngest.createFunction(
  { id: 'bling/generate-alerts' },
  { event: 'bling/generate-alerts' },
  async ({ event, step }) => {
    const { integrationId, userId, jobId } = event.data as {
      integrationId: string;
      userId?: string;
      jobId?: string;
    };

    logger.info(`[bling/generate-alerts] generate-alerts started for user ${userId}`);

    try {
      // 1) Load relevant DB data
      const products = await prisma.blingProduct.findMany({
        where: { integrationId },
        include: { stockBalances: true },
      });

      if (!products.length) {
        logger.info(`[bling/generate-alerts] no products found for user ${userId}`);
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

      // 2) Build mappings: sku -> blingId, dbId -> blingId, blingId -> dbId
      const skuToBlingId: Record<string, number> = {};
      const dbIdToBlingId: Record<string, number> = {};
      const blingIdToDbId: Record<number, string> = {};

      for (const p of products) {
        const blingIdNum = Number(p.blingProductId) || 0;
        skuToBlingId[p.sku] = blingIdNum;
        dbIdToBlingId[p.id] = blingIdNum;
        if (blingIdNum) blingIdToDbId[blingIdNum] = p.id;
      }

      // 3) Map DB rows -> engine shapes
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

      // 4) Run rules engine (price-engine)
      logger.info(
        `[bling/generate-alerts] products found user ${userId}: ${engineProducts.length}`
      );
      const evaluations = await evaluateAllProducts(
        engineProducts,
        salesBySku,
        engineStockBalances
      );

      // 5) Persist alerts: upsert per product
      const upsertedAlerts: string[] = [];

      for (const ev of evaluations) {
        const blingNumericId = ev.productId;
        const internalProductId = blingIdToDbId[blingNumericId];

        if (!internalProductId) {
          logger.warn(
            `[bling/generate-alerts] could not find internal product ID for bling ID ${blingNumericId}, skipping alert generation`
          );
          continue;
        }

        const recs = ev.recommendationsStrings ?? [];
        const alertType = mapToAlertType(ev);
        const risk = mapToRiskEnum(ev.recommendation?.risk);

        const existingAlert = await prisma.blingAlert.findFirst({
          where: { productId: internalProductId },
        });

        if (existingAlert) {
          const updated = await prisma.blingAlert.update({
            where: { id: existingAlert.id },
            data: {
              type: alertType,
              risk,
              recommendations: recs,
              generatedAt: new Date(),
            },
          });

          upsertedAlerts.push(updated.id);
        } else {
          const created = await prisma.blingAlert.create({
            data: {
              productId: internalProductId,
              type: alertType,
              risk,
              recommendations: recs,
              generatedAt: new Date(),
            },
          });

          upsertedAlerts.push(created.id);
        }
      }

      logger.info(
        `[bling/generate-alerts] upserted ${upsertedAlerts.length} alerts for user ${userId}`
      );

      // emit completion event for UI/analytics
      await step.sendEvent('bling/sync:complete', {
        name: 'bling/sync:complete',
        data: { userId, integrationId, jobId },
      });
    } catch (err) {
      logger.error({ err, integrationId, jobId }, 'generate-alerts failed');
      throw err;
    }
  }
);
