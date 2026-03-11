import { IntegrationProvider } from '@prisma/client';
import type { NormalizedAlert, NormalizedProduct } from '@/lib/integrations/types';
import type { ShopeeProductAlertType, ShopeeProductType } from './shopee-types';

export function normalizeShopeeProduct(product: ShopeeProductType): NormalizedProduct {
  return {
    id: product.id ?? '',
    externalId: String(product.shopeeItemId),
    provider: IntegrationProvider.SHOPEE,
    name: product.title,
    sku: product.sku ?? '',
    costPrice: product.costPrice,
    salePrice: product.salePrice,
    currentStock: product.currentStock,
    image: product.thumbnail ?? null,
    categoryName: null,
    createdAt: product.createdAt ?? new Date(),
    updatedAt: product.updatedAt ?? new Date(),
  };
}

export function normalizeShopeeAlert(alert: ShopeeProductAlertType): NormalizedAlert {
  return {
    id: alert.id ?? '',
    externalProductId: String(alert.shopeeItemId),
    provider: IntegrationProvider.SHOPEE,
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
    recommendations: alert.recommendations ? JSON.parse(alert.recommendations) : null,
    createdAt: alert.createdAt ?? new Date(),
    updatedAt: alert.updatedAt ?? new Date(),
  };
}
