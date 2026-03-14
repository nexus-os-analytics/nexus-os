import { ShopeeSyncStatus } from '@prisma/client';
import pino from 'pino';
import { ShopeeIntegration } from '@/lib/shopee/shopee-integration';
import prisma from '@/lib/prisma';
import { inngest } from '../../client';

const logger = pino();

export const syncUser = inngest.createFunction(
  { id: 'shopee/sync:user' },
  { event: 'shopee/sync:user' },
  async ({ event, step }) => {
    const { userId } = event.data;
    logger.info(`[shopee/sync:user] start sync for user ${userId}`);

    try {
      const integration = await ShopeeIntegration.getShopeeIntegration(userId);
      if (!integration) {
        logger.warn(`[shopee/sync:user] integration not found for user ${userId}`);
        await step.run('update-user-failed-no-integration', async () => {
          await prisma.user.update({
            where: { id: userId },
            data: { shopeeSyncStatus: ShopeeSyncStatus.FAILED },
          });
        });
        return;
      }

      await step.run('update-user-syncing', async () => {
        await prisma.user.update({
          where: { id: userId },
          data: { shopeeSyncStatus: ShopeeSyncStatus.SYNCING },
        });
      });

      await step.sendEvent('shopee/sync:products', {
        name: 'shopee/sync:products',
        data: { userId, integrationId: integration.id },
      });

      const completionEvent = await step.waitForEvent('shopee/sync:complete', {
        event: 'shopee/sync:complete',
        timeout: '2h',
        match: 'data.integrationId',
      });

      if (!completionEvent) {
        logger.error(`[shopee/sync:user] timed out waiting for completion for user ${userId}`);
        await step.run('update-user-failed', async () => {
          await prisma.user.update({
            where: { id: userId },
            data: { shopeeSyncStatus: ShopeeSyncStatus.FAILED },
          });
        });
        return;
      }

      await step.run('update-user-completed', async () => {
        await prisma.user.update({
          where: { id: userId },
          data: { shopeeSyncStatus: ShopeeSyncStatus.COMPLETED },
        });
      });

      logger.info(`[shopee/sync:user] finished sync for user ${userId}`);
    } catch (error) {
      logger.error({ error, userId }, '[shopee/sync:user] unexpected error during sync');
      await step.run('update-user-failed-error', async () => {
        await prisma.user.update({
          where: { id: userId },
          data: { shopeeSyncStatus: ShopeeSyncStatus.FAILED },
        });
      });
      throw error;
    }
  }
);
