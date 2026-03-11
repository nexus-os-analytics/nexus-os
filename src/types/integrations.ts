/**
 * Generic integration types for ERPs and Marketplaces
 *
 * This module defines reusable types that can be shared across different
 * integration providers (Bling, Mercado Livre, etc.)
 *
 * @module types/integrations
 */

/**
 * Available integration providers
 * Add new providers here as they are implemented
 */
export enum IntegrationProvider {
  BLING = 'BLING',
  MERCADO_LIVRE = 'MERCADO_LIVRE',
  SHOPEE = 'SHOPEE',
  // Future integrations:
  // TINY = 'TINY',
  // OMIE = 'OMIE',
  // SHOPIFY = 'SHOPIFY',
  // B2W = 'B2W',
}

/**
 * Universal sync status states
 * All integrations follow this lifecycle
 */
export enum SyncStatus {
  /** Integration not connected or never synced */
  IDLE = 'IDLE',
  /** Sync in progress */
  SYNCING = 'SYNCING',
  /** Sync completed successfully */
  COMPLETED = 'COMPLETED',
  /** Sync failed or timed out */
  FAILED = 'FAILED',
}

/**
 * Generic integration metrics structure
 * All integrations should return data in this format
 */
export interface IntegrationMetrics {
  /** Total capital stuck in inventory (R$) */
  capitalStuck: number;
  /** Number of products at risk of stockout */
  ruptureCount: number;
  /** Number of growth opportunities identified */
  opportunityCount: number;
  /** Top priority actions to take */
  topActions: IntegrationTopAction[];
  /** Current product count (for plan limits) */
  productCount?: number;
  /** Maximum products allowed (null = unlimited) */
  productLimit?: number | null;
  /** Last successful sync timestamp */
  lastSyncAt?: Date | null;
  /** Current sync status */
  syncStatus: SyncStatus;
}

/**
 * Generic top action item
 * Represents a prioritized action for a product
 */
export interface IntegrationTopAction {
  /** Unique product identifier */
  id: string;
  /** Product name */
  name: string;
  /** Product SKU */
  sku: string;
  /** Action recommendations */
  recommendations: string | null;
  /** Monetary impact amount */
  impactAmount?: number;
  /** Impact label (e.g., "Capital parado", "Capital em excesso") */
  impactLabel?: string;
  /** Alert type (FINE, RUPTURE, DEAD_STOCK, etc.) */
  alertType?: string;
  /** Risk level (LOW, MEDIUM, HIGH, CRITICAL) */
  alertRisk?: string;
}

/**
 * Generic integration connection info
 * Represents the connection status and metadata
 */
export interface IntegrationConnection {
  /** Integration record ID */
  id: string;
  /** User who owns this integration */
  userId: string;
  /** Provider type */
  provider: IntegrationProvider;
  /** Whether the integration is currently connected */
  isConnected: boolean;
  /** Current sync status */
  syncStatus: SyncStatus;
  /** Last successful sync timestamp */
  lastSyncAt: Date | null;
  /** Integration created timestamp */
  createdAt: Date;
  /** Integration last updated timestamp */
  updatedAt: Date;
}

/**
 * Success query param values for OAuth redirects
 */
export type IntegrationSuccessParam = 'bling_connected' | 'meli_connected' | 'shopee_connected';

/**
 * Error query param values for OAuth redirects
 */
export type IntegrationErrorParam =
  | 'auth_failed'
  | 'invalid_callback'
  | 'unauthorized'
  | 'connection_failed'
  | 'token_exchange_failed'
  | 'config_missing';

/**
 * Type guard to check if a value is a valid IntegrationProvider
 */
export function isIntegrationProvider(value: unknown): value is IntegrationProvider {
  return (
    typeof value === 'string' &&
    Object.values(IntegrationProvider).includes(value as IntegrationProvider)
  );
}

/**
 * Type guard to check if a value is a valid SyncStatus
 */
export function isSyncStatus(value: unknown): value is SyncStatus {
  return typeof value === 'string' && Object.values(SyncStatus).includes(value as SyncStatus);
}

/**
 * Get all provider values as an array
 */
export function getAllProviders(): IntegrationProvider[] {
  return Object.values(IntegrationProvider);
}

/**
 * Get all sync status values as an array
 */
export function getAllSyncStatuses(): SyncStatus[] {
  return Object.values(SyncStatus);
}
