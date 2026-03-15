import type {
  BlingAlertType,
  BlingRuptureRisk,
  IntegrationProvider,
  MeliAlertType,
  MeliRuptureRisk,
  ShopeeAlertType,
  ShopeeRuptureRisk,
} from '@prisma/client';
import type { BlingProductType } from '@/lib/bling';
import type { MeliProductType } from '@/lib/mercado-livre';

export interface GetProductsAlertsParams {
  integrationId: string;
  limit?: number;
  cursor?: string; // ISO timestamp or id
  filters?: {
    type?: BlingAlertType[];
    risk?: BlingRuptureRisk[];
  };
}

export interface GetProductAlertsResponse {
  data: DashboardAlertProduct[];
  nextCursor: string | null;
  hasNextPage: boolean;
}

export interface GetOverviewMetricsParams {
  integrationId: string;
}

export interface GetOverviewMetricsResponse {
  capitalStuck: number;
  ruptureCount: number;
  opportunityCount: number;
  topActions: Array<{
    id: string;
    name: string;
    sku: string;
    recommendations: string | null;
    impactAmount?: number; // Valor monetário associado (ex.: capital parado/excesso)
    impactLabel?: string; // Texto curto explicando o impacto
    alertType?: BlingAlertType;
    alertRisk?: BlingRuptureRisk;
  }>;
  /** Present for FREE plan: number of products currently in the integration (cota). */
  productCount?: number;
  /** Present for FREE plan: max products allowed (e.g. 30). PRO has null/unlimited. */
  productLimit?: number | null;
}

export interface GetMeliProductsAlertsParams {
  integrationId: string;
  limit?: number;
  cursor?: string;
  filters?: {
    type?: MeliAlertType[];
    risk?: MeliRuptureRisk[];
  };
}

export interface GetMeliProductAlertsResponse {
  data: MeliProductType[];
  nextCursor: string | null;
  hasNextPage: boolean;
}

/**
 * Provider-agnostic alert fields shared across Bling, Mercado Livre, and Shopee.
 */
export interface DashboardProductAlert {
  id: string;
  type: BlingAlertType | MeliAlertType | ShopeeAlertType;
  risk: BlingRuptureRisk | MeliRuptureRisk | ShopeeRuptureRisk;
  vvdReal: number;
  vvd30: number;
  vvd7: number;
  daysRemaining: number;
  reorderPoint: number;
  capitalStuck: number;
  daysSinceLastSale: number;
  message: string | null;
  recommendations: string | null; // JSON-stringified string[]
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Provider-agnostic product with optional alert, used in the dashboard alert views.
 */
export interface DashboardAlertProduct {
  id: string;
  externalId: string; // blingProductId | meliItemId | shopeeItemId
  provider: IntegrationProvider;
  name: string;
  sku: string | null;
  costPrice: number | null;
  salePrice: number | null;
  currentStock: number;
  image: string | null;
  alert: DashboardProductAlert | null;
}
