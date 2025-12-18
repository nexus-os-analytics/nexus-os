import { BlingJobStatus } from '@prisma/client';
import pino from 'pino';
import { BlingIntegration, createBlingClient, createBlingRepository } from '@/lib/bling';
import prisma from '@/lib/prisma';
import { sleep } from '@/lib/utils/rate-limiter';
import { inngest } from '../../client';

const logger = pino();

export const syncSalesBatch = inngest.createFunction(
  { id: 'bling/sync:sales-batch' },
  { event: 'bling/sync:sales-batch' },
  async ({ event, step }) => {
    const { integrationId, userId, jobId, saleIds } = event.data;
    try {
      const { access_token } = await BlingIntegration.getValidBlingTokens(userId);
      const blingClient = createBlingClient({ accessToken: access_token });
      const blingRepository = createBlingRepository({ integrationId });

      logger.info(
        `[bling/sync:sales-batch] start batch ${event.data.batchIndex} for user ${userId}`
      );
      // fetch sale details in parallel with limited concurrency
      const CONC = 3;
      const batches = [];
      for (let i = 0; i < saleIds.length; i += CONC) batches.push(saleIds.slice(i, i + CONC));
      const fetched: any[] = [];
      for (const b of batches) {
        const res = await Promise.all(
          b.map((s: any) =>
            blingClient.getSalesHistory(String(s.id)).catch((e) => {
              logger.error(`[bling/sync:sales-batch] Error fetching sale ${s.id}: ${e.message}`);
              return null;
            })
          )
        );
        fetched.push(...res.filter(Boolean).flat());
        sleep(2000); // to avoid rate limits
      }
      logger.info(
        `[bling/sync:sales-batch] fetched ${fetched.length} sales history records for batch ${event.data.batchIndex} user ${userId}`
      );

      // persist
      await blingRepository.upsertSalesHistory(fetched);

      // atomic increment processedBatches
      const updated = await prisma.blingSyncJob.update({
        where: { id: jobId },
        data: { processedBatches: { increment: 1 } },
      });

      // when all batches processed -> emit generate-alerts
      if (updated.processedBatches >= updated.totalBatches) {
        await prisma.blingSyncJob.update({
          where: { id: jobId },
          data: { status: BlingJobStatus.DONE, finishedAt: new Date() },
        });
        await step.sendEvent('bling/generate-alerts', {
          name: 'bling/generate-alerts',
          data: {
            userId,
            integrationId,
            jobId,
          },
        });
      }
    } catch (err) {
      logger.error(
        `[bling/sync:sales-batch] error processing batch ${event.data.batchIndex} for user ${userId}`
      );
      await prisma.blingSyncJob.update({
        where: { id: event.data.jobId },
        data: { status: BlingJobStatus.FAILED, finishedAt: new Date() },
      });
      throw err;
    }
  }
);
