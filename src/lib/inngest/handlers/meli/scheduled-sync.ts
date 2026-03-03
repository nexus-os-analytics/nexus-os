import pino from 'pino';
import prisma from '@/lib/prisma';
import { inngest } from '../../client';

const logger = pino();

/**
 * Scheduled sync for PRO plan users (hourly)
 */
export const scheduledSyncPro = inngest.createFunction(
  {
    id: 'meli/scheduled-sync-pro',
  },
  { cron: '0 * * * *' }, // Every hour
  async ({ step }) => {
    logger.info('[meli/scheduled-sync-pro] Starting scheduled PRO sync');

    const proUsers = await prisma.user.findMany({
      where: {
        planTier: 'PRO',
        meliIntegration: { isNot: null },
      },
      select: { id: true },
    });

    logger.info(`[meli/scheduled-sync-pro] Found ${proUsers.length} PRO users with ML integration`);

    for (const user of proUsers) {
      await step.sendEvent('meli/sync:user', {
        name: 'meli/sync:user',
        data: { userId: user.id },
      });
    }

    return { syncedUsers: proUsers.length };
  }
);

/**
 * Scheduled sync for FREE plan users (daily at 03:00 UTC)
 */
export const scheduledSyncFree = inngest.createFunction(
  {
    id: 'meli/scheduled-sync-free',
  },
  { cron: '0 3 * * *' }, // Daily at 03:00 UTC
  async ({ step }) => {
    logger.info('[meli/scheduled-sync-free] Starting scheduled FREE sync');

    const freeUsers = await prisma.user.findMany({
      where: {
        planTier: 'FREE',
        meliIntegration: { isNot: null },
      },
      select: { id: true },
    });

    logger.info(
      `[meli/scheduled-sync-free] Found ${freeUsers.length} FREE users with ML integration`
    );

    for (const user of freeUsers) {
      await step.sendEvent('meli/sync:user', {
        name: 'meli/sync:user',
        data: { userId: user.id },
      });
    }

    return { syncedUsers: freeUsers.length };
  }
);
