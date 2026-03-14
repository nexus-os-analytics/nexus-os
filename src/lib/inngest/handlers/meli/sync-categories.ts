import pino from 'pino';
import { createMeliClient, MeliIntegration, createMeliRepository } from '@/lib/mercado-livre';
import { inngest } from '../../client';

const logger = pino();

export const syncCategories = inngest.createFunction(
  { id: 'meli/sync:categories' },
  { event: 'meli/sync:categories' },
  async ({ event }) => {
    const { userId, integrationId, categoryIds } = event.data;

    try {
      const integration = await MeliIntegration.getMeliIntegration(userId);

      if (!integration) {
        logger.warn(`[meli/sync:categories] error fetching integration for user ${userId}`);
        return;
      }

      const meliClient = createMeliClient({
        accessToken: integration.access_token,
      });

      const meliRepository = createMeliRepository({
        integrationId,
      });

      logger.info(`[meli/sync:categories] start sync categories for user ${userId}`);

      const allCategories = [];
      for (const categoryId of categoryIds) {
        try {
          const category = await meliClient.getCategory(categoryId);
          allCategories.push(category);
        } catch (error) {
          logger.error(
            { error, categoryId, userId, integrationId },
            `[meli/sync:categories] Failed to fetch category ${categoryId}`
          );
        }
      }

      logger.info(`[meli/sync:categories] fetched ${allCategories.length} categories`);

      await meliRepository.upsertCategories(allCategories);
      logger.info(`[meli/sync:categories] finished sync categories for user ${userId}`);
    } catch (err) {
      logger.error(
        { error: err, userId, integrationId },
        `[meli/sync:categories] Failed to sync categories for user ${userId}`
      );
      throw err;
    }
  }
);
