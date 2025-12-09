import pino from 'pino';
import type { DashboardFirstImpact } from '../types';

const logger = pino();

export async function getDashboardFirstImpact(
  integrationId: string,
  limit: number = 5
): Promise<DashboardFirstImpact> {
  logger.info(
    `[getDashboardFirstImpact] Fetching first impact data for integration ${integrationId} with limit ${limit}`
  );
  return {
    capitalStuck: 0,
    ruptureCount: 0,
    opportunityCount: 0,
    topActions: [],
  };
}
