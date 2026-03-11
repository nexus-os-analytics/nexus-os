import { ShopeeJobStatus } from '@prisma/client';
import pino from 'pino';
import { createShopeeClient, ShopeeIntegration, createShopeeRepository } from '@/lib/shopee';
import prisma from '@/lib/prisma';
import { inngest } from '../../client';

const logger = pino();

export const syncSalesBatch = inngest.createFunction(
  { id: 'shopee/sync:sales-batch' },
  { event: 'shopee/sync:sales-batch' },
  async ({ event, step }) => {
    const { integrationId, userId, jobId, orderSns } = event.data;

    try {
      const { access_token: accessToken, shop_id: shopId } = await ShopeeIntegration.getValidShopeeTokens(userId);
      const shopeeClient = createShopeeClient({ accessToken, shopId });
      const shopeeRepository = createShopeeRepository({ integrationId });

      logger.info(
        `[shopee/sync:sales-batch] start batch ${event.data.batchIndex} for user ${userId}`
      );

      // getOrderDetail takes string[] and returns ShopeeSalesHistoryType[] (adapter is internal)
      const orderSnList = orderSns.map((o: { id: string }) => o.id);
      const salesHistory = await shopeeClient.getOrderDetail(orderSnList).catch((e: Error) => {
        logger.error(
          `[shopee/sync:sales-batch] Error fetching orders for batch ${event.data.batchIndex}: ${e.message}`
        );
        return [];
      });

      logger.info(
        `[shopee/sync:sales-batch] fetched ${salesHistory.length} sales history records for batch ${event.data.batchIndex} user ${userId}`
      );

      await shopeeRepository.upsertSalesHistory(salesHistory);

      const updated = await prisma.shopeeSyncJob.update({
        where: { id: jobId },
        data: { processedBatches: { increment: 1 } },
      });

      if (updated.processedBatches >= updated.totalBatches) {
        await prisma.shopeeSyncJob.update({
          where: { id: jobId },
          data: { status: ShopeeJobStatus.DONE, finishedAt: new Date() },
        });
        await step.sendEvent('shopee/generate-alerts', {
          name: 'shopee/generate-alerts',
          data: { userId, integrationId, jobId },
        });
      }
    } catch (err) {
      logger.error(
        { error: err, userId, integrationId, batchIndex: event.data.batchIndex, jobId },
        `[shopee/sync:sales-batch] Failed to process batch ${event.data.batchIndex} for user ${userId}`
      );
      await prisma.shopeeSyncJob.update({
        where: { id: event.data.jobId },
        data: { status: ShopeeJobStatus.FAILED, finishedAt: new Date() },
      });
      throw err;
    }
  }
);
