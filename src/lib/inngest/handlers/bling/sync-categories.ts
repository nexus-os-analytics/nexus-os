import pino from 'pino';
import { BlingIntegration, createBlingClient, createBlingRepository } from '@/lib/bling';
import { inngest } from '../../client';

const logger = pino();

export const syncCategories = inngest.createFunction(
  { id: 'bling/sync:categories' },
  { event: 'bling/sync:categories' },
  async ({ event }) => {
    const { userId } = event.data;
    try {
      const integration = await BlingIntegration.getBlingIntegration(userId);

      if (!integration) {
        logger.warn(`[bling/sync:categories] error fetching integration for user ${userId}`);
        return;
      }

      const blingClient = createBlingClient({
        accessToken: integration.access_token,
      });

      const blingRepository = createBlingRepository({
        integrationId: integration.id,
      });

      logger.info(`[bling/sync:categories] start sync categories for user ${userId}`);
      const allCategories: any[] = [];
      let page = 1;
      while (true) {
        const pageCategories = await blingClient.getCategories(page);
        if (!pageCategories || pageCategories.length === 0) break;
        allCategories.push(...pageCategories);
        if (pageCategories.length < 100) break;
        page++;
      }
      logger.info(`[bling/sync:categories] fetched ${allCategories.length} categories`);

      await blingRepository.upsertCategories(allCategories);
      logger.info(`[bling/sync:categories] finished sync categories for user ${userId}`);
    } catch (err) {
      logger.error(`[bling/sync:categories] error syncing categories for user ${userId}`);
      throw err;
    }
  }
);
