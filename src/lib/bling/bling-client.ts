import axios, { type AxiosInstance } from 'axios';
import { rateLimited } from '../utils/rate-limiter';

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
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
  });

  /**
   * Fetch products from Bling API
   * @returns A list of products from Bling API
   */
  async function fetchProducts(): Promise<any[]> {
    return rateLimited(async () => {
      const res = await instance.get('/produtos');
      const { data } = res.data;
      return data?.map((p: any) => p.produto ?? p) ?? [];
    });
  }

  /**
   * Fetch product stock by product code
   * @param code
   * @returns Stock information for the specified product code
   */
  async function fetchProductDetail(productId: string): Promise<any | null> {
    return rateLimited(async () => {
      try {
        const res = await instance.get(`/produtos/${encodeURIComponent(productId)}`);
        const { data } = res.data;
        return data || null;
      } catch {
        return null;
      }
    });
  }

  /**
   * Fetch orders from Bling API
   * @param dateStart
   * @param dateEnd
   * @returns A list of orders from Bling API
   */
  async function fetchOrders(dateStart: string, dateEnd: string): Promise<any[]> {
    return rateLimited(async () => {
      const res = await instance.get('/pedidos/vendas', {
        params: { dataInicial: dateStart, dataFinal: dateEnd },
      });
      const { data } = res.data;
      return data?.map((p: any) => p.pedido ?? p) ?? [];
    });
  }

  /**
   * Fetch current stock balances for products by Bling product IDs and SKUs
   * @param productIds - Array of Bling product IDs
   * @param skus - Array of SKUs
   * @returns Object keyed by SKU, each value is the stock info object
   */
  async function fetchStockHistory(productIds: string[]): Promise<
    Record<
      string,
      {
        saldoFisicoTotal: number;
        saldoVirtualTotal: number;
        depositos: Array<{ id: number; saldoFisico: number; saldoVirtual: number }>;
        produto: { id: number; codigo: string };
      }
    >
  > {
    const idsQuery = productIds.map((id) => `idsProdutos[]=${encodeURIComponent(id)}`).join('&');
    const queryString = `${idsQuery}&filtroSaldoEstoque=1`;

    return rateLimited(async () => {
      const res = await instance.get(`/estoques/saldos?${queryString}`);
      const { data } = res.data;
      const history: Record<
        string,
        {
          saldoFisicoTotal: number;
          saldoVirtualTotal: number;
          depositos: Array<{ id: number; saldoFisico: number; saldoVirtual: number }>;
          produto: { id: number; codigo: string };
        }
      > = {};
      for (const item of data ?? []) {
        const sku = item.produto?.codigo;
        if (sku) {
          history[sku] = item;
        }
      }
      return history;
    });
  }

  return {
    fetchProducts,
    fetchProductDetail,
    fetchOrders,
    fetchStockHistory,
  };
}
