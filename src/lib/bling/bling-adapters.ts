import type { Category, Product, SalesHistory, StockBalance } from './bling-types';

/**
 * Adapt list of products returned from Bling API to Product[]
 * @param data - The raw product data from the API
 * @returns An array of Product objects
 */
export function adaptProductsResponse(data: any[]): Product[] {
  if (!Array.isArray(data)) return [];

  return data.map((item) => ({
    id: item.id,
    name: item.nome || '',
    sku: item.codigo || '',
    costPrice: item.precoCusto ?? 0,
    salePrice: item.preco ?? 0,
    stock: item.estoque?.saldoVirtualTotal ?? 0,
    image: item.imagemURL || null,
    shortDescription: item.descricaoCurta || null,
    isActive: true,
    capitalCostRate: 0, // calc later
    replenishmentTime: 0, // to be populated when lead time data is available
    safetyStock: 0,
    storageCostRate: 0, // calc later
    avgMonthlySales: 0, // calc later
    lastSaleDate: null, // fill from sales endpoint later
    categoryId: null, // to be populated when categories are integrated
  }));
}

/**
 * Adapt category response from Bling API
 * @param data - The raw category data from the API
 * @returns An array of Category objects
 */
export function adaptCategoryResponse(data: any): Category[] {
  if (!Array.isArray(data)) return [];

  return data.map((item) => ({
    id: item.id,
    name: item.descricao || 'Sem categoria',
    parentId: item.categoriaPai?.id || null,
  }));
}

/**
 * Adapt sales history response from Bling API
 * @param data - The raw sales history data from the API
 * @returns An array of SalesHistory objects
 */
export function adaptSalesHistoryResponse(data: any): SalesHistory[] {
  const dateIso = new Date(data.data).toISOString();

  return data.itens.map((item: any) => ({
    id: data.id,
    date: dateIso,
    productId: item.produto.id,
    productSku: item.codigo,
    quantity: item.quantidade,
    totalValue: item.valor * item.quantidade - item.desconto,
  }));
}

/**
 * Adapt stock balance response from Bling API
 * @param data - The raw stock balance data from the API
 * @returns An array of StockBalance objects
 */
export function adaptStockBalanceResponse(data: any): StockBalance[] {
  if (!Array.isArray(data)) return [];

  return data.map((item: any) => ({
    productId: item.produto.id,
    productSku: item.produto.codigo,
    stock: item.saldoFisicoTotal || item.saldoVirtualTotal || 0,
  }));
}
