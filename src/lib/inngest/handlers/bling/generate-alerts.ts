import { BlingSyncStatus } from '@prisma/client';
import pino from 'pino';
import {
  calculateAllMetrics,
  calculateDaysRemaining,
  calculateRealVVD,
  createBlingRepository,
  getDaysWithSales,
  getLastSaleDate,
  getTotalLastSales,
  getTotalSales,
} from '@/lib/bling';
import prisma from '@/lib/prisma';
import { inngest } from '../../client';

const logger = pino();

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

          const vvdReal = calculateRealVVD(getTotalSales(sales), getDaysWithSales(sales));
          const daysRemaining = calculateDaysRemaining(product.currentStock || 0, vvdReal);

          const costPrice = product.costPrice || 0;
          const salePrice = product.salePrice || 0;
          const currentStock = product.currentStock || 0;
          const daysWithSales = getDaysWithSales(sales);
          const totalSales = getTotalSales(sales);
          const hasStockOut =
            product.currentStock === 0 || !stockBalance || stockBalance.stock === 0;
          const lastSaleDate = getLastSaleDate(sales) || new Date(0);
          const totalLast30DaysSales = getTotalLastSales(sales, 30);
          const totalLast7DaysSales = getTotalLastSales(sales, 7);
          const stockOutDate = new Date(Date.now() + daysRemaining * 86400000);

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
