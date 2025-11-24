import axios, { type AxiosInstance, type AxiosRequestHeaders } from 'axios';
import { rateLimited } from '../utils/rate-limiter';
import {
  adaptCategoryResponse,
  adaptProductsResponse,
  adaptSalesHistoryResponse,
  adaptStockBalanceResponse,
} from './bling-adapters';
import type { Category, Product, SalesHistory, StockBalance } from './bling-types';

export interface BlingClientOptions {
  accessToken: string;
}

export function createBlingClient({ accessToken }: BlingClientOptions) {
  const BASE =
    process.env.BLING_API_BASE_URL?.replace(/\/$/, '') ?? 'https://api.bling.com.br/Api/v3';

  const instance: AxiosInstance = axios.create({
    baseURL: BASE,
    timeout: 30000,
  });

  instance.interceptors.request.use((config) => {
    config.headers = config.headers ?? ({} as AxiosRequestHeaders);
    config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
  });

  /**
   * Fetch products from Bling API
   * @param page - Page number for pagination
   * @returns A list of products from Bling API
   */
  async function getProducts(page: number = 1): Promise<Product[]> {
    return rateLimited(async () => {
      const res = await instance.get(
        `/produtos?pagina=${page}&limite=100&criterio=2&tipo=P&filtroSaldoEstoque=1`
      );
      const { data } = res.data;
      return adaptProductsResponse(data);
    });
  }

  /**
   * Fetch categories from Bling API
   * @param page - Page number for pagination
   * @returns A list of categories from Bling API
   */
  async function getCategories(page: number = 1): Promise<Category[]> {
    return rateLimited(async () => {
      const res = await instance.get(`/categorias/produtos?pagina=${page}&limite=100`);
      const { data } = res.data;
      return adaptCategoryResponse(data);
    });
  }

  /**
   * Fetch sales from Bling API
   * @param dateStart - Start date for the sales query
   * @param dateEnd - End date for the sales query
   * @returns A list of sales from Bling API
   */
  async function getSalesInRange(
    dateStart: string,
    dateEnd: string
  ): Promise<Array<{ id: number }>> {
    return rateLimited(async () => {
      const res = await instance.get('/pedidos/vendas', {
        params: { dataInicial: dateStart, dataFinal: dateEnd },
      });
      const { data } = res.data;
      return data?.map((p: any) => ({ id: p.id })) ?? [];
    });
  }

  /**
   * Fetch sales history for a specific sale
   * @param saleId - Sale ID to fetch history for
   * @returns An array of SalesHistory objects or null if not found
   */
  async function getSalesHistory(saleId: string): Promise<SalesHistory[] | null> {
    return rateLimited(async () => {
      const res = await instance.get(`/pedidos/vendas/${encodeURIComponent(saleId)}`);
      const { data } = res.data;

      return adaptSalesHistoryResponse(data);
    });
  }

  /**
   * Fetch stock balance for a list of products
   * @param productIds - Array of product IDs to fetch stock balance for
   * @returns An array of StockBalance objects
   */
  async function getStockBalance(productIds: number[]): Promise<StockBalance[]> {
    return rateLimited(async () => {
      const idsQuery = productIds.map((id) => `idsProdutos[]=${encodeURIComponent(id)}`).join('&');
      const queryString = `${idsQuery}&filtroSaldoEstoque=1`;
      const res = await instance.get(`/estoques/saldos?${queryString}`);
      const { data } = res.data;

      return adaptStockBalanceResponse(data);
    });
  }

  return {
    getProducts,
    getCategories,
    getSalesInRange,
    getSalesHistory,
    getStockBalance,
  };
}
