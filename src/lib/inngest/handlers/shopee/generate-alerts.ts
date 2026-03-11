import { ShopeeSyncStatus } from '@prisma/client';
import type { ShopeeAlertType, ShopeeRuptureRisk } from '@prisma/client';
import pino from 'pino';
import { calculateAllMetrics } from '@/lib/bling/bling-utils';
import type { BlingProductSettingsType } from '@/lib/bling/bling-types';
import { createShopeeRepository } from '@/lib/shopee';
import prisma from '@/lib/prisma';
import { inngest } from '../../client';
import {
  getDaysWithSalesWithinWindow,
  inferStockOutDate,
  resolveCurrentStock,
} from '../bling/generate-alerts.utils';

const logger = pino();

const DAYS_IN_30 = 30;
const DAYS_IN_7 = 7;
const DEFAULT_COST_FACTOR = 0.8;

export const generateAlerts = inngest.createFunction(
  {
    id: 'shopee/generate-alerts',
    concurrency: 1,
  },
  { event: 'shopee/generate-alerts' },
  async ({ event, step }) => {
    const { integrationId, userId, jobId } = event.data;

    try {
      const shopeeRepository = createShopeeRepository({ integrationId });

      const result = {
        alertsGenerated: 0,
        errorsCount: 0,
        totalProducts: 0,
      };

      logger.info(
        `[shopee/generate-alerts] Starting alert generation for integration ${integrationId}, user ${userId}`
      );

      const take = 100;
      let skip = 0;

      while (true) {
        const products = await shopeeRepository.getProducts(take, skip);
        if (products.length === 0) break;

        for (const product of products) {
          try {
            const [sales, stockBalance, productSettings] = await Promise.all([
              shopeeRepository.getSalesHistory(product.shopeeItemId),
              shopeeRepository.getStockBalance(product.shopeeItemId),
              shopeeRepository.getProductSettings(product.shopeeItemId),
            ]);

            const lastSaleDate = sales.length > 0
              ? new Date(
                  [...sales].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())[0].date
                )
              : null;

            const currentStock = resolveCurrentStock(
              product.currentStock,
              stockBalance?.stock,
              stockBalance?.updatedAt ?? null,
              lastSaleDate
            );

            const salePrice = product.salePrice || 0;
            const costFallback = productSettings?.costFactor ?? DEFAULT_COST_FACTOR;
            const costPrice = salePrice * costFallback;
            const hasStockOut = currentStock === 0;

            const totalSales = sales.reduce((sum, s) => sum + (s.quantity || 0), 0);
            const uniqueSaleDays = new Set(
              sales.map((s) => new Date(s.date).toISOString().split('T')[0])
            );
            const daysWithSales = uniqueSaleDays.size;
            const totalLast30DaysSales = (() => {
              const now = new Date();
              const cutoff = new Date(now.getTime() - DAYS_IN_30 * 24 * 60 * 60 * 1000);
              return sales
                .filter((s) => new Date(s.date) >= cutoff)
                .reduce((sum, s) => sum + (s.quantity || 0), 0);
            })();
            const totalLast7DaysSales = (() => {
              const now = new Date();
              const cutoff = new Date(now.getTime() - DAYS_IN_7 * 24 * 60 * 60 * 1000);
              return sales
                .filter((s) => new Date(s.date) >= cutoff)
                .reduce((sum, s) => sum + (s.quantity || 0), 0);
            })();
            const daysWithSalesWithinLast30 = getDaysWithSalesWithinWindow(sales, DAYS_IN_30);
            const daysWithSalesWithinLast7 = getDaysWithSalesWithinWindow(sales, DAYS_IN_7);
            const stockOutDate = inferStockOutDate(
              hasStockOut,
              stockBalance?.stock,
              stockBalance?.updatedAt ?? null,
              lastSaleDate
            );

            // Cast settings to BlingProductSettingsType (structurally identical)
            const metrics = calculateAllMetrics(
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
                stockOutDate: stockOutDate ?? undefined,
                daysWithSalesWithinLast30,
                daysWithSalesWithinLast7,
              },
              productSettings as unknown as BlingProductSettingsType | null
            );

            const shopeeMetrics = {
              ...metrics,
              type: metrics.type as unknown as ShopeeAlertType,
              risk: metrics.risk as unknown as ShopeeRuptureRisk,
            };

            const { previousRisk } = await shopeeRepository.upsertProductAlert(
              product.shopeeItemId,
              shopeeMetrics
            );

            const transitionedToCritical =
              shopeeMetrics.risk === 'CRITICAL' && previousRisk !== 'CRITICAL';

            if (transitionedToCritical && userId) {
              await step.sendEvent('shopee/alert-critical', {
                name: 'shopee/alert-critical',
                data: {
                  integrationId,
                  userId,
                  jobId: jobId ?? null,
                  shopeeItemId: product.shopeeItemId,
                  metrics: shopeeMetrics,
                  productSnapshot: {
                    name: product.title,
                    sku: product.sku,
                    currentStock: product.currentStock,
                    salePrice: product.salePrice,
                    costPrice: product.costPrice,
                  },
                },
              });
              result.alertsGenerated += 1;
            }
          } catch (productError) {
            logger.error(
              { error: productError, shopeeItemId: product.shopeeItemId, integrationId },
              '[shopee/generate-alerts] Error processing product'
            );
            result.errorsCount += 1;
          }
        }

        result.totalProducts += products.length;
        skip += take;
      }

      await step.sendEvent('shopee/sync:complete', {
        name: 'shopee/sync:complete',
        data: { userId, integrationId, jobId, ...result },
      });

      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: { shopeeSyncStatus: ShopeeSyncStatus.COMPLETED },
        });
      }

      logger.info(
        `[shopee/generate-alerts] Completed for integration ${integrationId}: ${result.totalProducts} products, ${result.alertsGenerated} alerts`
      );

      return result;
    } catch (error) {
      logger.error({ error, integrationId, jobId }, '[shopee/generate-alerts] Alert generation failed');

      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: { shopeeSyncStatus: ShopeeSyncStatus.FAILED },
        });
      }

      throw error;
    }
  }
);
