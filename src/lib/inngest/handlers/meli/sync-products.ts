import pino from 'pino';
import { getPlanEntitlements } from '@/features/billing/entitlements';
import { createMeliClient, MeliIntegration, createMeliRepository } from '@/lib/mercado-livre';
import type { MeliProductType as Product } from '@/lib/mercado-livre';
import prisma from '@/lib/prisma';
import { daysAgoISO } from '@/lib/utils';
import { inngest } from '../../client';

const logger = pino();

export const syncProducts = inngest.createFunction(
  { id: 'meli/sync:products' },
  { event: 'meli/sync:products' },
  async ({ event, step }) => {
    const { userId, integrationId } = event.data;

    try {
      const { access_token, meliUserId } = await MeliIntegration.getValidMeliTokens(userId);
      const meliClient = createMeliClient({ accessToken: access_token });
      const meliRepository = createMeliRepository({ integrationId });

      logger.info(`[meli/sync:products] start sync products for user ${userId}`);

      const sellerId = parseInt(meliUserId, 10);
      const allProducts: Product[] = [];
      let offset = 0;
      const limit = 50;

      while (true) {
        const pageProducts = await meliClient.getItems(sellerId, offset, limit);
        if (!pageProducts || pageProducts.length === 0) break;
        allProducts.push(...pageProducts);
        if (pageProducts.length < limit) break;
        offset += limit;
      }

      logger.info(`[meli/sync:products] fetched ${allProducts.length} products`);

      // Enforce plan product limits
      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { planTier: true },
      });
      const entitlements = getPlanEntitlements(user?.planTier === 'PRO' ? 'PRO' : 'FREE');
      const limitedProducts: Product[] =
        entitlements.productLimit === 'unlimited'
          ? allProducts
          : allProducts.slice(0, entitlements.productLimit);

      if (limitedProducts.length !== allProducts.length) {
        logger.info(
          `[meli/sync:products] applying plan limit: ${limitedProducts.length}/${allProducts.length}`
        );
      }

      // Upsert via repository
      await meliRepository.upsertProducts(limitedProducts);
      logger.info(`[meli/sync:products] finished sync products for user ${userId}`);

      // Emit categories sync
      const uniqueCategoryIds = Array.from(
        new Set(limitedProducts.map((p) => p.meliCategoryId).filter(Boolean))
      );
      await step.sendEvent('meli/sync:categories', {
        name: 'meli/sync:categories',
        data: { userId, integrationId, categoryIds: uniqueCategoryIds },
      });

      // Emit stock sync
      const itemIds = limitedProducts.map((p) => String(p.meliItemId));
      await step.sendEvent('meli/sync:stock', {
        name: 'meli/sync:stock',
        data: { userId, integrationId, itemIds },
      });

      // Emit sales sync (last 30 days)
      const dateEnd = daysAgoISO(0);
      const dateStart = daysAgoISO(30);
      await step.sendEvent('meli/sync:sales-ids', {
        name: 'meli/sync:sales-ids',
        data: { userId, integrationId, sellerId, dateStart, dateEnd },
      });
    } catch (err) {
      logger.error(
        { error: err, userId, integrationId },
        `[meli/sync:products] Failed to sync products for user ${userId}`
      );
      throw err;
    }
  }
);
