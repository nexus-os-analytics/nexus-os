/**
 * Shopee Metrics Service
 *
 * Implements the generic IIntegrationService interface for the Shopee integration.
 * Adapts Shopee-specific data structures to the generic integration format.
 *
 * @module lib/shopee/shopee-metrics
 */

import type { IntegrationConnection, IntegrationMetrics } from '@/types/integrations';
import { IntegrationProvider, SyncStatus } from '@/types/integrations';
import type {
  DisconnectParams,
  GetIntegrationParams,
  GetMetricsParams,
  IIntegrationService,
  IsConnectedParams,
} from '@/lib/integrations/base-integration';
import { getSyncStatus } from '@/lib/integrations/utils';
import prisma from '@/lib/prisma';
import { createShopeeRepository } from './shopee-repository';

export class ShopeeMetricsService implements IIntegrationService {
  async getMetrics(params: GetMetricsParams): Promise<IntegrationMetrics> {
    const { userId, integrationId } = params;

    const integration = await prisma.shopeeIntegration.findUnique({
      where: integrationId ? { id: integrationId } : { userId },
    });

    if (!integration) {
      throw new Error(`Shopee integration not found for user ${userId}`);
    }

    const syncStatus = await getSyncStatus(userId, IntegrationProvider.SHOPEE);

    const productCount = await prisma.shopeeProduct.count({
      where: { integrationId: integration.id },
    });

    const repo = createShopeeRepository({ integrationId: integration.id });
    const metrics = await repo.getOverviewMetrics({ integrationId: integration.id });

    return {
      capitalStuck: metrics.capitalStuck,
      ruptureCount: metrics.ruptureCount,
      opportunityCount: metrics.opportunityCount,
      topActions: metrics.topActions.map((action) => ({
        id: action.id,
        name: action.title,
        sku: action.sku ?? '',
        recommendations: action.recommendations,
        impactAmount: action.impactAmount,
        impactLabel: action.impactLabel,
        alertType: action.alertType,
        alertRisk: action.alertRisk,
      })),
      productCount,
      productLimit: null,
      lastSyncAt: null,
      syncStatus,
    };
  }

  async getIntegration(params: GetIntegrationParams): Promise<IntegrationConnection | null> {
    const { userId } = params;

    const integration = await prisma.shopeeIntegration.findUnique({
      where: { userId },
    });

    if (!integration) return null;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { shopeeSyncStatus: true },
    });

    if (!user) return null;

    const statusMap: Record<string, SyncStatus> = {
      IDLE: SyncStatus.IDLE,
      SYNCING: SyncStatus.SYNCING,
      COMPLETED: SyncStatus.COMPLETED,
      FAILED: SyncStatus.FAILED,
    };

    return {
      id: integration.id,
      userId: integration.userId,
      provider: IntegrationProvider.SHOPEE,
      isConnected: true,
      syncStatus: statusMap[user.shopeeSyncStatus] ?? SyncStatus.IDLE,
      lastSyncAt: null,
      createdAt: integration.connectedAt,
      updatedAt: integration.updatedAt,
    };
  }

  async disconnect(params: DisconnectParams): Promise<void> {
    const { userId } = params;

    await prisma.shopeeIntegration.delete({ where: { userId } });

    await prisma.user.update({
      where: { id: userId },
      data: { shopeeSyncStatus: 'IDLE' },
    });
  }

  async isConnected(params: IsConnectedParams): Promise<boolean> {
    const { userId } = params;
    const integration = await prisma.shopeeIntegration.findUnique({
      where: { userId },
      select: { id: true },
    });
    return integration !== null;
  }
}
