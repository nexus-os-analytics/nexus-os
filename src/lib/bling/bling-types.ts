export interface Product {
  id: number;
  name: string;
  sku: string;
  costPrice: number;
  salePrice: number;
  stock: number;
  image: string | null;
  shortDescription: string | null;
  avgMonthlySales: number;
  lastSaleDate: string | null; // ISO String
  categoryId: number | null;
}

export interface Category {
  id: number;
  name: string;
  parentId: number | null;
}

export interface SalesHistory {
  id: number;
  date: string; // ISO String
  productId: number;
  productSku: string;
  quantity: number;
  totalValue: number;
}

export interface StockBalance {
  productId: number;
  productSku: string;
  stock: number;
}

export interface ProductEvaluation {
  productId: number;
  productSku: string;
  productName: string;
  metrics: AlertMetrics;
  recommendationsStrings: string[]; // array to persist as you planned
  recommendation: RecommendationResult; // single final recommendation
}

export interface RecommendationResult {
  id: number;
  action?: string;
  justification?: string;
  estimatedFinancialImpact?: string;
  executionTime?: string;
  risk?: 'low' | 'medium' | 'high';
}

export interface AlertMetrics {
  idleDays: number;
  stockTurnover: number;
  stockCoverageDays: number;
  trend: number;
  capitalStuck: number;
}
