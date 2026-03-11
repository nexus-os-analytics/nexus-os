/**
 * Base integration service interface
 *
 * All integration services (Bling, Meli, future ERPs/Marketplaces) must implement
 * this interface to ensure consistency across the application.
 *
 * @module lib/integrations/base-integration
 */

import {
  type IntegrationConnection,
  type IntegrationMetrics,
  IntegrationProvider,
} from '@/types/integrations';

/**
 * Parameters for getting integration metrics
 */
export interface GetMetricsParams {
  /** User ID to fetch metrics for */
  userId: string;
  /** Optional integration ID (can be inferred from userId if not provided) */
  integrationId?: string;
}

/**
 * Parameters for getting integration details
 */
export interface GetIntegrationParams {
  /** User ID to fetch integration for */
  userId: string;
}

/**
 * Parameters for disconnecting an integration
 */
export interface DisconnectParams {
  /** User ID to disconnect */
  userId: string;
}

/**
 * Parameters for checking if integration is connected
 */
export interface IsConnectedParams {
  /** User ID to check */
  userId: string;
}

/**
 * Core interface that all integration services must implement
 *
 * This ensures a consistent API across different integration providers.
 * Each provider (Bling, Meli, etc.) should implement this interface.
 *
 * @example
 * ```typescript
 * class BlingMetricsService implements IIntegrationService {
 *   async getMetrics(params: GetMetricsParams): Promise<IntegrationMetrics> {
 *     // Implementation
 *   }
 *   // ... other methods
 * }
 * ```
 */
export interface IIntegrationService {
  /**
   * Get overview metrics for the integration
   *
   * Returns aggregated metrics like capital stuck, rupture count,
   * opportunities, and top priority actions.
   *
   * @param params - Parameters including userId and optional integrationId
   * @returns Promise resolving to integration metrics
   * @throws Error if integration not found or metrics unavailable
   */
  getMetrics(params: GetMetricsParams): Promise<IntegrationMetrics>;

  /**
   * Get integration connection details
   *
   * Returns information about the integration connection status,
   * sync status, and metadata.
   *
   * @param params - Parameters including userId
   * @returns Promise resolving to integration connection or null if not found
   */
  getIntegration(params: GetIntegrationParams): Promise<IntegrationConnection | null>;

  /**
   * Disconnect and remove the integration
   *
   * Removes OAuth tokens, stops syncs, and marks integration as disconnected.
   * This is typically a soft delete that preserves historical data.
   *
   * @param params - Parameters including userId
   * @returns Promise resolving when disconnect is complete
   * @throws Error if disconnect fails
   */
  disconnect(params: DisconnectParams): Promise<void>;

  /**
   * Check if user has an active integration connection
   *
   * Simple boolean check for whether the integration is connected
   * and has valid credentials.
   *
   * @param params - Parameters including userId
   * @returns Promise resolving to true if connected, false otherwise
   */
  isConnected(params: IsConnectedParams): Promise<boolean>;
}

/**
 * Abstract base class for integration services
 *
 * Provides common functionality and enforces the IIntegrationService interface.
 * Concrete implementations should extend this class.
 *
 * @example
 * ```typescript
 * export class BlingMetricsService extends BaseIntegrationService {
 *   constructor() {
 *     super(IntegrationProvider.BLING);
 *   }
 *
 *   async getMetrics(params: GetMetricsParams): Promise<IntegrationMetrics> {
 *     // Implementation
 *   }
 *   // ... other methods
 * }
 * ```
 */
export abstract class BaseIntegrationService implements IIntegrationService {
  protected readonly provider: IntegrationProvider;

  constructor(provider: IntegrationProvider) {
    this.provider = provider;
  }

  /**
   * Get the provider type for this service
   */
  getProvider(): IntegrationProvider {
    return this.provider;
  }

  // Abstract methods that must be implemented by subclasses
  abstract getMetrics(params: GetMetricsParams): Promise<IntegrationMetrics>;
  abstract getIntegration(params: GetIntegrationParams): Promise<IntegrationConnection | null>;
  abstract disconnect(params: DisconnectParams): Promise<void>;
  abstract isConnected(params: IsConnectedParams): Promise<boolean>;
}

/**
 * Factory function to create an integration service instance
 *
 * @param provider - The integration provider to create a service for
 * @returns An instance of the appropriate integration service
 * @throws Error if provider is not supported
 *
 * @example
 * ```typescript
 * const service = createIntegrationService(IntegrationProvider.BLING);
 * const metrics = await service.getMetrics({ userId: '123' });
 * ```
 */
export function createIntegrationService(provider: IntegrationProvider): IIntegrationService {
  switch (provider) {
    case IntegrationProvider.BLING:
      // Lazy import to avoid circular dependencies
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { BlingMetricsService } = require('@/lib/bling/bling-metrics');
      return new BlingMetricsService();

    case IntegrationProvider.MERCADO_LIVRE:
      // eslint-disable-next-line @typescript-eslint/no-var-requires
      const { MeliMetricsService } = require('@/lib/mercado-livre/meli-metrics');
      return new MeliMetricsService();

    default:
      // Exhaustive check
      const _exhaustive: never = provider;
      throw new Error(`Unsupported integration provider: ${_exhaustive}`);
  }
}
