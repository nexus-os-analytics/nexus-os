import type { BlingAlertType, BlingRuptureRisk } from '@prisma/client';
import type { BlingProductType } from '@/lib/bling';

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
  data: BlingProductType[];
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
