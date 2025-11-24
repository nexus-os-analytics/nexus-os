import pino from 'pino';
import { BlingIntegration } from '@/lib/bling';
import { inngest } from '../../client';

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

    // 1) products (fire-and-forget, but await to ensure sequence)
    await step.sendEvent('bling/sync:products', {
      name: 'bling/sync:products',
      data: { userId, integrationId: integration.id },
    });
  }
);
