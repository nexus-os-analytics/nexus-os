import pino from 'pino';
import { createShopeeClient, ShopeeIntegration, createShopeeRepository } from '@/lib/shopee';
import { inngest } from '../../client';

const logger = pino();

export const syncStock = inngest.createFunction(
  { id: 'shopee/sync:stock' },
  { event: 'shopee/sync:stock' },
  async ({ event }) => {
    const { userId, integrationId, itemIds } = event.data;

    try {
      const { access_token: accessToken, shop_id: shopId } =
        await ShopeeIntegration.getValidShopeeTokens(userId);
      const shopeeClient = createShopeeClient({ accessToken, shopId });
      const shopeeRepository = createShopeeRepository({ integrationId });

      logger.info(`[shopee/sync:stock] start sync stock for user ${userId}`);

      // getStockInfo takes number[] — batch all at once (up to 50 per Shopee limit)
      const BATCH_SIZE = 50;
      const allStock = [];
      for (let i = 0; i < itemIds.length; i += BATCH_SIZE) {
        const batch = itemIds.slice(i, i + BATCH_SIZE).map(Number);
        try {
          const stockItems = await shopeeClient.getStockInfo(batch);
          allStock.push(...stockItems);
        } catch (error) {
          logger.error(
            { error, batchStart: i, userId, integrationId },
            `[shopee/sync:stock] Failed to fetch stock for batch starting at ${i}`
          );
        }
      }

      logger.info(`[shopee/sync:stock] fetched ${allStock.length} stock items`);

      await shopeeRepository.upsertStockBalance(allStock);
      logger.info(`[shopee/sync:stock] finished sync stock for user ${userId}`);
    } catch (err) {
      logger.error(
        { error: err, userId, integrationId },
        `[shopee/sync:stock] Failed to sync stock for user ${userId}`
      );
      throw err;
    }
  }
);
