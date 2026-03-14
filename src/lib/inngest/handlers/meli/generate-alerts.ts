import { MeliSyncStatus } from '@prisma/client';
import pino from 'pino';
import {
  type MeliProductMetrics,
  calculateAllMetrics,
  createMeliRepository,
  getDaysWithSales,
  getLastSaleDate,
  getTotalLastSales,
  getTotalSales,
} from '@/lib/mercado-livre';
import prisma from '@/lib/prisma';
import { inngest } from '../../client';
import {
  getDaysWithSalesWithinWindow,
  inferStockOutDate,
  resolveCurrentStock,
} from './generate-alerts.utils';

// Named time window constants to avoid magic numbers
const DAYS_IN_30 = 30;
const DAYS_IN_7 = 7;
const DEFAULT_COST_FACTOR = 0.8;

const logger = pino();

export const generateAlerts = inngest.createFunction(
  {
    id: 'meli/generate-alerts',
    concurrency: 1,
  },
  { event: 'meli/generate-alerts' },
  async ({ event, step }) => {
    const { integrationId, userId, jobId } = event.data;

    try {
      const meliRepository = createMeliRepository({
        integrationId,
      });
      const result = {
        alertsGenerated: 0,
        errorsCount: 0,
        totalProducts: 0,
      };

      interface CriticalAlertCandidate {
        integrationId: string;
        userId: string | null;
        jobId: string | null;
        meliItemId: string;
        metrics: MeliProductMetrics;
        productSnapshot: {
          name: string;
          sku: string;
          currentStock: number;
          salePrice: number;
          costPrice: number;
        };
      }

      const criticalAlertCandidates: CriticalAlertCandidate[] = [];

      logger.info(
        `[meli/generate-alerts] Starting alert generation for integration ${integrationId}, user ${userId}, job ${jobId}`
      );

      const take = 100;
      let skip = 0;

      while (true) {
        const products = await meliRepository.getProducts(take, skip);

        if (products.length === 0) {
          break;
        }

        for (const product of products) {
          logger.info(
            `[meli/generate-alerts] Processing product ${product.meliItemId} for integration ${integrationId}`
          );

          const [sales, stockBalance, productSettings] = await Promise.all([
            meliRepository.getSaleHistoryByProductId(product.meliItemId),
            meliRepository.getStockBalanceByProductId(product.meliItemId),
            meliRepository.getProductSettings(product.meliItemId),
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

          const { previousRisk } = await meliRepository.upsertProductAlert(
            product.meliItemId,
            productMetrics
          );

          const transitionedToCritical =
            productMetrics.risk === 'CRITICAL' && previousRisk !== 'CRITICAL';

          if (transitionedToCritical) {
            if (userId) {
              criticalAlertCandidates.push({
                integrationId,
                userId,
                jobId: jobId ?? null,
                meliItemId: product.meliItemId,
                metrics: productMetrics,
                productSnapshot: {
                  name: product.title,
                  sku: product.sku ?? '',
                  currentStock: product.currentStock,
                  salePrice: product.salePrice,
                  costPrice: product.costPrice,
                },
              });
              result.alertsGenerated += 1;
            } else {
              logger.warn(
                {
                  integrationId,
                  meliItemId: product.meliItemId,
                },
                '[meli/generate-alerts] Skipping critical notification: missing userId'
              );
            }
          }
        }

        result.totalProducts += products.length;
        skip += take;
      }

      for (const candidate of criticalAlertCandidates) {
        await step.sendEvent('meli/alert-critical', {
          name: 'meli/alert-critical',
          data: candidate,
        });
      }

      await step.sendEvent('meli/sync:complete', {
        name: 'meli/sync:complete',
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
          data: { meliSyncStatus: MeliSyncStatus.COMPLETED },
        });
      }

      logger.info(
        `[meli/generate-alerts] Alert generation completed successfully for integration ${integrationId}`
      );
      return result;
    } catch (error) {
      logger.error({ error, integrationId, jobId }, 'Alert generation failed');

      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: { meliSyncStatus: MeliSyncStatus.FAILED },
        });
      }

      throw error;
    }
  }
);
