import { MeliJobStatus, MeliJobSyncType } from '@prisma/client';
import pino from 'pino';
import { createMeliClient, MeliIntegration } from '@/lib/mercado-livre';
import prisma from '@/lib/prisma';
import { inngest } from '../../client';

const logger = pino();

export const syncSalesIds = inngest.createFunction(
  { id: 'meli/sync:sales-ids' },
  { event: 'meli/sync:sales-ids' },
  async ({ event, step }) => {
    const { integrationId, userId, sellerId, dateStart, dateEnd } = event.data;
    const { access_token } = await MeliIntegration.getValidMeliTokens(userId);
    const meliClient = createMeliClient({ accessToken: access_token });

    logger.info(`[meli/sync:sales-ids] start sync sales ids for user ${userId}`);

    // Fetch all order IDs in the date range
    const orders = await meliClient.searchOrders(sellerId, dateStart, dateEnd);
    const orderIds = orders.map((o) => ({ id: o.id }));
    const batchSize = 50;
    const totalBatches = Math.ceil(orderIds.length / batchSize);

    // Check for existing sync job in progress
    const existingJob = await prisma.meliSyncJob.findFirst({
      where: {
        integrationId,
        type: MeliJobSyncType.ORDERS,
        status: MeliJobStatus.RUNNING,
      },
    });

    // Create SyncJob
    const job = await prisma.meliSyncJob.upsert({
      where: existingJob?.id ? { id: existingJob.id } : { id: 'non-existent-id' },
      update: {
        totalBatches,
        startedAt: new Date(),
      },
      create: {
        userId,
        integrationId,
        type: MeliJobSyncType.ORDERS,
        status: MeliJobStatus.RUNNING,
        totalBatches,
      },
    });

    // Fallback: if no batches, mark job as done and emit generate-alerts
    if (totalBatches === 0) {
      logger.info(
        `[meli/sync:sales-ids] no sales batches; emitting meli/generate-alerts for integration ${integrationId} user ${userId}`
      );
      await prisma.meliSyncJob.update({
        where: { id: job.id },
        data: { status: MeliJobStatus.DONE, finishedAt: new Date(), processedBatches: 0 },
      });
      await step.sendEvent('meli/generate-alerts', {
        name: 'meli/generate-alerts',
        data: { userId, integrationId, jobId: job.id },
      });
      return;
    }

    // Emit N batch events (fan-out)
    for (let i = 0; i < totalBatches; i++) {
      const batch = orderIds.slice(i * batchSize, (i + 1) * batchSize);
      await step.sendEvent('meli/sync:sales-batch', {
        name: 'meli/sync:sales-batch',
        data: { userId, integrationId, jobId: job.id, batchIndex: i, orderIds: batch },
      });
    }
  }
);
