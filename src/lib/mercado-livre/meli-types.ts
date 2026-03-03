import type {
  MeliAlertType as AlertTypeEnum,
  MeliRuptureRisk as RuptureRiskEnum,
} from '@prisma/client';

export interface MeliProductType {
  id: string;
  meliItemId: string;
  meliCategoryId?: string | null;
  title: string;
  sku: string | null;
  costPrice: number;
  salePrice: number;
  currentStock: number;
  thumbnail?: string | null;
  permalink?: string | null;
  listingType?: string | null;
  status?: string | null;
  createdAt: Date;
  updatedAt: Date;
  category?: MeliCategoryType | null;
  alert?: MeliProductAlertType | null;
  settings?: MeliProductSettingsType | null;
  salesHistory?: MeliSalesHistoryType[];
  stockBalances?: MeliStockBalanceType[];
}

export interface MeliProductAlertType {
  id: string;
  meliItemId: string;
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
  discount?: number;
  discountAmount?: number;
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
  recommendations?: any; // JsonValue from Prisma
  lastCriticalNotifiedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  product?: MeliProductType | null;
}

export interface MeliProductSettingsType {
  id: string;
  meliItemId: string;
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
  product?: MeliProductType;
}

export interface MeliCategoryType {
  id: string;
  name: string;
  meliCategoryId: string;
  createdAt: Date;
  updatedAt: Date;
  products?: MeliProductType[];
}

export interface MeliSalesHistoryType {
  id: string;
  meliOrderId: string;
  meliItemId: string;
  date: Date;
  quantity: number;
  totalValue: number;
  createdAt: Date;
  updatedAt: Date;
  product?: MeliProductType | null;
}

export interface MeliStockBalanceType {
  id: string;
  meliItemId: string;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
  product?: MeliProductType | null;
}

export interface MeliProductData {
  totalSales: number;
  daysWithSales: number;
  totalLast30DaysSales: number;
  totalLast7DaysSales: number;
  currentStock: number;
  costPrice: number;
  salePrice: number;
  lastSaleDate: Date | null;
  hasStockOut: boolean;
  stockOutDate?: Date;
  daysWithSalesWithinLast30?: number;
  daysWithSalesWithinLast7?: number;
}

export interface MeliProductMetrics {
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
  risk: RuptureRiskEnum;
  type: AlertTypeEnum;
  message: string;
  recommendations: string[];
  idealStock?: number;
  excessUnits?: number;
  excessPercentage?: number;
  excessCapital?: number;
}

/**
 * Mercado Livre API response types
 */

export interface MeliApiItem {
  id: string;
  title: string;
  price: number;
  available_quantity: number;
  sold_quantity: number;
  thumbnail: string;
  pictures?: Array<{ url: string }>;
  category_id: string;
  seller_custom_field?: string; // SKU
  attributes?: Array<{ id: string; value_name: string }>;
}

export interface MeliApiCategory {
  id: string;
  name: string;
}

export interface MeliApiOrder {
  id: number;
  date_created: string;
  date_closed: string;
  total_amount: number;
  order_items: Array<{
    item: {
      id: string;
      title: string;
    };
    quantity: number;
    unit_price: number;
  }>;
}

export interface MeliApiUser {
  id: number;
  nickname: string;
  email?: string;
}
