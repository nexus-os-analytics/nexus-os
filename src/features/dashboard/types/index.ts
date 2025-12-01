import type { BlingAlertType, BlingRuptureRisk } from '@prisma/client';

export interface DashboardProductAlert {
  product: Product;
  alert: Omit<Alert, 'finalRecommendation' | 'metrics' | 'recommendations'> & {
    finalRecommendation: DashboardFinalRecommendation;
    metrics: DashboardMetrics;
    recommendations: string[];
  };
}

export interface DashboardFirstImpact {
  capitalStuck: number;
  ruptureCount: number;
  opportunityCount: number;
  topActions: Array<{
    productName: string;
    action: string;
    metrics: DashboardMetrics;
  }>;
}

interface Product {
  id: string;
  blingProductId: string;
  categoryId: string | null;
  name: string;
  sku: string;
  costPrice: number;
  salePrice: number;
  avgMonthlySales: number;
  stock: number;
  image: string | null;
  shortDescription: string | null;
  lastSaleDate: string | null;
  integrationId: string;
  createdAt: string;
  updatedAt: string;
  capitalCostRate: number;
  isActive: boolean;
  replenishmentTime: number;
  safetyStock: number;
  storageCostRate: number;
}

export interface DashboardFinalRecommendation {
  id: number;
  action: string;
  justification: string;
  estimatedFinancialImpact: string;
  executionTime: string;
  risk: string;
  financialImpactValue: number;
}

export interface DashboardMetrics {
  idleDays: number;
  stockTurnover: number;
  stockCoverageDays: number;
  trend: number;
  capitalStuck: number;
  daysRemaining: number;
}

interface Alert {
  id: string;
  productId: string;
  type: BlingAlertType;
  risk: BlingRuptureRisk;
  generatedAt: string;
  acknowledged: boolean;
  executedAt: string | null;
  createdAt: string;
  updatedAt: string;
  finalRecommendation: string; // String JSON que precisa ser parseada para FinalRecommendation
  jobId: string;
  metrics: string; // String JSON que precisa ser parseada para Metrics
  pricing: string | null;
  riskLabel: string;
  recommendations: string; // String JSON que precisa ser parseada para string[]
  expirationDate: string | null;
  financialImpact: number | null;
  priority: string | null;
  urgencyScore: number | null;
}
