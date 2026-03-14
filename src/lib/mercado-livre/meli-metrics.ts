/**
 * Mercado Livre Metrics Service
 *
 * Implements the generic IIntegrationService interface for Mercado Livre integration.
 * Adapts Meli-specific data structures to the generic integration format.
 *
 * @module lib/mercado-livre/meli-metrics
 */

import type {
  IntegrationConnection,
  IntegrationMetrics,
  IntegrationTopAction,
  SyncStatus,
} from '@/types/integrations';
import { IntegrationProvider } from '@/types/integrations';
import type {
  DisconnectParams,
  GetIntegrationParams,
  GetMetricsParams,
  IIntegrationService,
  IsConnectedParams,
} from '@/lib/integrations/base-integration';
import { createMeliRepository } from '@/lib/mercado-livre/meli-repository';
import { getSyncStatus } from '@/lib/integrations/server';
import prisma from '@/lib/prisma';
import type { MeliIntegration } from '@prisma/client';

/**
 * Mercado Livre metrics service implementation
 *
 * Provides methods to fetch metrics, connection status, and manage
 * the Meli integration lifecycle.
 */
export class MeliMetricsService implements IIntegrationService {
  /**
   * Get overview metrics for Meli integration
   *
   * Fetches aggregated metrics from the Meli repository and adapts
   * them to the generic IntegrationMetrics format.
   */
  async getMetrics(params: GetMetricsParams): Promise<IntegrationMetrics> {
    const { userId, integrationId } = params;

    // Fetch Meli integration
    const integration = await prisma.meliIntegration.findUnique({
      where: integrationId ? { id: integrationId } : { userId },
    });

    if (!integration) {
      throw new Error(`Meli integration not found for user ${userId}`);
    }

    // Get current sync status
    const syncStatus = await getSyncStatus(userId, IntegrationProvider.MERCADO_LIVRE);

    // Fetch metrics from Meli repository
    const repository = createMeliRepository({ integrationId: integration.id });
    const meliMetrics = await repository.getOverviewMetrics({ integrationId: integration.id });

    // Adapt to generic format
    return adaptMeliMetricsToGeneric(meliMetrics, syncStatus);
  }

  /**
   * Get Meli integration connection details
   */
  async getIntegration(params: GetIntegrationParams): Promise<IntegrationConnection | null> {
    const { userId } = params;

    const integration = await prisma.meliIntegration.findUnique({
      where: { userId },
    });

    if (!integration) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { meliSyncStatus: true },
    });

    if (!user) {
      return null;
    }

    return adaptMeliIntegrationToGeneric(integration, user);
  }

  /**
   * Disconnect Meli integration
   *
   * Deletes the integration and resets the user's sync status.
   */
  async disconnect(params: DisconnectParams): Promise<void> {
    const { userId } = params;

    await prisma.meliIntegration.delete({
      where: { userId },
    });

    // Reset sync status
    await prisma.user.update({
      where: { id: userId },
      data: { meliSyncStatus: 'IDLE' },
    });
  }

  /**
   * Check if user has an active Meli connection
   */
  async isConnected(params: IsConnectedParams): Promise<boolean> {
    const { userId } = params;

    const integration = await prisma.meliIntegration.findUnique({
      where: { userId },
      select: { accessToken: true },
    });

    return !!integration?.accessToken;
  }
}

/**
 * Adapt Meli metrics to generic format
 */
function adaptMeliMetricsToGeneric(
  meliMetrics: {
    capitalStuck: number;
    ruptureCount: number;
    opportunityCount: number;
    topActions: Array<{
      id: string;
      name: string;
      sku: string;
      recommendations: string | null;
      impactAmount?: number;
      impactLabel?: string;
      alertType?: string;
      alertRisk?: string;
    }>;
    productCount?: number;
    productLimit?: number | null;
  },
  syncStatus: SyncStatus
): IntegrationMetrics {
  return {
    capitalStuck: meliMetrics.capitalStuck,
    ruptureCount: meliMetrics.ruptureCount,
    opportunityCount: meliMetrics.opportunityCount,
    topActions: meliMetrics.topActions.map(adaptMeliActionToGeneric),
    productCount: meliMetrics.productCount,
    productLimit: meliMetrics.productLimit,
    lastSyncAt: null,
    syncStatus,
  };
}

/**
 * Adapt Meli top action to generic format
 */
function adaptMeliActionToGeneric(action: {
  id: string;
  name: string;
  sku: string;
  recommendations: string | null;
  impactAmount?: number;
  impactLabel?: string;
  alertType?: string;
  alertRisk?: string;
}): IntegrationTopAction {
  return {
    id: action.id,
    name: action.name,
    sku: action.sku,
    recommendations: action.recommendations,
    impactAmount: action.impactAmount,
    impactLabel: action.impactLabel,
    alertType: action.alertType,
    alertRisk: action.alertRisk,
  };
}

/**
 * Adapt Meli integration to generic connection format
 */
function adaptMeliIntegrationToGeneric(
  integration: MeliIntegration,
  user: { meliSyncStatus: string }
): IntegrationConnection {
  return {
    id: integration.id,
    userId: integration.userId,
    provider: IntegrationProvider.MERCADO_LIVRE,
    isConnected: !!integration.accessToken,
    syncStatus: user.meliSyncStatus as SyncStatus,
    lastSyncAt: null,
    createdAt: integration.connectedAt,
    updatedAt: integration.updatedAt,
  };
}
