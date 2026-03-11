import { IntegrationProvider } from '@prisma/client';
import { createShopeeRepository } from '@/lib/shopee/shopee-repository';
import { normalizeShopeeAlert, normalizeShopeeProduct } from '@/lib/shopee/shopee-utils';
import type {
  InventoryProvider,
  NormalizedAlert,
  NormalizedOverviewMetrics,
  NormalizedProduct,
} from './types';

/**
 * Shopee implementation of the InventoryProvider interface.
 * Wraps the Shopee repository and adapts its data to normalized DTOs.
 */
export class ShopeeInventoryProvider implements InventoryProvider {
  readonly provider = IntegrationProvider.SHOPEE;

  async getProducts(integrationId: string, take = 50, skip = 0): Promise<NormalizedProduct[]> {
    const repo = createShopeeRepository({ integrationId });
    const products = await repo.getProducts(take, skip);
    return products.map(normalizeShopeeProduct);
  }

  async getProductById(
    integrationId: string,
    externalId: string
  ): Promise<NormalizedProduct | null> {
    const repo = createShopeeRepository({ integrationId });
    const product = await repo.getProductById(externalId);
    return product ? normalizeShopeeProduct(product) : null;
  }

  async getAlerts(integrationId: string): Promise<NormalizedAlert[]> {
    const repo = createShopeeRepository({ integrationId });
    const result = await repo.getProductAlerts({ integrationId });

    return result.data.filter((p) => p.alert != null).map((p) => normalizeShopeeAlert(p.alert!));
  }

  async getOverviewMetrics(
    integrationId: string,
    _params: Record<string, unknown>
  ): Promise<NormalizedOverviewMetrics> {
    const repo = createShopeeRepository({ integrationId });

    const [products, alertCounts] = await Promise.all([
      repo.getProducts(1000, 0),
      repo.getProductAlerts({ integrationId, limit: 1000 }),
    ]);

    const fine = alertCounts.data.filter((p) => p.alert?.type === 'FINE').length;
    const rupture = alertCounts.data.filter((p) => p.alert?.type === 'RUPTURE').length;
    const deadStock = alertCounts.data.filter((p) => p.alert?.type === 'DEAD_STOCK').length;
    const opportunity = alertCounts.data.filter((p) => p.alert?.type === 'OPPORTUNITY').length;
    const liquidation = alertCounts.data.filter((p) => p.alert?.type === 'LIQUIDATION').length;

    const low = alertCounts.data.filter((p) => p.alert?.risk === 'LOW').length;
    const medium = alertCounts.data.filter((p) => p.alert?.risk === 'MEDIUM').length;
    const high = alertCounts.data.filter((p) => p.alert?.risk === 'HIGH').length;
    const critical = alertCounts.data.filter((p) => p.alert?.risk === 'CRITICAL').length;

    const totalCapitalStuck = products
      .filter((p) => p.alert?.type === 'DEAD_STOCK')
      .reduce((sum, p) => sum + (p.alert?.capitalStuck ?? 0), 0);

    const totalEstimatedLoss = products
      .filter((p) => p.alert?.type === 'RUPTURE')
      .reduce((sum, p) => sum + (p.alert?.estimatedLostAmount ?? 0), 0);

    return {
      totalProducts: products.length,
      alertCounts: { fine, rupture, deadStock, opportunity, liquidation },
      riskCounts: { low, medium, high, critical },
      totalCapitalStuck,
      totalEstimatedLoss,
    };
  }
}
