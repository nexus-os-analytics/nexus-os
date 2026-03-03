import type { IntegrationProvider } from '@prisma/client';

/**
 * Normalized product DTO that abstracts away provider-specific fields.
 * Used by dashboard and UI components to work with products from any provider.
 */
export interface NormalizedProduct {
  id: string;
  externalId: string; // blingProductId or meliItemId
  provider: IntegrationProvider;
  name: string;
  sku: string;
  costPrice: number;
  salePrice: number;
  currentStock: number;
  image: string | null;
  categoryName: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Normalized alert DTO that abstracts away provider-specific alert fields.
 */
export interface NormalizedAlert {
  id: string;
  externalProductId: string;
  provider: IntegrationProvider;
  type: string; // 'FINE' | 'RUPTURE' | 'DEAD_STOCK' | 'OPPORTUNITY' | 'LIQUIDATION'
  risk: string; // 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'
  vvdReal: number;
  vvd30: number;
  vvd7: number;
  daysRemaining: number;
  reorderPoint: number;
  capitalStuck: number;
  daysSinceLastSale: number;
  message: string | null;
  recommendations: string[] | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Normalized sales entry DTO.
 */
export interface NormalizedSalesEntry {
  externalProductId: string;
  externalOrderId: string;
  date: Date;
  quantity: number;
  totalValue: number;
}

/**
 * Normalized stock balance DTO.
 */
export interface NormalizedStockBalance {
  externalProductId: string;
  stock: number;
  createdAt: Date;
}

/**
 * Generic overview metrics that work across providers.
 */
export interface NormalizedOverviewMetrics {
  totalProducts: number;
  alertCounts: {
    fine: number;
    rupture: number;
    deadStock: number;
    opportunity: number;
    liquidation: number;
  };
  riskCounts: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  totalCapitalStuck: number;
  totalEstimatedLoss: number;
}

/**
 * Inventory provider interface - implements Strategy pattern.
 * Each integration (Bling, Mercado Livre, etc.) must implement this interface.
 */
export interface InventoryProvider {
  readonly provider: IntegrationProvider;

  /**
   * Get paginated list of products.
   */
  getProducts(
    integrationId: string,
    take?: number,
    skip?: number
  ): Promise<NormalizedProduct[]>;

  /**
   * Get a single product by its external ID.
   */
  getProductById(
    integrationId: string,
    externalId: string
  ): Promise<NormalizedProduct | null>;

  /**
   * Get all alerts for products in this integration.
   */
  getAlerts(integrationId: string): Promise<NormalizedAlert[]>;

  /**
   * Get overview metrics (dashboard summary).
   */
  getOverviewMetrics(
    integrationId: string,
    params: Record<string, unknown>
  ): Promise<NormalizedOverviewMetrics>;
}
