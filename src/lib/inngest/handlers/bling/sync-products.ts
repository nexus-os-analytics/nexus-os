import pino from 'pino';
import {
  BlingIntegration,
  createBlingClient,
  createBlingRepository,
  type Product,
} from '@/lib/bling';
import { inngest } from '../../client';

const logger = pino();

export const syncProducts = inngest.createFunction(
  { id: 'bling/sync:products' },
  { event: 'bling/sync:products' },
  async ({ event, step }) => {
    const { userId, integrationId } = event.data;
    const { access_token } = await BlingIntegration.getValidBlingTokens(userId);
    const blingClient = createBlingClient({ accessToken: access_token });
    const blingRepository = createBlingRepository({ integrationId });

    logger.info(`[bling/sync:products] start sync products for user ${userId}`);
    const allProducts: Product[] = [];
    let page = 1;
    while (true) {
      const pageProducts = await blingClient.getProducts(page);
      if (!pageProducts || pageProducts.length === 0) break;
      allProducts.push(...pageProducts);
      if (pageProducts.length < 100) break;
      page++;
    }
    logger.info(`[bling/sync:products] fetched ${allProducts.length} products`);

    // upsert através do repository
    await blingRepository.upsertProducts(allProducts);
    logger.info(`[bling/sync:products] finished sync products for user ${userId}`);

    // emit categories sync (product categories)
    await step.sendEvent('bling/sync:categories', {
      name: 'bling/sync:categories',
      data: { userId, integrationId },
    });

    // emit stock sync (product external ids)
    const externalIds = allProducts.map((p) => String(p.id));
    await step.sendEvent('bling/sync:stock', {
      name: 'bling/sync:stock',
      data: { userId, integrationId, productExternalIds: externalIds },
    });

    // emit sales id sync (last 90 days)
    const dateEnd = new Date().toISOString().split('T')[0];
    const dateStart = new Date(Date.now() - 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    await step.sendEvent('bling/sync:sales-ids', {
      name: 'bling/sync:sales-ids',
      data: { userId, integrationId, dateStart, dateEnd },
    });
  }
);
