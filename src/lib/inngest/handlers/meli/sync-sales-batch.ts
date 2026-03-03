import { MeliJobStatus } from '@prisma/client';
import pino from 'pino';
import { createMeliClient, MeliIntegration, createMeliRepository } from '@/lib/mercado-livre';
import prisma from '@/lib/prisma';
import { sleep } from '@/lib/utils/rate-limiter';
import { inngest } from '../../client';

const logger = pino();

export const syncSalesBatch = inngest.createFunction(
  { id: 'meli/sync:sales-batch' },
  { event: 'meli/sync:sales-batch' },
  async ({ event, step }) => {
    const { integrationId, userId, jobId, orderIds } = event.data;

    try {
      const { access_token } = await MeliIntegration.getValidMeliTokens(userId);
      const meliClient = createMeliClient({ accessToken: access_token });
      const meliRepository = createMeliRepository({ integrationId });

      logger.info(
        `[meli/sync:sales-batch] start batch ${event.data.batchIndex} for user ${userId}`
      );

      // Fetch order details with limited concurrency
      const CONC = 2;
      const batches = [];
      for (let i = 0; i < orderIds.length; i += CONC) {
        batches.push(orderIds.slice(i, i + CONC));
      }

      const fetched: any[] = [];
      for (const b of batches) {
        const res = await Promise.all(
          b.map((o: any) =>
            meliClient.getOrderDetails(o.id).catch((e) => {
              logger.error(`[meli/sync:sales-batch] Error fetching order ${o.id}: ${e.message}`);
              return null;
            })
          )
        );
        fetched.push(...res.filter(Boolean).flat());
        await sleep(1000); // Avoid rate limits
      }

      logger.info(
        `[meli/sync:sales-batch] fetched ${fetched.length} sales history records for batch ${event.data.batchIndex} user ${userId}`
      );

      // Persist
      await meliRepository.upsertSalesHistory(fetched);

      // Atomic increment processedBatches
      const updated = await prisma.meliSyncJob.update({
        where: { id: jobId },
        data: { processedBatches: { increment: 1 } },
      });

      // When all batches processed -> emit generate-alerts
      if (updated.processedBatches >= updated.totalBatches) {
        await prisma.meliSyncJob.update({
          where: { id: jobId },
          data: { status: MeliJobStatus.DONE, finishedAt: new Date() },
        });
        await step.sendEvent('meli/generate-alerts', {
          name: 'meli/generate-alerts',
          data: {
            userId,
            integrationId,
            jobId,
          },
        });
      }
    } catch (err) {
      logger.error(
        `[meli/sync:sales-batch] error processing batch ${event.data.batchIndex} for user ${userId}`
      );
      await prisma.meliSyncJob.update({
        where: { id: event.data.jobId },
        data: { status: MeliJobStatus.FAILED, finishedAt: new Date() },
      });
      throw err;
    }
  }
);
