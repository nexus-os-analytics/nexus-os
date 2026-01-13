import { BlingJobStatus, BlingJobSyncType } from '@prisma/client';
import pino from 'pino';
import { BlingIntegration, createBlingClient } from '@/lib/bling';
import prisma from '@/lib/prisma';
import { inngest } from '../../client';

const logger = pino();

export const syncSalesIds = inngest.createFunction(
  { id: 'bling/sync:sales-ids' },
  { event: 'bling/sync:sales-ids' },
  async ({ event, step }) => {
    const { integrationId, userId, dateStart, dateEnd } = event.data;
    const { access_token } = await BlingIntegration.getValidBlingTokens(userId);
    const blingClient = createBlingClient({ accessToken: access_token });

    logger.info(`[bling/sync:sales-ids] start sync sales ids for user ${userId}`);

    // Fetch all sale IDs in the date range
    const saleIds = await blingClient.getSalesInRange(dateStart, dateEnd);
    const ids = saleIds.map((s) => ({ id: s.id }));
    const batchSize = 50; // adjust
    const totalBatches = Math.ceil(ids.length / batchSize);

    // Verify if has a existing sync job in progress
    const existingJob = await prisma.blingSyncJob.findFirst({
      where: {
        integrationId,
        type: BlingJobSyncType.SALES,
        status: BlingJobStatus.RUNNING,
      },
    });

    // Create SyncJob
    const job = await prisma.blingSyncJob.upsert({
      where: existingJob?.id ? { id: existingJob.id } : { id: 'non-existent-id' },
      update: {
        totalBatches,
        startedAt: new Date(),
      },
      create: {
        userId,
        integrationId,
        type: BlingJobSyncType.SALES,
        status: BlingJobStatus.RUNNING,
        totalBatches,
      },
    });

    // Fallback: if there are no batches to process, mark job as done and emit generate-alerts
    if (totalBatches === 0) {
      logger.info(
        `[bling/sync:sales-ids] no sales batches; emitting bling/generate-alerts for integration ${integrationId} user ${userId}`
      );
      await prisma.blingSyncJob.update({
        where: { id: job.id },
        data: { status: BlingJobStatus.DONE, finishedAt: new Date(), processedBatches: 0 },
      });
      await step.sendEvent('bling/generate-alerts', {
        name: 'bling/generate-alerts',
        data: { userId, integrationId, jobId: job.id },
      });
      return;
    }

    // Emit N batch events (fan-out)
    for (let i = 0; i < totalBatches; i++) {
      const batch = ids.slice(i * batchSize, (i + 1) * batchSize);
      await step.sendEvent('bling/sync:sales-batch', {
        name: 'bling/sync:sales-batch',
        data: { userId, integrationId, jobId: job.id, batchIndex: i, saleIds: batch },
      });
    }
  }
);
