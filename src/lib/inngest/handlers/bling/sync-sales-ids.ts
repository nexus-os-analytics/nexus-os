import { BlingJobSyncType } from '@prisma/client';
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

    // Create SyncJob
    const batchSize = 50; // adjust
    const totalBatches = Math.ceil(ids.length / batchSize);
    const job = await prisma.blingSyncJob.create({
      data: {
        integrationId,
        userId,
        type: BlingJobSyncType.SALES,
        totalBatches,
        metadata: { dateStart, dateEnd },
      },
    });

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
