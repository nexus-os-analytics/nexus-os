import pino from 'pino';
import { createShopeeClient, ShopeeIntegration, createShopeeRepository } from '@/lib/shopee';
import { inngest } from '../../client';

const logger = pino();

export const syncCategories = inngest.createFunction(
  { id: 'shopee/sync:categories' },
  { event: 'shopee/sync:categories' },
  async ({ event }) => {
    const { userId, integrationId, categoryIds } = event.data;

    try {
      const { access_token: accessToken, shop_id: shopId } = await ShopeeIntegration.getValidShopeeTokens(userId);
      const shopeeClient = createShopeeClient({ accessToken, shopId });
      const shopeeRepository = createShopeeRepository({ integrationId });

      logger.info(`[shopee/sync:categories] start sync categories for user ${userId}`);

      const categories = await shopeeClient.getShopCategories();

      // Filter to only the categories that contain products
      const filteredCategories =
        categoryIds.length > 0
          ? categories.filter((c) => categoryIds.includes(c.shopeeCategoryId))
          : categories;

      logger.info(`[shopee/sync:categories] upserting ${filteredCategories.length} categories`);

      await shopeeRepository.upsertCategories(filteredCategories);
      logger.info(`[shopee/sync:categories] finished sync categories for user ${userId}`);
    } catch (err) {
      logger.error(
        { error: err, userId, integrationId },
        `[shopee/sync:categories] Failed to sync categories for user ${userId}`
      );
      throw err;
    }
  }
);
