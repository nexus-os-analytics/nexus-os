import axios, { type AxiosInstance, type AxiosRequestHeaders } from 'axios';
import { rateLimited } from '../utils/rate-limiter';
import {
  adaptCategoryResponse,
  adaptProductsResponse,
  adaptSalesHistoryResponse,
  adaptStockBalanceResponse,
} from './bling-adapters';
import type {
  BlingCategoryType,
  BlingProductType,
  BlingSalesHistoryType,
  BlingStockBalanceType,
} from './bling-types';

export interface BlingClientOptions {
  accessToken: string;
}

export function createBlingClient({ accessToken }: BlingClientOptions) {
  const BASE =
    process.env.BLING_API_BASE_URL?.replace(/\/$/, '') ?? 'https://api.bling.com.br/Api/v3';

  const blingClient: AxiosInstance = axios.create({
    baseURL: BASE,
    timeout: 30000,
  });

  blingClient.interceptors.request.use((config) => {
    config.headers = config.headers ?? ({} as AxiosRequestHeaders);
    config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
  });

  /**
   * Fetch products from Bling API (Only simple products)
   * @param page - Page number for pagination
   * @returns `BlingProductType[]`
   */
  async function getProducts(page: number = 1): Promise<BlingProductType[]> {
    return rateLimited(async () => {
      const res = await blingClient.get(`/produtos?pagina=${page}&limite=100&criterio=2&tipo=P`);
      const { data } = res.data;
      return adaptProductsResponse(data);
    });
  }

  /**
   * Fetch categories from Bling API
   * @param page - Page number for pagination
   * @returns `BlingCategoryType[]`
   */
  async function getCategories(page: number = 1): Promise<BlingCategoryType[]> {
    return rateLimited(async () => {
      const res = await blingClient.get(`/categorias/produtos?pagina=${page}&limite=100`);
      const { data } = res.data;
      return adaptCategoryResponse(data);
    });
  }

  /**
   * Fetch sales from Bling API
   * @param dateStart - Start date for the sales query
   * @param dateEnd - End date for the sales query
   * @returns `Array<{ id: number }>`
   */
  async function getSalesInRange(
    dateStart: string,
    dateEnd: string
  ): Promise<Array<{ id: number }>> {
    return rateLimited(async () => {
      const res = await blingClient.get('/pedidos/vendas', {
        params: { dataInicial: dateStart, dataFinal: dateEnd },
      });
      const { data } = res.data;
      return data?.map((p: any) => ({ id: p.id })) ?? [];
    });
  }

  /**
   * Fetch sales history for a specific sale
   * @param saleId - Sale ID to fetch history for
   * @returns `BlingSalesHistoryType[] | null`
   */
  async function getSalesHistory(saleId: string): Promise<BlingSalesHistoryType[] | null> {
    return rateLimited(async () => {
      const res = await blingClient.get(`/pedidos/vendas/${encodeURIComponent(saleId)}`);
      const { data } = res.data;

      return adaptSalesHistoryResponse(data);
    });
  }

  /**
   * Fetch stock balance for a list of products
   * @param productIds - Array of product IDs to fetch stock balance for
   * @returns `BlingStockBalanceType[]`
   */
  async function getStockBalance(productIds: number[]): Promise<BlingStockBalanceType[]> {
    return rateLimited(async () => {
      const idsQuery = productIds.map((id) => `idsProdutos[]=${encodeURIComponent(id)}`).join('&');
      const queryString = `${idsQuery}&filtroSaldoEstoque=1`;
      const res = await blingClient.get(`/estoques/saldos?${queryString}`);
      const { data } = res.data;

      return adaptStockBalanceResponse(data);
    });
  }

  return {
    blingClient,
    getProducts,
    getCategories,
    getSalesInRange,
    getSalesHistory,
    getStockBalance,
  };
}
