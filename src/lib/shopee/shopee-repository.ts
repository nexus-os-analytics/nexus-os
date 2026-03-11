import type { ShopeeAlertType, ShopeeRuptureRisk } from '@prisma/client';
import prisma from '../prisma';
import type {
  ShopeeCategoryType,
  ShopeeProductMetrics,
  ShopeeProductSettingsType,
  ShopeeProductType,
  ShopeeSalesHistoryType,
  ShopeeStockBalanceType,
} from './shopee-types';

interface ShopeeRepositoryOptions {
  integrationId: string;
}

export interface GetShopeeProductAlertsParams {
  integrationId: string;
  limit?: number;
  filters?: {
    type?: ShopeeAlertType[];
    risk?: ShopeeRuptureRisk[];
  };
}

export interface GetShopeeProductAlertsResponse {
  data: ShopeeProductType[];
  nextCursor: string | null;
  hasNextPage: boolean;
}

export interface GetShopeeOverviewMetricsParams {
  integrationId: string;
}

export interface GetShopeeOverviewMetricsResponse {
  capitalStuck: number;
  ruptureCount: number;
  opportunityCount: number;
  topActions: Array<{
    id: string;
    title: string;
    sku: string | null;
    recommendations: string | null;
    impactAmount?: number;
    impactLabel?: string;
    alertType?: ShopeeAlertType;
    alertRisk?: ShopeeRuptureRisk;
  }>;
  productCount?: number;
  productLimit?: number | null;
}

export function createShopeeRepository({ integrationId }: ShopeeRepositoryOptions) {
  async function upsertProducts(products: ShopeeProductType[]): Promise<void> {
    try {
      for (const product of products) {
        const {
          shopeeItemId,
          shopeeCategoryId,
          sku,
          title,
          costPrice,
          salePrice,
          currentStock,
          thumbnail,
          permalink,
          status,
        } = product;

        await prisma.shopeeProduct.upsert({
          where: { shopeeItemId: String(shopeeItemId) },
          create: {
            shopeeItemId: String(shopeeItemId),
            shopeeCategoryId: shopeeCategoryId ?? null,
            sku: sku ?? null,
            title,
            costPrice,
            salePrice,
            currentStock,
            thumbnail: thumbnail ?? null,
            permalink: permalink ?? null,
            status: status ?? null,
            integrationId,
          },
          update: {
            shopeeCategoryId: shopeeCategoryId ?? null,
            sku: sku ?? null,
            title,
            costPrice,
            salePrice,
            currentStock,
            thumbnail: thumbnail ?? null,
            permalink: permalink ?? null,
            status: status ?? null,
            integrationId,
          },
        });

        // Ensure settings exist AFTER product upsert to satisfy FK constraint
        await prisma.shopeeProductSettings.upsert({
          where: { shopeeItemId: String(shopeeItemId) },
          create: { shopeeItemId: String(shopeeItemId) },
          update: {},
        });
      }
    } catch (error) {
      console.error('Error upserting Shopee products:', error);
      throw error;
    }
  }

  async function getProducts(take: number = 100, skip: number = 0): Promise<ShopeeProductType[]> {
    const products = await prisma.shopeeProduct.findMany({
      where: { integrationId },
      take,
      skip,
    });

    return products.map((p) => ({
      id: p.id,
      shopeeItemId: p.shopeeItemId,
      shopeeCategoryId: p.shopeeCategoryId,
      sku: p.sku,
      title: p.title,
      costPrice: p.costPrice,
      salePrice: p.salePrice,
      currentStock: p.currentStock,
      thumbnail: p.thumbnail,
      permalink: p.permalink,
      status: p.status,
      createdAt: p.createdAt,
      updatedAt: p.updatedAt,
    }));
  }

  async function getProductById(shopeeItemId: string): Promise<ShopeeProductType | null> {
    const product = await prisma.shopeeProduct.findFirst({
      where: { integrationId, shopeeItemId: String(shopeeItemId) },
      include: { alert: true, settings: true },
    });

    if (!product) return null;

    return {
      id: product.id,
      shopeeItemId: product.shopeeItemId,
      shopeeCategoryId: product.shopeeCategoryId,
      sku: product.sku,
      title: product.title,
      costPrice: product.costPrice,
      salePrice: product.salePrice,
      currentStock: product.currentStock,
      thumbnail: product.thumbnail,
      permalink: product.permalink,
      status: product.status,
      createdAt: product.createdAt,
      updatedAt: product.updatedAt,
      alert: product.alert
        ? {
            id: product.alert.id,
            shopeeItemId: product.alert.shopeeItemId,
            type: product.alert.type,
            risk: product.alert.risk,
            vvdReal: product.alert.vvdReal,
            vvd30: product.alert.vvd30,
            vvd7: product.alert.vvd7,
            daysRemaining: product.alert.daysRemaining,
            reorderPoint: product.alert.reorderPoint,
            growthTrend: product.alert.growthTrend,
            capitalStuck: product.alert.capitalStuck,
            daysSinceLastSale: product.alert.daysSinceLastSale,
            suggestedPrice: product.alert.suggestedPrice,
            discount: product.alert.discount,
            discountAmount: product.alert.discountAmount,
            estimatedDeadline: product.alert.estimatedDeadline,
            recoverableAmount: product.alert.recoverableAmount,
            daysOutOfStock: product.alert.daysOutOfStock,
            estimatedLostSales: product.alert.estimatedLostSales,
            estimatedLostAmount: product.alert.estimatedLostAmount,
            idealStock: product.alert.idealStock,
            excessUnits: product.alert.excessUnits,
            excessPercentage: product.alert.excessPercentage,
            excessCapital: product.alert.excessCapital,
            message: product.alert.message,
            recommendations: JSON.stringify(product.alert.recommendations),
            lastCriticalNotifiedAt: product.alert.lastCriticalNotifiedAt,
            createdAt: product.alert.createdAt,
            updatedAt: product.alert.updatedAt,
          }
        : null,
      settings: product.settings
        ? {
            id: product.settings.id,
            shopeeItemId: product.settings.shopeeItemId,
            leadTimeDays: product.settings.leadTimeDays,
            safetyDays: product.settings.safetyDays,
            criticalDaysRemainingThreshold: product.settings.criticalDaysRemainingThreshold,
            highDaysRemainingThreshold: product.settings.highDaysRemainingThreshold,
            mediumDaysRemainingThreshold: product.settings.mediumDaysRemainingThreshold,
            opportunityGrowthThresholdPct: product.settings.opportunityGrowthThresholdPct,
            opportunityDemandVvd: product.settings.opportunityDemandVvd,
            deadStockCapitalThreshold: product.settings.deadStockCapitalThreshold,
            capitalOptimizationThreshold: product.settings.capitalOptimizationThreshold,
            ruptureCapitalThreshold: product.settings.ruptureCapitalThreshold,
            liquidationDiscount: product.settings.liquidationDiscount,
            costFactor: product.settings.costFactor,
            liquidationExcessCapitalThreshold: product.settings.liquidationExcessCapitalThreshold,
            fineExcessCapitalMax: product.settings.fineExcessCapitalMax,
          }
        : null,
    };
  }

  async function getProductSettings(
    shopeeItemId: string
  ): Promise<ShopeeProductSettingsType | null> {
    const settings = await prisma.shopeeProductSettings.findFirst({
      where: { shopeeItemId: String(shopeeItemId) },
    });

    if (!settings) return null;

    return {
      id: settings.id,
      shopeeItemId: settings.shopeeItemId,
      leadTimeDays: settings.leadTimeDays,
      safetyDays: settings.safetyDays,
      criticalDaysRemainingThreshold: settings.criticalDaysRemainingThreshold,
      highDaysRemainingThreshold: settings.highDaysRemainingThreshold,
      mediumDaysRemainingThreshold: settings.mediumDaysRemainingThreshold,
      opportunityGrowthThresholdPct: settings.opportunityGrowthThresholdPct,
      opportunityDemandVvd: settings.opportunityDemandVvd,
      deadStockCapitalThreshold: settings.deadStockCapitalThreshold,
      capitalOptimizationThreshold: settings.capitalOptimizationThreshold,
      ruptureCapitalThreshold: settings.ruptureCapitalThreshold,
      liquidationDiscount: settings.liquidationDiscount,
      costFactor: settings.costFactor,
      liquidationExcessCapitalThreshold: settings.liquidationExcessCapitalThreshold,
      fineExcessCapitalMax: settings.fineExcessCapitalMax,
    };
  }

  async function updateProductSettings(
    shopeeItemId: string,
    settings: Partial<ShopeeProductSettingsType>
  ): Promise<void> {
    await prisma.shopeeProductSettings.updateMany({
      where: { shopeeItemId: String(shopeeItemId) },
      data: settings,
    });
  }

  async function upsertCategories(categories: ShopeeCategoryType[]): Promise<void> {
    try {
      for (const category of categories) {
        const { shopeeCategoryId, name } = category;
        await prisma.shopeeCategory.upsert({
          where: { shopeeCategoryId: String(shopeeCategoryId) },
          create: { shopeeCategoryId: String(shopeeCategoryId), name },
          update: { name },
        });
      }
    } catch (error) {
      console.error('Error upserting Shopee categories:', error);
      throw error;
    }
  }

  async function getCategories(): Promise<ShopeeCategoryType[]> {
    const categories = await prisma.shopeeCategory.findMany();
    return categories.map((c) => ({
      id: c.id,
      shopeeCategoryId: c.shopeeCategoryId,
      name: c.name,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
    }));
  }

  async function getCategoryById(shopeeCategoryId: string): Promise<ShopeeCategoryType | null> {
    const category = await prisma.shopeeCategory.findFirst({
      where: { shopeeCategoryId: String(shopeeCategoryId) },
    });
    if (!category) return null;
    return {
      id: category.id,
      shopeeCategoryId: category.shopeeCategoryId,
      name: category.name,
      createdAt: category.createdAt,
      updatedAt: category.updatedAt,
    };
  }

  async function upsertSalesHistory(sales: ShopeeSalesHistoryType[]): Promise<void> {
    try {
      for (const sale of sales) {
        const { shopeeItemId, shopeeOrderSn, date, quantity, totalValue } = sale;

        const product = await prisma.shopeeProduct.findFirst({
          where: { integrationId, shopeeItemId: String(shopeeItemId) },
          select: { id: true },
        });

        if (!product) {
          console.warn(
            `Skipping order ${shopeeOrderSn}: product not found for shopeeItemId ${shopeeItemId}`
          );
          continue;
        }

        await prisma.shopeeOrderHistory.upsert({
          where: {
            shopeeOrderSn_shopeeItemId: {
              shopeeOrderSn: String(shopeeOrderSn),
              shopeeItemId: String(shopeeItemId),
            },
          },
          create: {
            shopeeOrderSn: String(shopeeOrderSn),
            shopeeItemId: String(shopeeItemId),
            date,
            quantity,
            totalValue,
          },
          update: { quantity, totalValue, date },
        });
      }
    } catch (error) {
      console.error('Error upserting Shopee sales history:', error);
      throw error;
    }
  }

  async function getSalesHistory(shopeeItemId: string): Promise<ShopeeSalesHistoryType[]> {
    const history = await prisma.shopeeOrderHistory.findMany({
      where: { shopeeItemId: String(shopeeItemId) },
      orderBy: { date: 'desc' },
    });

    return history.map((h) => ({
      id: h.id,
      shopeeOrderSn: h.shopeeOrderSn,
      shopeeItemId: h.shopeeItemId,
      date: h.date,
      quantity: h.quantity,
      totalValue: h.totalValue,
      createdAt: h.createdAt,
      updatedAt: h.updatedAt,
    }));
  }

  async function upsertStockBalance(balances: ShopeeStockBalanceType[]): Promise<void> {
    try {
      for (const balance of balances) {
        const { shopeeItemId, stock } = balance;

        const product = await prisma.shopeeProduct.findFirst({
          where: { integrationId, shopeeItemId: String(shopeeItemId) },
          select: { id: true },
        });

        if (!product) {
          console.warn(`Skipping stock for shopeeItemId ${shopeeItemId}: product not found`);
          continue;
        }

        const existing = await prisma.shopeeStockBalance.findFirst({
          where: { shopeeItemId: String(shopeeItemId) },
          select: { id: true },
        });

        if (existing) {
          await prisma.shopeeStockBalance.update({
            where: { id: existing.id },
            data: { stock },
          });
        } else {
          await prisma.shopeeStockBalance.create({
            data: { shopeeItemId: String(shopeeItemId), stock },
          });
        }
      }
    } catch (error) {
      console.error('Error upserting Shopee stock balance:', error);
      throw error;
    }
  }

  async function getStockBalance(shopeeItemId: string): Promise<ShopeeStockBalanceType | null> {
    const balance = await prisma.shopeeStockBalance.findFirst({
      where: { shopeeItemId: String(shopeeItemId) },
    });
    if (!balance) return null;
    return {
      id: balance.id,
      shopeeItemId: balance.shopeeItemId,
      stock: balance.stock,
      createdAt: balance.createdAt,
      updatedAt: balance.updatedAt,
    };
  }

  async function upsertProductAlert(
    shopeeItemId: string,
    productMetrics: ShopeeProductMetrics
  ): Promise<{ previousRisk: ShopeeRuptureRisk | null }> {
    try {
      const product = await prisma.shopeeProduct.findFirst({
        where: { integrationId, shopeeItemId: String(shopeeItemId) },
        select: { id: true },
      });

      if (!product) {
        console.warn(`Skipping alert for shopeeItemId ${shopeeItemId}: product not found`);
        return { previousRisk: null };
      }

      const existingAlert = await prisma.shopeeAlert.findUnique({
        where: { shopeeItemId: String(shopeeItemId) },
        select: { risk: true },
      });

      await prisma.shopeeAlert.upsert({
        where: { shopeeItemId: String(shopeeItemId) },
        create: {
          ...productMetrics,
          product: { connect: { shopeeItemId: String(shopeeItemId) } },
        },
        update: { ...productMetrics },
      });

      return { previousRisk: existingAlert?.risk ?? null };
    } catch (error) {
      console.error('Error upserting Shopee product alert:', error);
      throw error;
    }
  }

  async function getProductAlerts(
    params: GetShopeeProductAlertsParams
  ): Promise<GetShopeeProductAlertsResponse> {
    const { limit = 20, integrationId, filters } = params;

    const products = await prisma.shopeeProduct.findMany({
      where: {
        integrationId,
        alert: {
          type: filters?.type ? { in: filters.type } : undefined,
          risk: filters?.risk ? { in: filters.risk } : undefined,
        },
      },
      include: { alert: true },
      take: limit,
      orderBy: { createdAt: 'desc' },
    });

    return {
      data: products.map((p) => ({
        id: p.id,
        shopeeItemId: p.shopeeItemId,
        shopeeCategoryId: p.shopeeCategoryId,
        sku: p.sku,
        title: p.title,
        costPrice: p.costPrice,
        salePrice: p.salePrice,
        currentStock: p.currentStock,
        thumbnail: p.thumbnail,
        permalink: p.permalink,
        status: p.status,
        createdAt: p.createdAt,
        updatedAt: p.updatedAt,
        alert: p.alert
          ? {
              id: p.alert.id,
              shopeeItemId: p.alert.shopeeItemId,
              type: p.alert.type,
              risk: p.alert.risk,
              vvdReal: p.alert.vvdReal,
              vvd30: p.alert.vvd30,
              vvd7: p.alert.vvd7,
              daysRemaining: p.alert.daysRemaining,
              reorderPoint: p.alert.reorderPoint,
              growthTrend: p.alert.growthTrend,
              capitalStuck: p.alert.capitalStuck,
              daysSinceLastSale: p.alert.daysSinceLastSale,
              suggestedPrice: p.alert.suggestedPrice,
              discount: p.alert.discount,
              discountAmount: p.alert.discountAmount,
              estimatedDeadline: p.alert.estimatedDeadline,
              recoverableAmount: p.alert.recoverableAmount,
              daysOutOfStock: p.alert.daysOutOfStock,
              estimatedLostSales: p.alert.estimatedLostSales,
              estimatedLostAmount: p.alert.estimatedLostAmount,
              idealStock: p.alert.idealStock,
              excessUnits: p.alert.excessUnits,
              excessPercentage: p.alert.excessPercentage,
              excessCapital: p.alert.excessCapital,
              message: p.alert.message,
              recommendations: JSON.stringify(p.alert.recommendations),
              lastCriticalNotifiedAt: p.alert.lastCriticalNotifiedAt,
              createdAt: p.alert.createdAt,
              updatedAt: p.alert.updatedAt,
            }
          : null,
      })),
      nextCursor: products.length > 0 ? products[products.length - 1].id : null,
      hasNextPage: products.length >= limit,
    };
  }

  async function getOverviewMetrics({
    integrationId,
  }: GetShopeeOverviewMetricsParams): Promise<GetShopeeOverviewMetricsResponse> {
    const products = await prisma.shopeeProduct.findMany({
      where: {
        integrationId,
        alert: { type: { in: ['DEAD_STOCK', 'LIQUIDATION'] } },
      },
      include: { alert: true },
    });

    let ruptureCount = 0;
    let opportunityCount = 0;
    const topActions: GetShopeeOverviewMetricsResponse['topActions'] = [];

    for (const product of products) {
      if (product.alert) {
        if (product.alert.type === 'RUPTURE') ruptureCount += 1;
        if (product.alert.type === 'OPPORTUNITY') opportunityCount += 1;

        let impactAmount: number | undefined;
        let impactLabel: string | undefined;

        if (product.alert.type === 'DEAD_STOCK') {
          impactAmount = product.alert.capitalStuck;
          impactLabel = 'Capital parado';
        } else if (product.alert.type === 'LIQUIDATION') {
          impactAmount = product.alert.excessCapital;
          impactLabel = 'Capital em excesso';
        }

        topActions.push({
          id: product.id,
          title: product.title,
          sku: product.sku,
          recommendations: product.alert.recommendations
            ? JSON.stringify(product.alert.recommendations)
            : null,
          impactAmount,
          impactLabel,
          alertType: product.alert.type,
          alertRisk: product.alert.risk,
        });
      }
    }

    const capitalStuck = products.reduce((sum, p) => sum + p.currentStock * p.salePrice, 0);

    const riskOrder: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };
    const sortedTopActions = topActions.toSorted((a, b) => {
      const aRisk = products.find((p) => p.id === a.id)?.alert?.risk ?? 'LOW';
      const bRisk = products.find((p) => p.id === b.id)?.alert?.risk ?? 'LOW';
      return (riskOrder[bRisk] ?? 0) - (riskOrder[aRisk] ?? 0);
    });

    return {
      capitalStuck,
      ruptureCount,
      opportunityCount,
      topActions: sortedTopActions.slice(0, 3),
    };
  }

  async function markCriticalNotified(shopeeItemId: string, jobId?: string): Promise<void> {
    await prisma.shopeeAlert.update({
      where: { shopeeItemId: String(shopeeItemId) },
      data: {
        lastCriticalNotifiedAt: new Date(),
        jobId: jobId ?? undefined,
      },
    });
  }

  return {
    upsertProducts,
    getProducts,
    getProductById,
    getProductSettings,
    updateProductSettings,
    upsertCategories,
    getCategories,
    getCategoryById,
    upsertSalesHistory,
    getSalesHistory,
    upsertStockBalance,
    getStockBalance,
    upsertProductAlert,
    getProductAlerts,
    getOverviewMetrics,
    markCriticalNotified,
  };
}
