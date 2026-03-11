/**
 * Mercado Livre Metrics Service
 *
 * Implements the generic IIntegrationService interface for Mercado Livre integration.
 * Adapts Meli-specific data structures to the generic integration format.
 *
 * @module lib/mercado-livre/meli-metrics
 */

import type { IntegrationConnection, IntegrationMetrics, SyncStatus } from '@/types/integrations';
import { IntegrationProvider } from '@/types/integrations';
import type {
  DisconnectParams,
  GetIntegrationParams,
  GetMetricsParams,
  IIntegrationService,
  IsConnectedParams,
} from '@/lib/integrations/base-integration';
import { getSyncStatus } from '@/lib/integrations/utils';
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
   * Currently returns basic metrics. Full implementation will calculate
   * metrics from MeliProduct, MeliAlert, and other models.
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

    // Count products
    const productCount = await prisma.meliProduct.count({
      where: { integrationId: integration.id },
    });

    // TODO: Implement full metrics calculation from Meli data
    // For now, return basic structure with product count
    return {
      capitalStuck: 0, // TODO: Calculate from products
      ruptureCount: 0, // TODO: Calculate from alerts/stock
      opportunityCount: 0, // TODO: Calculate from opportunities
      topActions: [], // TODO: Get top priority actions
      productCount,
      productLimit: null, // TODO: Check user plan
      lastSyncAt: null, // TODO: Add lastSyncedAt to MeliIntegration model
      syncStatus,
    };
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
   * Soft deletes the integration by clearing tokens and marking as disconnected.
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
    lastSyncAt: null, // TODO: Add lastSyncedAt to MeliIntegration model
    createdAt: integration.connectedAt,
    updatedAt: integration.updatedAt,
  };
}
