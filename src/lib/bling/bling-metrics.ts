/**
 * Bling Metrics Service
 *
 * Implements the generic IIntegrationService interface for Bling ERP integration.
 * Adapts Bling-specific data structures to the generic integration format.
 *
 * @module lib/bling/bling-metrics
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
import { createBlingRepository } from '@/lib/bling/bling-repository';
import { getSyncStatus } from '@/lib/integrations/server';
import prisma from '@/lib/prisma';
import type { BlingIntegration, User } from '@prisma/client';

/**
 * Bling metrics service implementation
 *
 * Provides methods to fetch metrics, connection status, and manage
 * the Bling integration lifecycle.
 */
export class BlingMetricsService implements IIntegrationService {
  /**
   * Get overview metrics for Bling integration
   *
   * Fetches aggregated metrics from the Bling repository and adapts
   * them to the generic IntegrationMetrics format.
   */
  async getMetrics(params: GetMetricsParams): Promise<IntegrationMetrics> {
    const { userId, integrationId } = params;

    // Fetch Bling integration
    const integration = await prisma.blingIntegration.findUnique({
      where: integrationId ? { id: integrationId } : { userId },
    });

    if (!integration) {
      throw new Error(`Bling integration not found for user ${userId}`);
    }

    // Get current sync status
    const syncStatus = await getSyncStatus(userId, IntegrationProvider.BLING);

    // Fetch metrics from Bling repository
    const repository = createBlingRepository({ integrationId: integration.id });
    const blingMetrics = await repository.getOverviewMetrics({ integrationId: integration.id });

    // Adapt to generic format
    return adaptBlingMetricsToGeneric(blingMetrics, syncStatus);
  }

  /**
   * Get Bling integration connection details
   */
  async getIntegration(params: GetIntegrationParams): Promise<IntegrationConnection | null> {
    const { userId } = params;

    const integration = await prisma.blingIntegration.findUnique({
      where: { userId },
    });

    if (!integration) {
      return null;
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { blingSyncStatus: true },
    });

    if (!user) {
      return null;
    }

    return adaptBlingIntegrationToGeneric(integration, user);
  }

  /**
   * Disconnect Bling integration
   *
   * Soft deletes the integration by clearing tokens and marking as disconnected.
   */
  async disconnect(params: DisconnectParams): Promise<void> {
    const { userId } = params;

    await prisma.blingIntegration.delete({
      where: { userId },
    });

    // Reset sync status
    await prisma.user.update({
      where: { id: userId },
      data: { blingSyncStatus: 'IDLE' },
    });
  }

  /**
   * Check if user has an active Bling connection
   */
  async isConnected(params: IsConnectedParams): Promise<boolean> {
    const { userId } = params;

    const integration = await prisma.blingIntegration.findUnique({
      where: { userId },
      select: { accessToken: true },
    });

    return !!integration?.accessToken;
  }
}

/**
 * Adapt Bling metrics to generic format
 */
function adaptBlingMetricsToGeneric(
  blingMetrics: {
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
    capitalStuck: blingMetrics.capitalStuck,
    ruptureCount: blingMetrics.ruptureCount,
    opportunityCount: blingMetrics.opportunityCount,
    topActions: blingMetrics.topActions.map(adaptBlingActionToGeneric),
    productCount: blingMetrics.productCount,
    productLimit: blingMetrics.productLimit,
    lastSyncAt: null, // TODO: Add lastSyncedAt to BlingIntegration model
    syncStatus,
  };
}

/**
 * Adapt Bling top action to generic format
 */
function adaptBlingActionToGeneric(action: {
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
 * Adapt Bling integration to generic connection format
 */
function adaptBlingIntegrationToGeneric(
  integration: BlingIntegration,
  user: { blingSyncStatus: string }
): IntegrationConnection {
  return {
    id: integration.id,
    userId: integration.userId,
    provider: IntegrationProvider.BLING,
    isConnected: !!integration.accessToken,
    syncStatus: user.blingSyncStatus as SyncStatus,
    lastSyncAt: null, // TODO: Add lastSyncedAt to BlingIntegration model
    createdAt: integration.connectedAt,
    updatedAt: integration.updatedAt,
  };
}
