import pino from 'pino';
import { BlingIntegration, createBlingClient, createBlingRepository } from '@/lib/bling';
import { inngest } from '../../client';

const logger = pino();

export const syncStock = inngest.createFunction(
  { id: 'bling/sync:stock' },
  { event: 'bling/sync:stock' },
  async ({ event }) => {
    const { userId, integrationId, productExternalIds } = event.data;
    const { access_token } = await BlingIntegration.getValidBlingTokens(userId);
    const blingClient = createBlingClient({ accessToken: access_token });
    const blingRepository = createBlingRepository({ integrationId });

    logger.info(`[bling/sync:stock] start sync stock for user ${userId}`);
    const allStock = await blingClient.getStockBalance(productExternalIds);

    logger.info(`[bling/sync:stock] fetched ${allStock.length} stock items`);

    await blingRepository.upsertStockBalance(allStock);
    logger.info(`[bling/sync:stock] finished sync stock for user ${userId}`);
  }
);
