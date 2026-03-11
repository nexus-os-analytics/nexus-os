import type {
  ShopeeAlertType as AlertTypeEnum,
  ShopeeRuptureRisk as RuptureRiskEnum,
} from '@prisma/client';

// =============================================================================
// Shopee API response types
// =============================================================================

export interface ShopeeApiPriceInfo {
  current_price: number;
  original_price: number;
}

export interface ShopeeApiStockInfo {
  summary_info: {
    total_reserved_stock: number;
    total_available_stock: number;
  };
}

export interface ShopeeApiImageInfo {
  image_url_list: string[];
}

export interface ShopeeApiItem {
  item_id: number;
  item_name: string;
  item_sku: string;
  price_info: ShopeeApiPriceInfo[];
  stock_info_v2: ShopeeApiStockInfo;
  image: ShopeeApiImageInfo;
  item_status: string; // 'NORMAL' | 'BANNED' | 'DELETED' | 'UNLIST'
  category_id: number;
}

export interface ShopeeApiOrderItem {
  item_id: number;
  item_sku: string;
  model_quantity_purchased: number;
  model_discounted_price: number;
}

export interface ShopeeApiOrder {
  order_sn: string;
  order_status: string;
  create_time: number; // Unix timestamp
  update_time: number;
  item_list: ShopeeApiOrderItem[];
}

export interface ShopeeApiCategory {
  category_id: number;
  display_category_name: string;
  parent_category_id: number;
}

export interface ShopeeTokenResponse {
  access_token: string;
  refresh_token: string;
  expire_in: number;
  shop_id: number;
  partner_id: number;
  error?: string;
  message?: string;
}

export interface ShopeeApiItemListResponse {
  response: {
    item: Array<{ item_id: number; item_status: string }>;
    total_count: number;
    has_next_page: boolean;
    next_offset: number;
  };
  error: string;
  message: string;
}

export interface ShopeeApiItemBaseInfoResponse {
  response: {
    item_list: ShopeeApiItem[];
  };
  error: string;
  message: string;
}

export interface ShopeeApiOrderListResponse {
  response: {
    order_list: Array<{ order_sn: string; order_status: string }>;
    more: boolean;
    next_cursor: string;
  };
  error: string;
  message: string;
}

export interface ShopeeApiOrderDetailResponse {
  response: {
    order_list: ShopeeApiOrder[];
  };
  error: string;
  message: string;
}

// =============================================================================
// Internal domain types  
// =============================================================================

export interface ShopeeProductType {
  id: string;
  shopeeItemId: string;
  shopeeCategoryId?: string | null;
  title: string;
  sku: string | null;
  costPrice: number;
  salePrice: number;
  currentStock: number;
  thumbnail?: string | null;
  permalink?: string | null;
  status?: string | null;
  createdAt: Date;
  updatedAt: Date;
  category?: ShopeeCategoryType | null;
  alert?: ShopeeProductAlertType | null;
  settings?: ShopeeProductSettingsType | null;
  orderHistory?: ShopeeSalesHistoryType[];
  stockBalances?: ShopeeStockBalanceType[];
}

export interface ShopeeProductAlertType {
  id: string;
  shopeeItemId: string;
  type: AlertTypeEnum;
  risk: RuptureRiskEnum;
  vvdReal: number;
  vvd30: number;
  vvd7: number;
  daysRemaining: number;
  reorderPoint: number;
  growthTrend: number;
  capitalStuck: number;
  daysSinceLastSale: number;
  suggestedPrice: number;
  discount: number;
  discountAmount: number;
  estimatedDeadline: number;
  recoverableAmount: number;
  daysOutOfStock: number;
  estimatedLostSales: number;
  estimatedLostAmount: number;
  idealStock: number;
  excessUnits: number;
  excessPercentage: number;
  excessCapital: number;
  message?: string | null;
  recommendations?: string | null; // JSON stringified array of strings
  lastCriticalNotifiedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  product?: ShopeeProductType | null;
}

export interface ShopeeProductSettingsType {
  id: string;
  shopeeItemId: string;
  leadTimeDays: number;
  safetyDays: number;
  criticalDaysRemainingThreshold: number;
  highDaysRemainingThreshold: number;
  mediumDaysRemainingThreshold: number;
  opportunityGrowthThresholdPct: number;
  opportunityDemandVvd: number;
  deadStockCapitalThreshold: number;
  capitalOptimizationThreshold: number;
  ruptureCapitalThreshold: number;
  liquidationDiscount: number;
  costFactor: number;
  liquidationExcessCapitalThreshold: number;
  fineExcessCapitalMax: number;
  product?: ShopeeProductType;
}

export interface ShopeeCategoryType {
  id: string;
  name: string;
  shopeeCategoryId: string;
  createdAt: Date;
  updatedAt: Date;
  products?: ShopeeProductType[];
}

export interface ShopeeSalesHistoryType {
  id: string;
  shopeeOrderSn: string;
  shopeeItemId: string;
  date: Date;
  quantity: number;
  totalValue: number;
  createdAt: Date;
  updatedAt: Date;
  product?: ShopeeProductType | null;
}

export interface ShopeeStockBalanceType {
  id: string;
  shopeeItemId: string;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
  product?: ShopeeProductType | null;
}

export interface ShopeeProductMetrics {
  type: AlertTypeEnum;
  risk: RuptureRiskEnum;
  vvdReal: number;
  vvd30: number;
  vvd7: number;
  daysRemaining: number;
  reorderPoint: number;
  growthTrend: number;
  capitalStuck: number;
  daysSinceLastSale: number;
  suggestedPrice: number;
  discount: number;
  discountAmount: number;
  estimatedDeadline: number;
  recoverableAmount: number;
  daysOutOfStock: number;
  estimatedLostSales: number;
  estimatedLostAmount: number;
  idealStock: number;
  excessUnits: number;
  excessPercentage: number;
  excessCapital: number;
  message: string;
  recommendations: string[];
}

export interface ShopeeProductData {
  costPrice: number;
  salePrice: number;
  currentStock: number;
  daysWithSales: number;
  totalSales: number;
  hasStockOut: boolean;
  lastSaleDate: Date | null;
  totalLast30DaysSales: number;
  totalLast7DaysSales: number;
  stockOutDate: Date | null;
  daysWithSalesWithinLast30: number;
  daysWithSalesWithinLast7: number;
}
