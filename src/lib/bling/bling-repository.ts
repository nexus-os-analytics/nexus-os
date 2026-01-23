import type { BlingRuptureRisk } from '@prisma/client';
import type {
  GetOverviewMetricsParams,
  GetOverviewMetricsResponse,
  GetProductAlertsResponse,
  GetProductsAlertsParams,
} from '@/features/products/types';
import prisma from '../prisma';
import type {
  BlingCategoryType,
  BlingProductMetrics,
  BlingProductSettingsType,
  BlingProductType,
  BlingSalesHistoryType,
  BlingStockBalanceType,
} from './bling-types';

interface BlingRepositoryOptions {
  integrationId: string;
}

export function createBlingRepository({ integrationId }: BlingRepositoryOptions) {
  /**
   * Upsert products into the database
   * @param products Array of products to upsert
   */
  async function upsertProducts(products: BlingProductType[]): Promise<void> {
    try {
      for (const product of products) {
        const {
          blingProductId,
          sku,
          name,
          costPrice,
          salePrice,
          currentStock,
          image,
          shortDescription,
        } = product;

        await prisma.blingProduct.upsert({
          where: { blingProductId: String(blingProductId) },
          create: {
            blingProductId: String(blingProductId),
            sku,
            name,
            costPrice,
            salePrice,
            currentStock,
            image,
            shortDescription,
            integrationId,
          },
          update: {
            blingProductId: String(blingProductId),
            sku,
            name,
            costPrice,
            salePrice,
            currentStock,
            image,
            shortDescription,
            integrationId,
          },
        });

        // Ensure settings exist AFTER product upsert to satisfy FK constraint
        await prisma.blingProductSettings.upsert({
          where: { blingProductId: String(blingProductId) },
          create: {
            blingProductId: String(blingProductId),
          },
          update: {},
        });
      }
    } catch (error) {
      console.error('Error upserting products:', error);
      throw error;
    }
  }

  /**
   * Get all Bling products from the database
   * @param take - Number of products to take
   * @param skip - Number of products to skip
   * @returns Array of Bling products
   */
  async function getProducts(take: number = 100, skip: number = 0): Promise<BlingProductType[]> {
    try {
      const products = await prisma.blingProduct.findMany({
        where: { integrationId },
        take,
        skip,
      });

      return products.map((product) => ({
        id: product.id,
        blingProductId: product.blingProductId,
        blingCategoryId: product.blingCategoryId,
        sku: product.sku,
        name: product.name,
        costPrice: product.costPrice,
        salePrice: product.salePrice,
        currentStock: product.currentStock,
        image: product.image,
        shortDescription: product.shortDescription,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
      }));
    } catch (error) {
      console.error('Error fetching Bling products:', error);
      throw error;
    }
  }

  /**
   * Get a Bling product by its Bling ID
   * @param blingProductId - The Bling product ID
   * @returns The Bling product or null if not found
   */
  async function getProductById(blingProductId: string): Promise<BlingProductType | null> {
    try {
      const product = await prisma.blingProduct.findFirst({
        where: {
          integrationId,
          blingProductId: String(blingProductId),
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
        blingProductId: product.blingProductId,
        blingCategoryId: product.blingCategoryId,
        sku: product.sku,
        name: product.name,
        costPrice: product.costPrice,
        salePrice: product.salePrice,
        currentStock: product.currentStock,
        image: product.image,
        shortDescription: product.shortDescription,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        alert: product.alert
          ? {
              id: product.alert.id,
              blingProductId: product.alert.blingProductId,
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
              createdAt: product.alert.createdAt,
              updatedAt: product.alert.updatedAt,
            }
          : null,
        settings: product.settings
          ? {
              id: product.settings.id,
              blingProductId: product.settings.blingProductId,
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
      console.error('Error fetching Bling product by ID:', error);
      throw error;
    }
  }

  /**
   * Get Bling product settings by Bling product ID
   * @param blingProductId - The Bling product ID
   * @returns
   */
  async function getProductSettings(
    blingProductId: string
  ): Promise<BlingProductSettingsType | null> {
    try {
      const settings = await prisma.blingProductSettings.findFirst({
        where: {
          blingProductId: String(blingProductId),
        },
      });

      if (!settings) {
        return null;
      }

      return {
        id: settings.id,
        blingProductId: settings.blingProductId,
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
      console.error('Error fetching Bling product settings:', error);
      throw error;
    }
  }

  /**
   * Update product settings
   * @param blingProductId - The Bling product ID
   * @param settings - Partial settings to update
   */
  async function updateProductSettings(
    blingProductId: string,
    settings: Partial<BlingProductSettingsType>
  ): Promise<void> {
    try {
      await prisma.blingProductSettings.updateMany({
        where: {
          blingProductId: String(blingProductId),
        },
        data: settings,
      });
    } catch (error) {
      console.error('Error updating product settings:', error);
      throw error;
    }
  }

  /**
   * Upsert categories into the database
   * @param categories Array of categories to upsert
   */
  async function upsertCategories(categories: BlingCategoryType[]): Promise<void> {
    try {
      for (const category of categories) {
        const { blingCategoryId, name, blingParentId } = category;

        await prisma.blingCategory.upsert({
          where: { blingCategoryId: String(blingCategoryId) },
          create: {
            blingCategoryId: String(blingCategoryId),
            name,
            blingParentId: blingParentId ? String(blingParentId) : null,
          },
          update: {
            blingCategoryId: String(blingCategoryId),
            name,
            blingParentId: blingParentId ? String(blingParentId) : null,
          },
        });
      }
    } catch (error) {
      console.error('Error upserting categories:', error);
      throw error;
    }
  }

  /**
   * Get all Bling categories from the database
   * @returns Array of Bling categories
   */
  async function getCategories(): Promise<BlingCategoryType[]> {
    try {
      const categories = await prisma.blingCategory.findMany();

      return categories.map((category) => ({
        id: category.id,
        blingCategoryId: category.blingCategoryId,
        blingParentId: category.blingParentId,
        name: category.name,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      }));
    } catch (error) {
      console.error('Error fetching Bling categories:', error);
      throw error;
    }
  }

  /**
   * Get a Bling category by its Bling ID
   * @param blingCategoryId - The Bling category ID
   * @returns The Bling category or null if not found
   */
  async function getCategoryById(blingCategoryId: string): Promise<BlingCategoryType | null> {
    try {
      const category = await prisma.blingCategory.findFirst({
        where: { blingCategoryId: String(blingCategoryId) },
      });

      if (!category) {
        return null;
      }

      return {
        id: category.id,
        blingCategoryId: category.blingCategoryId,
        blingParentId: category.blingParentId,
        name: category.name,
        createdAt: category.createdAt,
        updatedAt: category.updatedAt,
      };
    } catch (error) {
      console.error('Error fetching Bling category by ID:', error);
      throw error;
    }
  }

  /**
   * Upsert sales history into the database
   * @param sales Array of sales history to upsert
   */
  async function upsertSalesHistory(sales: BlingSalesHistoryType[]): Promise<void> {
    try {
      for (const sale of sales) {
        const { blingProductId, blingSaleId, date, quantity, totalValue } = sale;

        // Resolve internal product
        const product = await prisma.blingProduct.findFirst({
          where: {
            integrationId,
            blingProductId: String(blingProductId),
          },
          select: { id: true },
        });

        if (!product) {
          console.warn(
            `Skipping sale ${blingSaleId}: product not found for blingProductId ${blingProductId}`
          );
          continue;
        }

        const existing = await prisma.blingSalesHistory.findFirst({
          where: {
            blingSaleId: String(blingSaleId),
            blingProductId: String(blingProductId),
            date,
          },
          select: { id: true },
        });

        if (existing) {
          await prisma.blingSalesHistory.update({
            where: { id: existing.id },
            data: {
              blingSaleId: String(blingSaleId),
              blingProductId: String(blingProductId),
              date,
              quantity,
              totalValue,
            },
          });
        } else {
          await prisma.blingSalesHistory.create({
            data: {
              blingSaleId: String(blingSaleId),
              blingProductId: String(blingProductId),
              date,
              quantity,
              totalValue,
            },
          });
        }
      }
    } catch (error) {
      console.error('Error upserting sales history:', error);
      throw error;
    }
  }

  /**
   * Get sales history by Bling product ID
   * @param blingProductId - The Bling product ID
   * @param dateStart - Optional start date filter
   * @param dateEnd - Optional end date filter
   * @returns Array of sales history records
   */
  async function getSaleHistoryByProductId(
    blingProductId: string,
    dateStart?: Date,
    dateEnd?: Date
  ): Promise<BlingSalesHistoryType[]> {
    try {
      const whereClause: any = {
        blingProductId: String(blingProductId),
      };

      if (dateStart && dateEnd) {
        whereClause.date = {
          gte: dateStart,
          lte: dateEnd,
        };
      } else if (dateStart) {
        whereClause.date = {
          gte: dateStart,
        };
      } else if (dateEnd) {
        whereClause.date = {
          lte: dateEnd,
        };
      }

      const sales = await prisma.blingSalesHistory.findMany({
        where: whereClause,
      });

      return sales.map((sale) => ({
        id: sale.id,
        blingProductId: sale.blingProductId,
        blingSaleId: sale.blingSaleId,
        date: sale.date,
        quantity: sale.quantity,
        totalValue: sale.totalValue,
        createdAt: sale.createdAt,
        updatedAt: sale.updatedAt,
      }));
    } catch (error) {
      console.error('Error fetching sales history by product ID:', error);
      throw error;
    }
  }

  /**
   * Upsert stock balance into the database
   * @param balances Array of stock balances to upsert
   */
  async function upsertStockBalance(balances: BlingStockBalanceType[]): Promise<void> {
    try {
      for (const balance of balances) {
        const { blingProductId, stock } = balance;

        const product = await prisma.blingProduct.findFirst({
          where: {
            integrationId,
            blingProductId: String(blingProductId),
          },
          select: { id: true },
        });

        if (!product) {
          console.warn(
            `Skipping stock balance for blingProductId ${blingProductId}: product not found`
          );
          continue;
        }

        const existing = await prisma.blingStockBalance.findFirst({
          where: { blingProductId: String(blingProductId) },
          select: { id: true },
        });

        if (existing) {
          await prisma.blingStockBalance.update({
            where: { id: existing.id },
            data: {
              blingProductId: String(blingProductId),
              stock,
            },
          });
        } else {
          await prisma.blingStockBalance.create({
            data: {
              blingProductId: String(blingProductId),
              stock,
            },
          });
        }
      }
    } catch (error) {
      console.error('Error upserting stock balance:', error);
      throw error;
    }
  }

  /**
   * Get stock balance by Bling product ID
   * @param blingProductId - The Bling product ID
   * @returns The stock balance or null if not found
   */
  async function getStockBalanceByProductId(
    blingProductId: string
  ): Promise<BlingStockBalanceType | null> {
    try {
      const balance = await prisma.blingStockBalance.findFirst({
        where: { blingProductId: String(blingProductId) },
      });

      if (!balance) {
        return null;
      }

      return {
        id: balance.id,
        blingProductId: balance.blingProductId,
        stock: balance.stock,
        createdAt: balance.createdAt,
        updatedAt: balance.updatedAt,
      };
    } catch (error) {
      console.error('Error fetching stock balance by product ID:', error);
      throw error;
    }
  }

  /**
   * Upsert product alert metrics into the database
   * @param blingProductId - The Bling product ID
   * @param productMetrics - The product metrics to upsert
   * @returns
   */
  async function upsertProductAlert(
    blingProductId: string,
    productMetrics: BlingProductMetrics
  ): Promise<{ previousRisk: BlingRuptureRisk | null }> {
    try {
      const product = await prisma.blingProduct.findFirst({
        where: {
          integrationId,
          blingProductId: blingProductId,
        },
        select: { id: true },
      });

      if (!product) {
        console.warn(`Skipping alert for blingProductId ${blingProductId}: product not found`);
        return { previousRisk: null };
      }

      const existingAlert = await prisma.blingAlert.findUnique({
        where: {
          blingProductId: String(blingProductId),
        },
        select: {
          risk: true,
        },
      });

      await prisma.blingAlert.upsert({
        where: {
          blingProductId: String(blingProductId),
        },
        create: {
          ...productMetrics,
          // Required relation: connect alert to existing BlingProduct by unique blingProductId
          product: {
            connect: { blingProductId: String(blingProductId) },
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
   * @param blingProductId - The Bling product ID
   * @param jobId - Optional jobId to persist on alert for traceability
   */
  async function markCriticalNotified(blingProductId: string, jobId?: string): Promise<void> {
    try {
      await prisma.blingAlert.update({
        where: { blingProductId: String(blingProductId) },
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

  // TODO: Implement pagination with cursor
  /**
   * Get product alerts with pagination and filtering
   * @param params - Parameters for fetching product alerts
   * @returns Paginated product alerts
   */
  async function getProductAlerts(
    params: GetProductsAlertsParams
  ): Promise<GetProductAlertsResponse> {
    const { limit = 20, integrationId, filters } = params;

    const products = await prisma.blingProduct.findMany({
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
      // skip: cursor ? 1 : 0, // Skip the cursor item if provided
      // cursor: cursor
      //   ? {
      //     id: cursor,
      //   }
      //   : undefined,
      orderBy: {
        createdAt: 'desc',
      },
    });

    const hasNextPage = products.length > limit;
    const data = hasNextPage ? products.slice(0, -1) : products;

    return {
      data: data.map((product) => ({
        id: product.id,
        blingProductId: product.blingProductId,
        blingCategoryId: product.blingCategoryId,
        sku: product.sku,
        name: product.name,
        costPrice: product.costPrice,
        salePrice: product.salePrice,
        currentStock: product.currentStock,
        image: product.image,
        shortDescription: product.shortDescription,
        createdAt: product.createdAt,
        updatedAt: product.updatedAt,
        alert: product.alert
          ? {
              id: product.alert.id,
              blingProductId: product.alert.blingProductId,
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
   * @param params - Parameters for fetching overview metrics
   * @returns Overview metrics
   */
  async function getOverviewMetrics({
    integrationId,
  }: GetOverviewMetricsParams): Promise<GetOverviewMetricsResponse> {
    const products = await prisma.blingProduct.findMany({
      where: {
        integrationId,
        alert: {
          isNot: null,
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
        capitalStuck += product.alert.capitalStuck;

        if (product.alert.type === 'DEAD_STOCK') {
          ruptureCount += 1;
        } else if (product.alert.type === 'OPPORTUNITY') {
          opportunityCount += 1;
        }

        // Compute simple monetary impact for actions where applicable
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
          name: product.name,
          sku: product.sku,
          recommendations: a.recommendations ? JSON.stringify(a.recommendations) : null,
          impactAmount,
          impactLabel,
          alertType: a.type,
          alertRisk: a.risk,
        });
      }
    }

    // Ensure all possible BlingRuptureRisk values are covered
    const riskOrder: Record<string, number> = { CRITICAL: 4, HIGH: 3, MEDIUM: 2, LOW: 1 };

    // Use toSorted for compliance and clarity
    const sortedTopActions = topActions.toSorted((a, b) => {
      const aRisk = products.find((p) => p.id === a.id)?.alert?.risk ?? 'LOW';
      const bRisk = products.find((p) => p.id === b.id)?.alert?.risk ?? 'LOW';
      return (riskOrder[bRisk] ?? 0) - (riskOrder[aRisk] ?? 0);
    });

    return {
      capitalStuck,
      ruptureCount,
      opportunityCount,
      topActions: sortedTopActions.slice(0, 3), // Top 3 actions
    };
  }

  return {
    upsertProducts,
    getProducts,
    getProductById,
    getProductSettings,
    updateProductSettings,
    getCategories,
    getCategoryById,
    upsertCategories,
    upsertSalesHistory,
    upsertStockBalance,
    getSaleHistoryByProductId,
    getStockBalanceByProductId,
    upsertProductAlert,
    markCriticalNotified,
    getProductAlerts,
    getOverviewMetrics,
  };
}
