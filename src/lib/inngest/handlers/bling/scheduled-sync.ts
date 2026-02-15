import pino from 'pino';
import prisma from '@/lib/prisma';
import { inngest } from '../../client';

const logger = pino();

// Hourly auto-sync for PRO users
export const scheduledSyncPro = inngest.createFunction(
  { id: 'bling/scheduled-sync:pro' },
  { cron: '0 * * * *' },
  async ({ step }) => {
    logger.info('[bling/scheduled-sync:pro] starting hourly sync');
    const proUsers = await prisma.user.findMany({
      where: { planTier: 'PRO', emailVerified: { not: null } },
      select: { id: true },
    });
    for (const u of proUsers) {
      await step.sendEvent('bling/sync:user', {
        name: 'bling/sync:user',
        data: { userId: u.id },
      });
    }
    logger.info(`[bling/scheduled-sync:pro] enqueued ${proUsers.length} users`);
  }
);

// Daily auto-sync for FREE users (runs at 03:00 UTC daily)
export const scheduledSyncFree = inngest.createFunction(
  { id: 'bling/scheduled-sync:free' },
  { cron: '0 3 * * *' },
  async ({ step }) => {
    logger.info('[bling/scheduled-sync:free] starting daily sync');
    const freeUsers = await prisma.user.findMany({
      where: { planTier: 'FREE', emailVerified: { not: null } },
      select: { id: true },
    });
    for (const u of freeUsers) {
      await step.sendEvent('bling/sync:user', {
        name: 'bling/sync:user',
        data: { userId: u.id },
      });
    }
    logger.info(`[bling/scheduled-sync:free] enqueued ${freeUsers.length} users`);
  }
);
