import crypto from 'node:crypto';
import axios, { type AxiosInstance, type AxiosRequestHeaders, type AxiosError } from 'axios';
import pino from 'pino';
import { createRateLimiter } from '../utils/rate-limiter';
import {
  adaptCategoryResponse,
  adaptProductsResponse,
  adaptSalesHistoryResponse,
  adaptStockBalanceResponse,
} from './shopee-adapters';
import type {
  ShopeeCategoryType,
  ShopeeProductType,
  ShopeeSalesHistoryType,
  ShopeeStockBalanceType,
  ShopeeApiItemListResponse,
  ShopeeApiItemBaseInfoResponse,
  ShopeeApiOrderListResponse,
  ShopeeApiOrderDetailResponse,
} from './shopee-types';

const logger = pino();

export interface ShopeeClientOptions {
  accessToken: string;
  shopId: string;
}

/**
 * Shopee API rate limits: typically 10 req/s per shop
 * Using conservative 5 req/s with concurrency of 3 to stay safe
 */
const shopeeRateLimiter = createRateLimiter({
  concurrency: 3,
  maxPerSecond: 5,
});

const PARTNER_ID = Number(process.env.SHOPEE_PARTNER_ID ?? '0');
const PARTNER_KEY = process.env.SHOPEE_PARTNER_KEY ?? '';

/**
 * Generate HMAC-SHA256 signature for Shopee API requests
 * Format: partner_id + path + timestamp + access_token + shop_id
 */
export function generateSign(path: string, timestamp: number, accessToken?: string, shopId?: string): string {
  const baseString = accessToken && shopId
    ? `${PARTNER_ID}${path}${timestamp}${accessToken}${shopId}`
    : `${PARTNER_ID}${path}${timestamp}`;
  return crypto.createHmac('sha256', PARTNER_KEY).update(baseString).digest('hex');
}

export function createShopeeClient({ accessToken, shopId }: ShopeeClientOptions) {
  const BASE =
    process.env.SHOPEE_API_BASE_URL?.replace(/\/$/, '') ?? 'https://partner.shopeemobile.com/api/v2';

  const shopeeClient: AxiosInstance = axios.create({
    baseURL: BASE,
    timeout: 30000,
  });

  shopeeClient.interceptors.request.use((config) => {
    config.headers = config.headers ?? ({} as AxiosRequestHeaders);
    return config;
  });

  shopeeClient.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response) {
        const { status, data } = error.response;
        const errorData = data as Record<string, unknown>;
        const apiMessage = (errorData?.message ?? errorData?.error ?? 'Unknown error') as string;
        logger.error(
          { status, message: apiMessage, url: error.config?.url },
          `[ShopeeClient] API Error: ${apiMessage}`
        );
      } else {
        logger.error({ message: error.message }, '[ShopeeClient] Request error');
      }
      return Promise.reject(error);
    }
  );

  function buildParams(path: string, extra: Record<string, unknown> = {}): Record<string, unknown> {
    const timestamp = Math.floor(Date.now() / 1000);
    const sign = generateSign(path, timestamp, accessToken, shopId);
    return {
      partner_id: PARTNER_ID,
      timestamp,
      sign,
      access_token: accessToken,
      shop_id: shopId,
      ...extra,
    };
  }

  /**
   * Fetch item list from Shopee (returns item IDs + status only)
   */
  async function getItemList(
    offset: number = 0,
    pageSize: number = 50
  ): Promise<{ items: Array<{ item_id: number; item_status: string }>; hasNextPage: boolean; nextOffset: number }> {
    return shopeeRateLimiter(async () => {
      const path = '/product/get_item_list';
      const params = buildParams(path, { offset, page_size: pageSize, item_status: 'NORMAL' });
      const res = await shopeeClient.get<ShopeeApiItemListResponse>(path, { params });

      if (res.data.error) {
        logger.error({ error: res.data.error, message: res.data.message }, '[ShopeeClient] getItemList error');
        return { items: [], hasNextPage: false, nextOffset: 0 };
      }

      const { item = [], has_next_page = false, next_offset = 0 } = res.data.response ?? {};
      return { items: item, hasNextPage: has_next_page, nextOffset: next_offset };
    });
  }

  /**
   * Fetch item base info (full details) for a batch of item IDs
   */
  async function getItemBaseInfo(itemIds: number[]): Promise<ShopeeProductType[]> {
    return shopeeRateLimiter(async () => {
      const path = '/product/get_item_base_info';
      const params = buildParams(path, { item_id_list: itemIds.join(','), need_tax_info: false, need_complaint_policy: false });
      const res = await shopeeClient.get<ShopeeApiItemBaseInfoResponse>(path, { params });

      if (res.data.error) {
        logger.error({ error: res.data.error, message: res.data.message }, '[ShopeeClient] getItemBaseInfo error');
        return [];
      }

      const items = res.data.response?.item_list ?? [];
      return adaptProductsResponse(items);
    });
  }

  /**
   * Fetch order list for a time range (paginated by cursor)
   */
  async function getOrderList(
    timeFrom: number, // Unix timestamp
    timeTo: number,   // Unix timestamp
    cursor: string = '',
    pageSize: number = 50
  ): Promise<{ orders: Array<{ order_sn: string; order_status: string }>; more: boolean; nextCursor: string }> {
    return shopeeRateLimiter(async () => {
      const path = '/order/get_order_list';
      const params = buildParams(path, {
        time_range_field: 'create_time',
        time_from: timeFrom,
        time_to: timeTo,
        page_size: pageSize,
        cursor,
        order_status: 'COMPLETED',
        response_optional_fields: 'order_status',
      });
      const res = await shopeeClient.get<ShopeeApiOrderListResponse>(path, { params });

      if (res.data.error) {
        logger.error({ error: res.data.error, message: res.data.message }, '[ShopeeClient] getOrderList error');
        return { orders: [], more: false, nextCursor: '' };
      }

      const { order_list = [], more = false, next_cursor = '' } = res.data.response ?? {};
      return { orders: order_list, more, nextCursor: next_cursor };
    });
  }

  /**
   * Fetch order details for a batch of order SNs
   */
  async function getOrderDetail(orderSns: string[]): Promise<ShopeeSalesHistoryType[]> {
    return shopeeRateLimiter(async () => {
      const path = '/order/get_order_detail';
      const params = buildParams(path, {
        order_sn_list: orderSns.join(','),
        response_optional_fields: 'item_list,create_time',
      });
      const res = await shopeeClient.get<ShopeeApiOrderDetailResponse>(path, { params });

      if (res.data.error) {
        logger.error({ error: res.data.error, message: res.data.message }, '[ShopeeClient] getOrderDetail error');
        return [];
      }

      const orders = res.data.response?.order_list ?? [];
      return orders.flatMap((order) => adaptSalesHistoryResponse(order));
    });
  }

  /**
   * Fetch category list for the shop
   */
  async function getShopCategories(): Promise<ShopeeCategoryType[]> {
    return shopeeRateLimiter(async () => {
      const path = '/product/get_category';
      const params = buildParams(path, { language: 'pt' });
      const res = await shopeeClient.get(path, { params });

      if (res.data.error) {
        logger.error({ error: res.data.error, message: res.data.message }, '[ShopeeClient] getShopCategories error');
        return [];
      }

      const categories = res.data.response?.category_list ?? [];
      return adaptCategoryResponse(categories);
    });
  }

  /**
   * Fetch stock info for items (returns stock balances)
   */
  async function getStockInfo(itemIds: number[]): Promise<ShopeeStockBalanceType[]> {
    return shopeeRateLimiter(async () => {
      const path = '/product/get_item_base_info';
      const params = buildParams(path, { item_id_list: itemIds.join(','), need_tax_info: false, need_complaint_policy: false });
      const res = await shopeeClient.get<ShopeeApiItemBaseInfoResponse>(path, { params });

      if (res.data.error) {
        logger.error({ error: res.data.error, message: res.data.message }, '[ShopeeClient] getStockInfo error');
        return [];
      }

      const items = res.data.response?.item_list ?? [];
      return items.map((item) =>
        adaptStockBalanceResponse(
          String(item.item_id),
          item.stock_info_v2?.summary_info?.total_available_stock ?? 0
        )
      );
    });
  }

  return {
    getItemList,
    getItemBaseInfo,
    getOrderList,
    getOrderDetail,
    getShopCategories,
    getStockInfo,
  };
}
