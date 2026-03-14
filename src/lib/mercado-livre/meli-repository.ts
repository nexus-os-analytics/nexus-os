import type { MeliRuptureRisk } from '@prisma/client';
import type {
  GetMeliProductsAlertsParams,
  GetMeliProductAlertsResponse,
  GetOverviewMetricsParams,
  GetOverviewMetricsResponse,
} from '@/features/products/types';
import prisma from '../prisma';
import type {
  MeliCategoryType,
  MeliProductMetrics,
  MeliProductSettingsType,
  MeliProductType,
  MeliSalesHistoryType,
  MeliStockBalanceType,
} from './meli-types';

interface MeliRepositoryOptions {
  integrationId: string;
}

export function createMeliRepository({ integrationId }: MeliRepositoryOptions) {
  /**
   * Upsert products into the database
   */
  async function upsertProducts(products: MeliProductType[]): Promise<void> {
    try {
      for (const product of products) {
        const {
          meliItemId,
          sku,
          title,
          costPrice,
          salePrice,
          currentStock,
          thumbnail,
          permalink,
          listingType,
          status,
        } = product;

        await prisma.meliProduct.upsert({
          where: { meliItemId: String(meliItemId) },
          create: {
            meliItemId: String(meliItemId),
            sku,
            title,
            costPrice,
            salePrice,
            currentStock,
            thumbnail,
            permalink,
            listingType,
            status,
            integrationId,
          },
          update: {
            sku,
            title,
            costPrice,
            salePrice,
            currentStock,
            thumbnail,
            permalink,
            listingType,
            status,
            integrationId,
          },
        });

        // Ensure settings exist
        await prisma.meliProductSettings.upsert({
          where: { meliItemId: String(meliItemId) },
          create: {
            meliItemId: String(meliItemId),
          },
          update: {},
        });
      }
    } catch (error) {
      console.error('Error upserting Mercado Livre products:', error);
      throw error;
    }
  }

  /**
   * Get all Mercado Livre products from the database
   */
  async function getProducts(take: number = 100, skip: number = 0): Promise<MeliProductType[]> {
    try {
      const products = await prisma.meliProduct.findMany({
        where: { integrationId },
        take,
        skip,
      });

      return products.map((product) => ({
        id: product.id,
        meliItemId: product.meliItemId,
        meliCategoryId: product.meliCategoryId,
        sku: product.sku,
        title: product.title,
        costPrice: product.costPrice,
        salePrice: product.salePrice,
        currentStock: product.currentStock,
        thumbnail: product.thumbnail,
        permalink: product.permalink,
        listingType: product.listingType,
        status: product.status,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      }));
    } catch (error) {
      console.error('Error fetching Mercado Livre products:', error);
      throw error;
    }
  }

  /**
   * Get a Mercado Livre product by its item ID
   */
  async function getProductById(meliItemId: string): Promise<MeliProductType | null> {
    try {
      const product = await prisma.meliProduct.findFirst({
        where: {
          integrationId,
          meliItemId: String(meliItemId),
        },
        include: {
          alert: true,
          settings: true,
        },
      });

      if (!product) {
        return null;
      }

      return {
        id: product.id,
        meliItemId: product.meliItemId,
        meliCategoryId: product.meliCategoryId,
        sku: product.sku ?? '',
        title: product.title,
        costPrice: product.costPrice,
        salePrice: product.salePrice,
        currentStock: product.currentStock,
        thumbnail: product.thumbnail,
        permalink: product.permalink,
        listingType: product.listingType,
        status: product.status,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        alert: product.alert
          ? {
              id: product.alert.id,
              meliItemId: product.alert.meliItemId,
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
              recommendations: product.alert.recommendations,
              lastCriticalNotifiedAt: product.alert.lastCriticalNotifiedAt,
              createdAt: product.alert.createdAt,
              updatedAt: product.alert.updatedAt,
            }
          : null,
        settings: product.settings
          ? {
              id: product.settings.id,
              meliItemId: product.settings.meliItemId,
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
    } catch (error) {
      console.error('Error fetching Mercado Livre product by ID:', error);
      throw error;
    }
  }

  /**
   * Get product settings by item ID
   */
  async function getProductSettings(meliItemId: string): Promise<MeliProductSettingsType | null> {
    try {
      const settings = await prisma.meliProductSettings.findFirst({
        where: {
          meliItemId: String(meliItemId),
        },
      });

      if (!settings) {
        return null;
      }

      return {
        id: settings.id,
        meliItemId: settings.meliItemId,
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
    } catch (error) {
      console.error('Error fetching Mercado Livre product settings:', error);
      throw error;
    }
  }

  /**
   * Update product settings
   */
  async function updateProductSettings(
    meliItemId: string,
    settings: Partial<MeliProductSettingsType>
  ): Promise<void> {
    try {
      await prisma.meliProductSettings.updateMany({
        where: {
          meliItemId: String(meliItemId),
        },
        data: settings,
      });
    } catch (error) {
      console.error('Error updating Mercado Livre product settings:', error);
      throw error;
    }
  }

  /**
   * Upsert categories into the database
   */
  async function upsertCategories(categories: MeliCategoryType[]): Promise<void> {
    try {
      for (const category of categories) {
        const { meliCategoryId, name } = category;

        await prisma.meliCategory.upsert({
          where: { meliCategoryId: String(meliCategoryId) },
          create: {
            meliCategoryId: String(meliCategoryId),
            name,
          },
          update: {
            name,
          },
        });
      }
    } catch (error) {
      console.error('Error upserting Mercado Livre categories:', error);
      throw error;
    }
  }

  /**
   * Get all Mercado Livre categories from the database
   */
  async function getCategories(): Promise<MeliCategoryType[]> {
    try {
      const categories = await prisma.meliCategory.findMany();

      return categories.map((category) => ({
        id: category.id,
        meliCategoryId: category.meliCategoryId,
        name: category.name,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      }));
    } catch (error) {
      console.error('Error fetching Mercado Livre categories:', error);
      throw error;
    }
  }

  /**
   * Get a Mercado Livre category by its ID
   */
  async function getCategoryById(meliCategoryId: string): Promise<MeliCategoryType | null> {
    try {
      const category = await prisma.meliCategory.findFirst({
        where: { meliCategoryId: String(meliCategoryId) },
      });

      if (!category) {
        return null;
      }

      return {
        id: category.id,
        meliCategoryId: category.meliCategoryId,
        name: category.name,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      };
    } catch (error) {
      console.error('Error fetching Mercado Livre category by ID:', error);
      throw error;
    }
  }

  /**
   * Upsert sales history into the database
   */
  async function upsertSalesHistory(sales: MeliSalesHistoryType[]): Promise<void> {
    try {
      for (const sale of sales) {
        const { meliItemId, meliOrderId, date, quantity, totalValue } = sale;

        const product = await prisma.meliProduct.findFirst({
          where: {
            integrationId,
            meliItemId: String(meliItemId),
          },
          select: { id: true },
        });

        if (!product) {
          console.warn(
            `Skipping order ${meliOrderId}: product not found for meliItemId ${meliItemId}`
          );
          continue;
        }

        const existing = await prisma.meliOrderHistory.findFirst({
          where: {
            meliOrderId: String(meliOrderId),
            meliItemId: String(meliItemId),
            date,
          },
          select: { id: true },
        });

        if (existing) {
          await prisma.meliOrderHistory.update({
            where: { id: existing.id },
            data: {
              meliOrderId: String(meliOrderId),
              meliItemId: String(meliItemId),
              date,
              quantity,
              totalValue,
            },
          });
        } else {
          await prisma.meliOrderHistory.create({
            data: {
              meliOrderId: String(meliOrderId),
              meliItemId: String(meliItemId),
              date,
              quantity,
              totalValue,
            },
          });
        }
      }
    } catch (error) {
      console.error('Error upserting Mercado Livre sales history:', error);
      throw error;
    }
  }

  /**
   * Upsert stock balance into the database
   */
  async function upsertStockBalance(stockBalances: MeliStockBalanceType[]): Promise<void> {
    try {
      for (const balance of stockBalances) {
        const { meliItemId, stock } = balance;

        const product = await prisma.meliProduct.findFirst({
          where: {
            integrationId,
            meliItemId: String(meliItemId),
          },
          select: { id: true },
        });

        if (!product) {
          console.warn(`Skipping stock balance for meliItemId ${meliItemId}: product not found`);
          continue;
        }

        const existing = await prisma.meliStockBalance.findFirst({
          where: { meliItemId: String(meliItemId) },
          select: { id: true },
        });

        if (existing) {
          await prisma.meliStockBalance.update({
            where: { id: existing.id },
            data: {
              meliItemId: String(meliItemId),
              stock,
            },
          });
        } else {
          await prisma.meliStockBalance.create({
            data: {
              meliItemId: String(meliItemId),
              stock,
            },
          });
        }
      }
    } catch (error) {
      console.error('Error upserting Mercado Livre stock balance:', error);
      throw error;
    }
  }

  /**
   * Get stock balance for a product
   */
  async function getStockBalanceByProductId(
    meliItemId: string
  ): Promise<MeliStockBalanceType | null> {
    try {
      const balance = await prisma.meliStockBalance.findFirst({
        where: { meliItemId: String(meliItemId) },
        orderBy: { createdAt: 'desc' },
      });

      if (!balance) {
        return null;
      }

      return {
        id: balance.id,
        meliItemId: balance.meliItemId,
        stock: balance.stock,
        createdAt: balance.createdAt,
        updatedAt: balance.updatedAt,
      };
    } catch (error) {
      console.error('Error fetching Mercado Livre stock balance:', error);
      throw error;
    }
  }

  /**
   * Get sales history for a product
   */
  async function getSaleHistoryByProductId(meliItemId: string): Promise<MeliSalesHistoryType[]> {
    try {
      const sales = await prisma.meliOrderHistory.findMany({
        where: { meliItemId: String(meliItemId) },
        orderBy: { date: 'desc' },
      });

      return sales.map((sale) => ({
        id: sale.id,
        meliOrderId: sale.meliOrderId,
        meliItemId: sale.meliItemId,
        date: sale.date,
        quantity: sale.quantity,
        totalValue: sale.totalValue,
        createdAt: sale.createdAt,
        updatedAt: sale.updatedAt,
      }));
    } catch (error) {
      console.error('Error fetching Mercado Livre sales history:', error);
      throw error;
    }
  }

  /**
   * Upsert product alert metrics into the database
   */
  async function upsertProductAlert(
    meliItemId: string,
    productMetrics: MeliProductMetrics
  ): Promise<{ previousRisk: MeliRuptureRisk | null }> {
    try {
      const product = await prisma.meliProduct.findFirst({
        where: {
          integrationId,
          meliItemId: meliItemId,
        },
        select: { id: true },
      });

      if (!product) {
        console.warn(`Skipping alert for meliItemId ${meliItemId}: product not found`);
        return { previousRisk: null };
      }

      const existingAlert = await prisma.meliAlert.findUnique({
        where: {
          meliItemId: String(meliItemId),
        },
        select: {
          risk: true,
        },
      });

      await prisma.meliAlert.upsert({
        where: {
          meliItemId: String(meliItemId),
        },
        create: {
          ...productMetrics,
          product: {
            connect: { meliItemId: String(meliItemId) },
          },
        },
        update: {
          ...productMetrics,
        },
      });

      return {
        previousRisk: existingAlert?.risk ?? null,
      };
    } catch (error) {
      console.error('Error upserting product alert:', error);
      throw error;
    }
  }

  /**
   * Mark that a CRITICAL alert notification was sent
   */
  async function markCriticalNotified(meliItemId: string, jobId?: string): Promise<void> {
    try {
      await prisma.meliAlert.update({
        where: { meliItemId: String(meliItemId) },
        data: {
          lastCriticalNotifiedAt: new Date(),
          jobId: jobId ?? undefined,
        },
      });
    } catch (error) {
      console.error('Error marking critical alert as notified:', error);
      throw error;
    }
  }

  /**
   * Get product alerts with pagination and filtering
   */
  async function getProductAlerts(
    params: GetMeliProductsAlertsParams
  ): Promise<GetMeliProductAlertsResponse> {
    const { limit = 20, integrationId, filters } = params;

    const products = await prisma.meliProduct.findMany({
      where: {
        integrationId,
        alert: {
          type: filters?.type ? { in: filters.type } : undefined,
          risk: filters?.risk ? { in: filters.risk } : undefined,
        },
      },
      include: {
        alert: true,
      },
      take: limit,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const hasNextPage = products.length > limit;
    const data = hasNextPage ? products.slice(0, -1) : products;

    return {
      data: data.map((product) => ({
        id: product.id,
        meliItemId: product.meliItemId,
        meliCategoryId: product.meliCategoryId,
        sku: product.sku,
        title: product.title,
        costPrice: product.costPrice,
        salePrice: product.salePrice,
        currentStock: product.currentStock,
        thumbnail: product.thumbnail,
        permalink: product.permalink,
        listingType: product.listingType,
        status: product.status,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        alert: product.alert
          ? {
              id: product.alert.id,
              meliItemId: product.alert.meliItemId,
              type: product.alert.type,
              risk: product.alert.risk,
              discount: product.alert.discount,
              discountAmount: product.alert.discountAmount,
              vvdReal: product.alert.vvdReal,
              vvd30: product.alert.vvd30,
              vvd7: product.alert.vvd7,
              daysRemaining: product.alert.daysRemaining,
              reorderPoint: product.alert.reorderPoint,
              growthTrend: product.alert.growthTrend,
              capitalStuck: product.alert.capitalStuck,
              daysSinceLastSale: product.alert.daysSinceLastSale,
              suggestedPrice: product.alert.suggestedPrice,
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
      })),
      nextCursor: hasNextPage ? data[data.length - 1].id : null,
      hasNextPage,
    };
  }

  /**
   * Get overview metrics for the dashboard
   */
  async function getOverviewMetrics({
    integrationId,
  }: GetOverviewMetricsParams): Promise<GetOverviewMetricsResponse> {
    const products = await prisma.meliProduct.findMany({
      where: {
        integrationId,
        alert: {
          type: {
            in: ['DEAD_STOCK', 'LIQUIDATION'],
          },
        },
      },
      include: {
        alert: true,
      },
    });

    let capitalStuck = 0;
    let ruptureCount = 0;
    let opportunityCount = 0;
    const topActions: GetOverviewMetricsResponse['topActions'] = [];

    for (const product of products) {
      if (product.alert) {
        if (product.alert.type === 'RUPTURE') {
          ruptureCount += 1;
        } else if (product.alert.type === 'OPPORTUNITY') {
          opportunityCount += 1;
        }

        let impactAmount: number | undefined;
        let impactLabel: string | undefined;
        const a = product.alert;

        if (a.type === 'DEAD_STOCK' && typeof a.capitalStuck === 'number') {
          impactAmount = a.capitalStuck;
          impactLabel = 'Capital parado';
        } else if (
          (a as unknown as { type: string }).type === 'LIQUIDATION' &&
          typeof a.excessCapital === 'number'
        ) {
          impactAmount = a.excessCapital;
          impactLabel = 'Capital em excesso';
        }

        topActions.push({
          id: product.id,
          name: product.title,
          sku: product.sku ?? '',
          recommendations: a.recommendations ? JSON.stringify(a.recommendations) : null,
          impactAmount,
          impactLabel,
          alertType: a.type as unknown as GetOverviewMetricsResponse['topActions'][0]['alertType'],
          alertRisk: a.risk as unknown as GetOverviewMetricsResponse['topActions'][0]['alertRisk'],
        });
      }
    }

    capitalStuck = products.reduce((sum: number, p) => {
      return sum + p.currentStock * p.salePrice;
    }, 0);

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
    upsertStockBalance,
    getStockBalanceByProductId,
    getSaleHistoryByProductId,
    upsertProductAlert,
    markCriticalNotified,
    getProductAlerts,
    getOverviewMetrics,
  };
}
