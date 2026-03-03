import pino from 'pino';
import { createMeliClient, MeliIntegration, createMeliRepository } from '@/lib/mercado-livre';
import { inngest } from '../../client';

const logger = pino();

export const syncStock = inngest.createFunction(
  { id: 'meli/sync:stock' },
  { event: 'meli/sync:stock' },
  async ({ event }) => {
    const { userId, integrationId, itemIds } = event.data;
    const { access_token } = await MeliIntegration.getValidMeliTokens(userId);
    const meliClient = createMeliClient({ accessToken: access_token });
    const meliRepository = createMeliRepository({ integrationId });

    logger.info(`[meli/sync:stock] start sync stock for user ${userId}`);
    
    const allStock = [];
    for (const itemId of itemIds) {
      try {
        const stock = await meliClient.getItemStock(itemId);
        allStock.push(stock);
      } catch (error) {
        logger.error(`[meli/sync:stock] error fetching stock for item ${itemId}: ${error}`);
      }
    }

    logger.info(`[meli/sync:stock] fetched ${allStock.length} stock items`);

    await meliRepository.upsertStockBalance(allStock);
    logger.info(`[meli/sync:stock] finished sync stock for user ${userId}`);
  }
);
