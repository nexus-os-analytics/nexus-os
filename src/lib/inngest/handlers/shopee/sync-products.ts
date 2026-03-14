import pino from 'pino';
import { getPlanEntitlements } from '@/features/billing/entitlements';
import { createShopeeClient, ShopeeIntegration, createShopeeRepository } from '@/lib/shopee';
import type { ShopeeProductType } from '@/lib/shopee';
import prisma from '@/lib/prisma';
import { inngest } from '../../client';

const logger = pino();

export const syncProducts = inngest.createFunction(
  { id: 'shopee/sync:products' },
  { event: 'shopee/sync:products' },
  async ({ event, step }) => {
    const { userId, integrationId } = event.data;

    try {
      const { access_token: accessToken, shop_id: shopId } =
        await ShopeeIntegration.getValidShopeeTokens(userId);
      const shopeeClient = createShopeeClient({ accessToken, shopId });
      const shopeeRepository = createShopeeRepository({ integrationId });

      logger.info(`[shopee/sync:products] start sync products for user ${userId}`);

      const allProducts: ShopeeProductType[] = [];
      let offset = 0;
      const pageSize = 50;

      while (true) {
        const listResponse = await shopeeClient.getItemList(offset, pageSize);
        if (!listResponse.items || listResponse.items.length === 0) break;

        const itemIds = listResponse.items.map((i: { item_id: number }) => i.item_id);
        const fetchedProducts = await shopeeClient.getItemBaseInfo(itemIds);
        allProducts.push(...fetchedProducts);

        if (!listResponse.hasNextPage) break;
        offset += pageSize;
      }

      logger.info(`[shopee/sync:products] fetched ${allProducts.length} products`);

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { planTier: true },
      });
      const entitlements = getPlanEntitlements(user?.planTier === 'PRO' ? 'PRO' : 'FREE');
      const limitedProducts: ShopeeProductType[] =
        entitlements.productLimit === 'unlimited'
          ? allProducts
          : allProducts.slice(0, entitlements.productLimit);

      await shopeeRepository.upsertProducts(limitedProducts);
      logger.info(`[shopee/sync:products] finished upsert for user ${userId}`);

      // Emit categories sync
      const uniqueCategoryIds = Array.from(
        new Set(limitedProducts.map((p) => p.shopeeCategoryId).filter(Boolean))
      ) as string[];
      await step.sendEvent('shopee/sync:categories', {
        name: 'shopee/sync:categories',
        data: { userId, integrationId, categoryIds: uniqueCategoryIds },
      });

      // Emit stock sync
      const itemIds = limitedProducts.map((p) => String(p.shopeeItemId));
      await step.sendEvent('shopee/sync:stock', {
        name: 'shopee/sync:stock',
        data: { userId, integrationId, itemIds },
      });

      // Emit sales sync (last 30 days)
      const now = Math.floor(Date.now() / 1000);
      const thirtyDaysAgo = now - 30 * 24 * 60 * 60;
      await step.sendEvent('shopee/sync:sales-ids', {
        name: 'shopee/sync:sales-ids',
        data: { userId, integrationId, shopId, timeFrom: thirtyDaysAgo, timeTo: now },
      });
    } catch (err) {
      logger.error(
        { error: err, userId, integrationId },
        `[shopee/sync:products] Failed to sync products for user ${userId}`
      );
      throw err;
    }
  }
);
