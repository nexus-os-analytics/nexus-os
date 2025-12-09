import type {
  BlingAlertType as AlertTypeEnum,
  BlingRuptureRisk as RuptureRiskEnum,
} from '@prisma/client';
import pino from 'pino';
import type { DashboardProductAlert } from '../types';

const logger = pino();
interface GetAlertsParams {
  integrationId: string;
  limit?: number;
  cursor?: string; // ISO timestamp or id
  filters?: {
    type?: AlertTypeEnum[];
    risk?: RuptureRiskEnum[];
  };
}

export async function getDashboardAlerts({
  integrationId,
  limit = 20,
  cursor,
  // filters,
}: GetAlertsParams): Promise<{
  data: DashboardProductAlert[];
  nextCursor: string | null;
  hasNextPage: boolean;
}> {
  logger.info(
    `[getDashboardAlerts] Fetching alerts for integration ${integrationId} with limit ${limit} and cursor ${cursor}`
  );

  return {
    data: [],
    nextCursor: null,
    hasNextPage: false,
  };
}
