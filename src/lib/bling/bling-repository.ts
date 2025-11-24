import prisma from '../prisma';
import type { Category, Product, SalesHistory, StockBalance } from './bling-types';

interface BlingRepositoryOptions {
  integrationId: string;
}

export function createBlingRepository({ integrationId }: BlingRepositoryOptions) {
  /**
   * Upsert products into the database
   * @param products Array of products to upsert
   */
  async function upsertProducts(products: Product[]): Promise<void> {
    try {
      for (const product of products) {
        const {
          id,
          sku,
          name,
          costPrice,
          salePrice,
          stock,
          image,
          shortDescription,
          lastSaleDate,
        } = product;

        await prisma.blingProduct.upsert({
          where: { blingProductId: String(id) },
          create: {
            blingProductId: String(id),
            sku,
            name,
            costPrice,
            salePrice,
            stock,
            image,
            shortDescription,
            lastSaleDate,
            integrationId,
          },
          update: {
            sku,
            name,
            costPrice,
            salePrice,
            stock,
            image,
            shortDescription,
            lastSaleDate,
            integrationId,
          },
        });
      }
    } catch (error) {
      console.error('Error upserting products:', error);
      throw error;
    }
  }

  /**
   * Upsert categories into the database
   * @param categories Array of categories to upsert
   */
  async function upsertCategories(categories: Category[]): Promise<void> {
    try {
      for (const category of categories) {
        const { id, name, parentId } = category;

        await prisma.blingCategory.upsert({
          where: { blingCategoryId: String(id) },
          create: {
            blingCategoryId: String(id),
            name,
            blingParentId: parentId ? String(parentId) : null,
          },
          update: {
            name,
            blingParentId: parentId ? String(parentId) : null,
          },
        });
      }
    } catch (error) {
      console.error('Error upserting categories:', error);
      throw error;
    }
  }

  /**
   * Upsert sales history into the database
   * @param sales Array of sales history to upsert
   */
  async function upsertSalesHistory(sales: SalesHistory[]): Promise<void> {
    try {
      for (const sale of sales) {
        const { id, date, productId, productSku, quantity, totalValue } = sale;

        // Resolve internal product
        const product = await prisma.blingProduct.findFirst({
          where: {
            integrationId,
            OR: [{ blingProductId: String(productId) }, { sku: productSku ?? undefined }],
          },
          select: { id: true },
        });

        if (!product) {
          console.warn(
            `Skipping sale ${id}: product not found for SKU ${productSku} or blingProductId ${productId}`
          );
          continue;
        }

        const existing = await prisma.blingSalesHistory.findFirst({
          where: {
            blingSaleId: String(id),
            productId: product.id,
            date,
          },
        });

        if (existing) {
          await prisma.blingSalesHistory.update({
            where: { id: existing.id },
            data: {
              productSku,
              quantity,
              totalValue,
              date,
            },
          });
        } else {
          await prisma.blingSalesHistory.create({
            data: {
              blingSaleId: String(id),
              date,
              productId: product.id,
              productSku,
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
   * Upsert stock balance into the database
   * @param balances Array of stock balances to upsert
   */
  async function upsertStockBalance(balances: StockBalance[]): Promise<void> {
    try {
      for (const balance of balances) {
        const { productId, productSku, stock } = balance;

        const product = await prisma.blingProduct.findFirst({
          where: {
            integrationId,
            OR: [{ blingProductId: String(productId) }, { sku: productSku ?? undefined }],
          },
          select: { id: true },
        });

        if (!product) {
          console.warn(
            `Skipping stock balance: product not found for SKU ${productSku} or blingProductId ${productId}`
          );
          continue;
        }

        const existing = await prisma.blingStockBalance.findFirst({
          where: { productId: product.id },
        });

        if (existing) {
          await prisma.blingStockBalance.update({
            where: { id: existing.id },
            data: {
              productSku,
              stock,
            },
          });
        } else {
          await prisma.blingStockBalance.create({
            data: {
              product: { connect: { id: product.id } },
              productSku: productSku ?? null,
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

  return {
    upsertProducts,
    upsertCategories,
    upsertSalesHistory,
    upsertStockBalance,
  };
}
