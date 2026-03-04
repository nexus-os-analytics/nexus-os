import axios, { type AxiosInstance, type AxiosRequestHeaders, type AxiosError } from 'axios';
import pino from 'pino';
import { createRateLimiter } from '../utils/rate-limiter';
import {
  adaptCategoryResponse,
  adaptProductsResponse,
  adaptSalesHistoryResponse,
  adaptStockBalanceResponse,
} from './meli-adapters';
import type {
  MeliApiUser,
  MeliCategoryType,
  MeliProductType,
  MeliSalesHistoryType,
  MeliStockBalanceType,
} from './meli-types';

const logger = pino();

export interface MeliClientOptions {
  accessToken: string;
}

/**
 * Mercado Livre rate limits: ~2.7 req/s per user (varies by seller reputation)
 * Using conservative 2 req/s with concurrency of 2 to stay safe
 */
const meliRateLimiter = createRateLimiter({
  concurrency: 2,
  maxPerSecond: 2,
});

export function createMeliClient({ accessToken }: MeliClientOptions) {
  const BASE = process.env.MELI_API_BASE_URL?.replace(/\/$/, '') ?? 'https://api.mercadolibre.com';

  const meliClient: AxiosInstance = axios.create({
    baseURL: BASE,
    timeout: 30000,
  });

  meliClient.interceptors.request.use((config) => {
    config.headers = config.headers ?? ({} as AxiosRequestHeaders);
    config.headers.Authorization = `Bearer ${accessToken}`;
    return config;
  });

  // Error interceptor to log API error messages
  meliClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response) {
        const { status, data } = error.response;
        const errorData = data as any;

        // Extract error message from Mercado Livre API response
        const apiMessage = errorData?.message || errorData?.error || 'Unknown error';
        const errorDetails = {
          status,
          message: apiMessage,
          method: error.config?.method?.toUpperCase(),
          url: error.config?.url,
          ...(errorData?.cause && { cause: errorData.cause }),
        };

        logger.error(errorDetails, `[MeliClient] API Error: ${apiMessage}`);
      } else if (error.request) {
        logger.error(
          {
            message: error.message,
            method: error.config?.method?.toUpperCase(),
            url: error.config?.url,
          },
          '[MeliClient] No response received from API'
        );
      } else {
        logger.error({ message: error.message }, '[MeliClient] Request setup error');
      }

      return Promise.reject(error);
    }
  );

  /**
   * Get authenticated user information
   */
  async function getUserInfo(): Promise<MeliApiUser> {
    return meliRateLimiter(async () => {
      const res = await meliClient.get('/users/me');
      return res.data;
    });
  }

  /**
   * Fetch items from Mercado Livre API
   * @param userId - Seller user ID
   * @param offset - Offset for pagination
   * @param limit - Limit of items per page (max 50)
   */
  async function getItems(
    userId: number,
    offset: number = 0,
    limit: number = 50
  ): Promise<MeliProductType[]> {
    return meliRateLimiter(async () => {
      const res = await meliClient.get(`/users/${userId}/items/search`, {
        params: { offset, limit, status: 'active' },
      });
      const itemIds: string[] = res.data.results;

      if (!itemIds.length) return [];

      // Fetch full item details (ML recommends batching with /items?ids=)
      const itemsRes = await meliClient.get('/items', {
        params: { ids: itemIds.join(',') },
      });

      // Response is array of { code: 200, body: {...} }
      const items = itemsRes.data.filter((r: any) => r.code === 200).map((r: any) => r.body);

      return adaptProductsResponse(items);
    });
  }

  /**
   * Fetch item details by ID
   */
  async function getItemDetails(itemId: string): Promise<MeliProductType> {
    return meliRateLimiter(async () => {
      const res = await meliClient.get(`/items/${itemId}`);
      return adaptProductsResponse([res.data])[0];
    });
  }

  /**
   * Fetch item stock (available quantity)
   */
  async function getItemStock(itemId: string): Promise<MeliStockBalanceType> {
    return meliRateLimiter(async () => {
      const res = await meliClient.get(`/items/${itemId}`);
      return adaptStockBalanceResponse(itemId, res.data.available_quantity);
    });
  }

  /**
   * Search orders in date range
   * @param sellerId - Seller user ID
   * @param dateFrom - Start date in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)
   * @param dateTo - End date in ISO 8601 format (YYYY-MM-DDTHH:mm:ss.sssZ)
   * @param offset - Pagination offset
   * @returns Array of order IDs matching the search criteria
   *
   * Note: Mercado Livre API requires full ISO 8601 datetime format with timezone.
   * Use daysAgoISO() helper to generate valid date strings.
   */
  async function searchOrders(
    sellerId: number,
    dateFrom: string,
    dateTo: string,
    offset: number = 0
  ): Promise<Array<{ id: number }>> {
    return meliRateLimiter(async () => {
      const res = await meliClient.get(`/orders/search`, {
        params: {
          seller: sellerId,
          'order.date_created.from': dateFrom,
          'order.date_created.to': dateTo,
          offset,
          limit: 50,
        },
      });
      return res.data.results?.map((order: any) => ({ id: order.id })) ?? [];
    });
  }

  /**
   * Fetch order details and adapt to sales history
   */
  async function getOrderDetails(orderId: number): Promise<MeliSalesHistoryType[]> {
    return meliRateLimiter(async () => {
      const res = await meliClient.get(`/orders/${orderId}`);
      return adaptSalesHistoryResponse(res.data);
    });
  }

  /**
   * Fetch category details
   */
  async function getCategory(categoryId: string): Promise<MeliCategoryType> {
    return meliRateLimiter(async () => {
      const res = await meliClient.get(`/categories/${categoryId}`);
      return adaptCategoryResponse([res.data])[0];
    });
  }

  return {
    getUserInfo,
    getItems,
    getItemDetails,
    getItemStock,
    searchOrders,
    getOrderDetails,
    getCategory,
  };
}
