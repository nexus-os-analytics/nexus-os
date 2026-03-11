import { ShopeeJobStatus, ShopeeJobSyncType } from '@prisma/client';
import pino from 'pino';
import { createShopeeClient, ShopeeIntegration } from '@/lib/shopee';
import prisma from '@/lib/prisma';
import { inngest } from '../../client';

const logger = pino();

export const syncSalesIds = inngest.createFunction(
  { id: 'shopee/sync:sales-ids' },
  { event: 'shopee/sync:sales-ids' },
  async ({ event, step }) => {
    const { integrationId, userId, timeFrom, timeTo } = event.data;

    try {
      const { access_token: accessToken, shop_id: shopId } = await ShopeeIntegration.getValidShopeeTokens(userId);
      const shopeeClient = createShopeeClient({ accessToken, shopId });

      logger.info(`[shopee/sync:sales-ids] start sync sales ids for user ${userId}`);

      // Fetch all orders in the given time range (paginated)
      const allOrders: { order_sn: string; order_status: string }[] = [];
      let cursor = '';
      let more = true;
      while (more) {
        const page = await shopeeClient.getOrderList(timeFrom, timeTo, cursor, 50);
        allOrders.push(...page.orders);
        more = page.more;
        cursor = page.nextCursor;
        if (!more) break;
      }

      const orderSns = allOrders.map((o) => ({ id: o.order_sn }));
      const batchSize = 50;
      const totalBatches = Math.ceil(orderSns.length / batchSize);

      // Check for an existing running job
      const existingJob = await prisma.shopeeSyncJob.findFirst({
        where: {
          integrationId,
          type: ShopeeJobSyncType.ORDERS,
          status: ShopeeJobStatus.RUNNING,
        },
      });

      const job = await prisma.shopeeSyncJob.upsert({
        where: existingJob?.id ? { id: existingJob.id } : { id: 'non-existent-id' },
        update: { totalBatches, startedAt: new Date() },
        create: {
          userId,
          integrationId,
          type: ShopeeJobSyncType.ORDERS,
          status: ShopeeJobStatus.RUNNING,
          totalBatches,
        },
      });

      if (totalBatches === 0) {
        logger.info(
          `[shopee/sync:sales-ids] no batches; emitting shopee/generate-alerts for integration ${integrationId}`
        );
        await prisma.shopeeSyncJob.update({
          where: { id: job.id },
          data: { status: ShopeeJobStatus.DONE, finishedAt: new Date(), processedBatches: 0 },
        });
        await step.sendEvent('shopee/generate-alerts', {
          name: 'shopee/generate-alerts',
          data: { userId, integrationId, jobId: job.id },
        });
        return;
      }

      // Fan-out batches
      for (let i = 0; i < totalBatches; i++) {
        const batch = orderSns.slice(i * batchSize, (i + 1) * batchSize);
        await step.sendEvent('shopee/sync:sales-batch', {
          name: 'shopee/sync:sales-batch',
          data: { userId, integrationId, jobId: job.id, batchIndex: i, orderSns: batch },
        });
      }
    } catch (err) {
      logger.error(
        { error: err, userId, integrationId },
        `[shopee/sync:sales-ids] Failed to sync sales ids for user ${userId}`
      );
      throw err;
    }
  }
);
