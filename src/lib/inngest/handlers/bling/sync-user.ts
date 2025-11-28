import pino from 'pino';
import { BlingIntegration } from '@/lib/bling';
import { inngest } from '../../client';
import prisma from '@/lib/prisma';
import { BlingSyncStatus } from '@prisma/client';

const logger = pino();

export const syncUser = inngest.createFunction(
  { id: 'bling/sync:user' },
  { event: 'bling/sync:user' },
  async ({ event, step }) => {
    const { userId } = event.data;
    logger.info(`[sync-user] start sync for user ${userId}`);

    // fetch integration
    const integration = await BlingIntegration.getBlingIntegration(userId);
    if (!integration) {
      logger.warn(`[bling/sync:user] error fetching integration for user ${userId}`);
      return;
    }

    // 1) Update user status to SYNCING
    await step.run('update-user-syncing', async () => {
      await prisma.user.update({
        where: { id: userId },
        data: { blingSyncStatus: BlingSyncStatus.SYNCING },
      });
    });

    // 2) Trigger product sync
    await step.sendEvent('bling/sync:products', {
      name: 'bling/sync:products',
      data: { userId, integrationId: integration.id },
    });

    // 3) Wait for completion event
    // We wait for the event that matches our integrationId (and implicitly userId via integration)
    // The timeout should be generous as sync can take time
    const completionEvent = await step.waitForEvent('bling/sync:complete', {
      event: 'bling/sync:complete',
      timeout: '2h', // 2 hours max
      match: 'data.integrationId',
    });

    if (!completionEvent) {
       logger.error(`[bling/sync:user] timed out waiting for completion for user ${userId}`);
       await step.run('update-user-failed', async () => {
         await prisma.user.update({
           where: { id: userId },
           data: { blingSyncStatus: BlingSyncStatus.FAILED },
         });
       });
       return;
    }

    // 4) Update user status to COMPLETED
    await step.run('update-user-completed', async () => {
      await prisma.user.update({
        where: { id: userId },
        data: { blingSyncStatus: BlingSyncStatus.COMPLETED },
      });
    });
    
    logger.info(`[sync-user] finished sync for user ${userId}`);
  }
);
