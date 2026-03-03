import prisma from '../prisma';
import type {
  MeliCategoryType,
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

        await prisma.meliStockBalance.create({
          data: {
            meliItemId: String(meliItemId),
            stock,
          },
        });
      }
    } catch (error) {
      console.error('Error upserting Mercado Livre stock balance:', error);
      throw error;
    }
  }

  /**
   * Get stock balance for a product
   */
  async function getStockBalance(meliItemId: string): Promise<MeliStockBalanceType[]> {
    try {
      const balances = await prisma.meliStockBalance.findMany({
        where: { meliItemId: String(meliItemId) },
        orderBy: { createdAt: 'desc' },
        take: 100,
      });

      return balances.map((balance) => ({
        id: balance.id,
        meliItemId: balance.meliItemId,
        stock: balance.stock,
        createdAt: balance.createdAt,
        updatedAt: balance.updatedAt,
      }));
    } catch (error) {
      console.error('Error fetching Mercado Livre stock balance:', error);
      throw error;
    }
  }

  /**
   * Get sales history for a product
   */
  async function getSalesHistory(meliItemId: string): Promise<MeliSalesHistoryType[]> {
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
    getStockBalance,
    getSalesHistory,
  };
}
