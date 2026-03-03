import { MeliSyncStatus } from '@prisma/client';
import pino from 'pino';
import { MeliIntegration } from '@/lib/mercado-livre/meli-integration';
import prisma from '@/lib/prisma';
import { inngest } from '../../client';

const logger = pino();

export const syncUser = inngest.createFunction(
  { id: 'meli/sync:user' },
  { event: 'meli/sync:user' },
  async ({ event, step }) => {
    const { userId } = event.data;
    logger.info(`[meli/sync:user] start sync for user ${userId}`);

    // Fetch integration
    const integration = await MeliIntegration.getMeliIntegration(userId);
    if (!integration) {
      logger.warn(`[meli/sync:user] error fetching integration for user ${userId}`);
      return;
    }

    // 1) Update user status to SYNCING
    await step.run('update-user-syncing', async () => {
      await prisma.user.update({
        where: { id: userId },
        data: { meliSyncStatus: MeliSyncStatus.SYNCING },
      });
    });

    // 2) Trigger product sync
    await step.sendEvent('meli/sync:products', {
      name: 'meli/sync:products',
      data: { userId, integrationId: integration.id },
    });

    // 3) Wait for completion event
    const completionEvent = await step.waitForEvent('meli/sync:complete', {
      event: 'meli/sync:complete',
      timeout: '2h',
      match: 'data.integrationId',
    });

    if (!completionEvent) {
      logger.error(`[meli/sync:user] timed out waiting for completion for user ${userId}`);
      await step.run('update-user-failed', async () => {
        await prisma.user.update({
          where: { id: userId },
          data: { meliSyncStatus: MeliSyncStatus.FAILED },
        });
      });
      return;
    }

    // 4) Update user status to COMPLETED
    await step.run('update-user-completed', async () => {
      await prisma.user.update({
        where: { id: userId },
        data: { meliSyncStatus: MeliSyncStatus.COMPLETED },
      });
    });

    logger.info(`[meli/sync:user] finished sync for user ${userId}`);
  }
);
