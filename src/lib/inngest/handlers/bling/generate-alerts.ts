import { BlingSyncStatus } from '@prisma/client';
import pino from 'pino';
import {
  calculateAllMetrics,
  createBlingRepository,
  getDaysWithSales,
  getLastSaleDate,
  getTotalLastSales,
  getTotalSales,
} from '@/lib/bling';
import prisma from '@/lib/prisma';
import { inngest } from '../../client';

// Named time window constants to avoid magic numbers
const DAYS_IN_30 = 30;
const DAYS_IN_7 = 7;
const DEFAULT_COST_FACTOR = 0.8;

const logger = pino();

function resolveCurrentStock(
  productStock: number | null | undefined,
  stockBalanceStock: number | null | undefined,
  stockBalanceUpdatedAt: Date | string | null | undefined,
  lastSaleDate: Date | null
): number {
  const balanceIsOlderThanLastSale = Boolean(
    stockBalanceUpdatedAt &&
      lastSaleDate &&
      new Date(stockBalanceUpdatedAt).getTime() < new Date(lastSaleDate).getTime()
  );
  if (balanceIsOlderThanLastSale) return productStock ?? 0;
  return stockBalanceStock ?? productStock ?? 0;
}

function getDaysWithSalesWithinWindow(sales: { date: Date | string }[], days: number): number {
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(now.getDate() - days);
  const uniqueDays = new Set(
    sales
      .filter((s) => new Date(s.date) >= cutoff)
      .map((s) => new Date(s.date).toISOString().split('T')[0])
  );
  return uniqueDays.size;
}

function inferStockOutDate(
  hasStockOut: boolean,
  stockBalanceStock: number | null | undefined,
  stockBalanceUpdatedAt: Date | string | null | undefined,
  lastSaleDate: Date | null
): Date | undefined {
  if (!hasStockOut) return undefined;
  if (stockBalanceStock === 0 && stockBalanceUpdatedAt) return new Date(stockBalanceUpdatedAt);
  return lastSaleDate ?? undefined;
}

export const generateAlerts = inngest.createFunction(
  {
    id: 'bling/generate-alerts',
    concurrency: 1,
  },
  { event: 'bling/generate-alerts' },
  async ({ event, step }) => {
    const { integrationId, userId, jobId } = event.data;

    try {
      const blingRepository = createBlingRepository({
        integrationId: integrationId,
      });
      const result = {
        alertsGenerated: 0,
        errorsCount: 0,
        totalProducts: 0,
      };

      logger.info(
        `[bling/generate-alerts] Starting alert generation for integration ${integrationId}, user ${userId}, job ${jobId}`
      );

      const take = 100;
      let skip = 0;

      while (true) {
        const products = await blingRepository.getProducts(take, skip);

        if (products.length === 0) {
          break;
        }

        for (const product of products) {
          logger.info(
            `[bling/generate-alerts] Processing product ${product.blingProductId} for integration ${integrationId}`
          );

          const [sales, stockBalance, productSettings] = await Promise.all([
            blingRepository.getSaleHistoryByProductId(product.blingProductId),
            blingRepository.getStockBalanceByProductId(product.blingProductId),
            blingRepository.getProductSettings(product.blingProductId),
          ]);

          const lastSaleDate = getLastSaleDate(sales) ?? null;

          const currentStockForCalc = resolveCurrentStock(
            product.currentStock,
            stockBalance?.stock,
            stockBalance?.updatedAt ?? null,
            lastSaleDate
          );

          const salePrice = product.salePrice || 0;
          const costFallbackFactor = productSettings?.costFactor ?? DEFAULT_COST_FACTOR;
          const costPrice = salePrice * costFallbackFactor;
          const currentStock = currentStockForCalc;
          const daysWithSales = getDaysWithSales(sales);
          const totalSales = getTotalSales(sales);
          const hasStockOut = currentStockForCalc === 0;

          // Compute windowed totals and unique sale days within windows
          const totalLast30DaysSales = getTotalLastSales(sales, DAYS_IN_30);
          const totalLast7DaysSales = getTotalLastSales(sales, DAYS_IN_7);
          const daysWithSalesWithinLast30 = getDaysWithSalesWithinWindow(sales, DAYS_IN_30);
          const daysWithSalesWithinLast7 = getDaysWithSalesWithinWindow(sales, DAYS_IN_7);

          // Infer stock-out date when zero stock
          const stockOutDate = inferStockOutDate(
            hasStockOut,
            stockBalance?.stock,
            stockBalance?.updatedAt ?? null,
            lastSaleDate
          );

          const productMetrics = calculateAllMetrics(
            {
              costPrice,
              salePrice,
              currentStock,
              daysWithSales,
              totalSales,
              hasStockOut,
              lastSaleDate,
              totalLast30DaysSales,
              totalLast7DaysSales,
              stockOutDate,
              daysWithSalesWithinLast30,
              daysWithSalesWithinLast7,
            },
            productSettings
          );

          await blingRepository.upsertProductAlert(product.blingProductId, productMetrics);
        }

        skip += take;
      }

      await step.sendEvent('bling/sync:complete', {
        name: 'bling/sync:complete',
        data: {
          userId,
          integrationId,
          jobId,
          ...result,
        },
      });

      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: { blingSyncStatus: BlingSyncStatus.COMPLETED },
        });
      }

      logger.info(
        `[bling/generate-alerts] Alert generation completed successfully for integration ${integrationId}`
      );
      return result;
    } catch (error) {
      logger.error({ error, integrationId, jobId }, 'Alert generation failed');

      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: { blingSyncStatus: BlingSyncStatus.FAILED },
        });
      }

      throw error;
    }
  }
);
