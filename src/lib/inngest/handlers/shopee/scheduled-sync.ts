import pino from 'pino';
import prisma from '@/lib/prisma';
import { inngest } from '../../client';

const logger = pino();

export const scheduledSyncPro = inngest.createFunction(
  { id: 'shopee/scheduled-sync-pro' },
  { cron: '0 * * * *' }, // Every hour
  async ({ step }) => {
    logger.info('[shopee/scheduled-sync-pro] Starting scheduled PRO sync');

    const proUsers = await prisma.user.findMany({
      where: {
        planTier: 'PRO',
        shopeeIntegration: { isNot: null },
      },
      select: { id: true },
    });

    logger.info(
      `[shopee/scheduled-sync-pro] Found ${proUsers.length} PRO users with Shopee integration`
    );

    for (const user of proUsers) {
      await step.sendEvent('shopee/sync:user', {
        name: 'shopee/sync:user',
        data: { userId: user.id },
      });
    }

    return { syncedUsers: proUsers.length };
  }
);

export const scheduledSyncFree = inngest.createFunction(
  { id: 'shopee/scheduled-sync-free' },
  { cron: '0 3 * * *' }, // Daily at 03:00 UTC
  async ({ step }) => {
    logger.info('[shopee/scheduled-sync-free] Starting scheduled FREE sync');

    const freeUsers = await prisma.user.findMany({
      where: {
        planTier: 'FREE',
        shopeeIntegration: { isNot: null },
      },
      select: { id: true },
    });

    logger.info(
      `[shopee/scheduled-sync-free] Found ${freeUsers.length} FREE users with Shopee integration`
    );

    for (const user of freeUsers) {
      await step.sendEvent('shopee/sync:user', {
        name: 'shopee/sync:user',
        data: { userId: user.id },
      });
    }

    return { syncedUsers: freeUsers.length };
  }
);
