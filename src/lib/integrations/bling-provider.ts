import { IntegrationProvider } from '@prisma/client';
import { createBlingRepository } from '@/lib/bling/bling-repository';
import type {
  InventoryProvider,
  NormalizedProduct,
  NormalizedAlert,
  NormalizedOverviewMetrics,
} from './types';

/**
 * Bling implementation of the InventoryProvider interface.
 * Wraps the existing Bling repository and adapts its data to normalized DTOs.
 */
export class BlingInventoryProvider implements InventoryProvider {
  readonly provider = IntegrationProvider.BLING;

  async getProducts(integrationId: string, take = 50, skip = 0): Promise<NormalizedProduct[]> {
    const repo = createBlingRepository({ integrationId });
    const blingProducts = await repo.getProducts(take, skip);

    return blingProducts.map((product) => ({
      id: product.id,
      externalId: product.blingProductId,
      provider: IntegrationProvider.BLING,
      name: product.name,
      sku: product.sku,
      costPrice: product.costPrice,
      salePrice: product.salePrice,
      currentStock: product.currentStock,
      image: product.image ?? null,
      categoryName: null, // Category not included in basic product query
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    }));
  }

  async getProductById(
    integrationId: string,
    externalId: string
  ): Promise<NormalizedProduct | null> {
    const repo = createBlingRepository({ integrationId });
    const product = await repo.getProductById(externalId);

    if (!product) return null;

    return {
      id: product.id,
      externalId: product.blingProductId,
      provider: IntegrationProvider.BLING,
      name: product.name,
      sku: product.sku,
      costPrice: product.costPrice,
      salePrice: product.salePrice,
      currentStock: product.currentStock,
      image: product.image ?? null,
      categoryName: null, // Can be enhanced later if needed
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
    };
  }

  async getAlerts(integrationId: string): Promise<NormalizedAlert[]> {
    const repo = createBlingRepository({ integrationId });
    const response = await repo.getProductAlerts({ integrationId });

    return response.data
      .filter((product) => product.alert !== null)
      .map((product) => {
        const alert = product.alert!;
        return {
          id: alert.id,
          externalProductId: alert.blingProductId,
          provider: IntegrationProvider.BLING,
          type: alert.type,
          risk: alert.risk,
          vvdReal: alert.vvdReal,
          vvd30: alert.vvd30,
          vvd7: alert.vvd7,
          daysRemaining: alert.daysRemaining,
          reorderPoint: alert.reorderPoint,
          capitalStuck: alert.capitalStuck,
          daysSinceLastSale: alert.daysSinceLastSale,
          message: alert.message ?? null,
          recommendations:
            typeof alert.recommendations === 'string'
              ? JSON.parse(alert.recommendations)
              : (alert.recommendations as string[] | null),
          createdAt: alert.createdAt,
          updatedAt: alert.updatedAt,
        };
      });
  }

  async getOverviewMetrics(
    integrationId: string,
    _params: Record<string, unknown>
  ): Promise<NormalizedOverviewMetrics> {
    const repo = createBlingRepository({ integrationId });
    const metrics = await repo.getOverviewMetrics({ integrationId });

    // Bling returns simpler metrics - adapt to normalized structure
    return {
      totalProducts: 0, // Not provided by Bling repo
      alertCounts: {
        fine: 0,
        rupture: metrics.ruptureCount || 0,
        deadStock: 0,
        opportunity: metrics.opportunityCount || 0,
        liquidation: 0,
      },
      riskCounts: {
        low: 0,
        medium: 0,
        high: 0,
        critical: 0,
      },
      totalCapitalStuck: metrics.capitalStuck || 0,
      totalEstimatedLoss: 0, // Not provided by Bling repo
    };
  }
}
