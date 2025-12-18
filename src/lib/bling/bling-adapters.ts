import type {
  BlingCategoryType,
  BlingProductType,
  BlingSalesHistoryType,
  BlingStockBalanceType,
} from './bling-types';

/**
 * Adapt list of products returned from Bling API to `BlingProductType[]`
 * @param data - Raw Bling products array from the API
 * @returns `BlingProductType[]`
 */
export function adaptProductsResponse(data: any[]): BlingProductType[] {
  if (!Array.isArray(data)) return [];

  return data.map((item) => ({
    id: item.id, // local DB id will be assigned by Prisma
    blingProductId: item.id,
    name: item.nome || '',
    sku: item.codigo || '',
    costPrice: item.precoCusto ?? 0,
    salePrice: item.preco ?? 0,
    currentStock: item.estoque?.saldoVirtualTotal ?? 0,
    image: item.imagemURL || null,
    shortDescription: item.descricaoCurta || null,
    createdAt: new Date(), // local DB timestamps will be assigned by Prisma
    updatedAt: new Date(), // local DB timestamps will be assigned by Prisma
  }));
}

/**
 * Adapt categories returned from Bling API to `BlingCategoryType[]`
 * @param data - Raw Bling categories array from the API
 * @returns `BlingCategoryType[]`
 */
export function adaptCategoryResponse(data: any): BlingCategoryType[] {
  if (!Array.isArray(data)) return [];

  return data.map((item) => ({
    id: item.id, // local DB id will be assigned by Prisma
    blingCategoryId: item.id,
    name: item.descricao || 'Sem categoria',
    blingParentId: item.categoriaPai?.id || null,
    createdAt: new Date(), // local DB timestamps will be assigned by Prisma
    updatedAt: new Date(), // local DB timestamps will be assigned by Prisma
  }));
}

/**
 * Adapt a Bling sale payload to `BlingSalesHistoryType[]`
 * @param data - Raw Bling sale object containing `data` and `itens`
 * @returns `BlingSalesHistoryType[]`
 */
export function adaptSalesHistoryResponse(data: any): BlingSalesHistoryType[] {
  const dateIso = new Date(data.data).toISOString();

  return data.itens.map((item: any) => ({
    id: data.id, // local DB id will be assigned by Prisma
    blingSaleId: data.id,
    blingProductId: item.produto.id,
    date: dateIso,
    quantity: item.quantidade,
    totalValue: item.valor * item.quantidade - item.desconto,
    createdAt: new Date(), // local DB timestamps will be assigned by Prisma
    updatedAt: new Date(), // local DB timestamps will be assigned by Prisma
  }));
}

/**
 * Adapt stock balances returned from Bling API to `BlingStockBalanceType[]`
 * @param data - Raw Bling stock balances array from the API
 * @returns `BlingStockBalanceType[]`
 */
export function adaptStockBalanceResponse(data: any): BlingStockBalanceType[] {
  if (!Array.isArray(data)) return [];

  return data.map((item: any) => ({
    id: Date.now().toString(), // local DB id will be assigned by Prisma
    blingProductId: item.produto.id,
    stock: item.saldoFisicoTotal || item.saldoVirtualTotal || 0,
    createdAt: new Date(), // local DB timestamps will be assigned by Prisma
    updatedAt: new Date(), // local DB timestamps will be assigned by Prisma
  }));
}
