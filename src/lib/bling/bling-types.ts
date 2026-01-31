import type {
  BlingAlertType as AlertTypeEnum,
  BlingRuptureRisk as RuptureRiskEnum,
} from '@prisma/client';

export interface BlingProductType {
  id: string;
  blingProductId: string;
  blingCategoryId?: string | null;
  name: string;
  sku: string;
  costPrice: number;
  salePrice: number;
  currentStock: number;
  image?: string | null;
  shortDescription?: string | null;
  createdAt: Date;
  updatedAt: Date;
  category?: BlingCategoryType | null;
  alert?: BlingProductAlertType | null;
  settings?: BlingProductSettingsType | null;
  salesHistory?: BlingSalesHistoryType[];
  stockBalances?: BlingStockBalanceType[];
}

export interface BlingProductAlertType {
  id: string;
  blingProductId: string;
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
  recommendations?: string | null; // JSON stringified array of strings
  lastCriticalNotifiedAt?: Date | null;
  createdAt: Date;
  updatedAt: Date;
  product?: BlingProductType | null;
}

export interface BlingProductSettingsType {
  id: string;
  blingProductId: string;
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
  product?: BlingProductType;
}

export interface BlingCategoryType {
  id: string;
  name: string;
  blingCategoryId: string;
  blingParentId?: string | null;
  createdAt: Date;
  updatedAt: Date;
  products?: BlingProductType[];
}

export interface BlingSalesHistoryType {
  id: string;
  blingSaleId: string;
  blingProductId: string;
  date: Date;
  quantity: number;
  totalValue: number;
  createdAt: Date;
  updatedAt: Date;
  product?: BlingProductType | null;
}

export interface BlingStockBalanceType {
  id: string;
  blingProductId: string;
  stock: number;
  createdAt: Date;
  updatedAt: Date;
  product?: BlingProductType | null;
}

export interface BlingProductData {
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

export interface BlingProductMetrics {
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
