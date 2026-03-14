/**
 * Integration utilities for managing OAuth flows, redirects, and sync status
 *
 * Shared helper functions for integration management across all providers.
 *
 * @module lib/integrations/utils
 */

import {
  IntegrationProvider,
  type IntegrationErrorParam,
  type IntegrationSuccessParam,
  SyncStatus,
} from '@/types/integrations';

// =============================================================================
// URL Generation Functions
// =============================================================================

/**
 * Get the overview page URL for a provider
 *
 * @param provider - The integration provider
 * @returns The overview page path
 *
 * @example
 * getIntegrationOverviewUrl(IntegrationProvider.BLING) // → '/bling'
 */
export function getIntegrationOverviewUrl(provider: IntegrationProvider): string {
  switch (provider) {
    case IntegrationProvider.BLING:
      return '/bling';
    case IntegrationProvider.MERCADO_LIVRE:
      return '/mercado-livre';
    case IntegrationProvider.SHOPEE:
      return '/shopee';
    default:
      // Exhaustive check
      const _exhaustive: never = provider;
      throw new Error(`Unknown provider: ${_exhaustive}`);
  }
}

/**
 * Get the success redirect URL after OAuth
 *
 * @param provider - The integration provider
 * @returns The full redirect URL with success parameter
 *
 * @example
 * getIntegrationSuccessRedirect(IntegrationProvider.BLING)
 * // → '/bling?success=bling_connected'
 */
export function getIntegrationSuccessRedirect(provider: IntegrationProvider): string {
  const baseUrl = getIntegrationOverviewUrl(provider);
  const successParam = getSuccessParam(provider);
  return `${baseUrl}?success=${successParam}`;
}

/**
 * Get the error redirect URL
 *
 * @param provider - The integration provider
 * @param error - The error type
 * @returns The full redirect URL with error parameter
 *
 * @example
 * getIntegrationErrorRedirect(IntegrationProvider.BLING, 'auth_failed')
 * // → '/bling?error=auth_failed'
 */
export function getIntegrationErrorRedirect(
  provider: IntegrationProvider,
  error: IntegrationErrorParam
): string {
  const baseUrl = getIntegrationOverviewUrl(provider);
  return `${baseUrl}?error=${error}`;
}

// =============================================================================
// Success Param Helpers
// =============================================================================

/**
 * Get the success query param value for a provider
 *
 * @param provider - The integration provider
 * @returns The success parameter value
 *
 * @example
 * getSuccessParam(IntegrationProvider.BLING) // → 'bling_connected'
 */
export function getSuccessParam(provider: IntegrationProvider): IntegrationSuccessParam {
  switch (provider) {
    case IntegrationProvider.BLING:
      return 'bling_connected';
    case IntegrationProvider.MERCADO_LIVRE:
      return 'meli_connected';
    case IntegrationProvider.SHOPEE:
      return 'shopee_connected';
    default:
      // Exhaustive check
      const _exhaustive: never = provider;
      throw new Error(`Unknown provider: ${_exhaustive}`);
  }
}

/**
 * Parse success param from URL
 *
 * @param param - The success parameter value
 * @returns The integration provider or null if invalid
 *
 * @example
 * parseSuccessParam('bling_connected') // → IntegrationProvider.BLING
 */
export function parseSuccessParam(param: string): IntegrationProvider | null {
  switch (param) {
    case 'bling_connected':
      return IntegrationProvider.BLING;
    case 'meli_connected':
      return IntegrationProvider.MERCADO_LIVRE;
    case 'shopee_connected':
      return IntegrationProvider.SHOPEE;
    default:
      return null;
  }
}

// =============================================================================
// Provider Mapping Helpers
// =============================================================================

/**
 * Get the Prisma field name for a provider's sync status
 *
 * @param provider - The integration provider
 * @returns The Prisma field name for sync status
 *
 * @example
 * getSyncStatusField(IntegrationProvider.BLING) // → 'blingSyncStatus'
 */
export function getSyncStatusField(provider: IntegrationProvider): string {
  switch (provider) {
    case IntegrationProvider.BLING:
      return 'blingSyncStatus';
    case IntegrationProvider.MERCADO_LIVRE:
      return 'meliSyncStatus';
    case IntegrationProvider.SHOPEE:
      return 'shopeeSyncStatus';
    default:
      // Exhaustive check
      const _exhaustive: never = provider;
      throw new Error(`Unknown provider: ${_exhaustive}`);
  }
}

/**
 * Get the display name for a provider
 *
 * @param provider - The integration provider
 * @returns The human-readable display name
 *
 * @example
 * getProviderDisplayName(IntegrationProvider.BLING) // → 'Bling'
 */
export function getProviderDisplayName(provider: IntegrationProvider): string {
  switch (provider) {
    case IntegrationProvider.BLING:
      return 'Bling';
    case IntegrationProvider.MERCADO_LIVRE:
      return 'Mercado Livre';
    case IntegrationProvider.SHOPEE:
      return 'Shopee';
    default:
      // Exhaustive check
      const _exhaustive: never = provider;
      throw new Error(`Unknown provider: ${_exhaustive}`);
  }
}

// =============================================================================
// Event Name Helpers for Inngest
// =============================================================================

/**
 * Get the Inngest event name for user sync
 *
 * @param provider - The integration provider
 * @returns The Inngest event name
 *
 * @example
 * getSyncUserEventName(IntegrationProvider.BLING) // → 'bling/sync:user'
 */
export function getSyncUserEventName(provider: IntegrationProvider): string {
  switch (provider) {
    case IntegrationProvider.BLING:
      return 'bling/sync:user';
    case IntegrationProvider.MERCADO_LIVRE:
      return 'meli/sync:user';
    case IntegrationProvider.SHOPEE:
      return 'shopee/sync:user';
    default:
      // Exhaustive check
      const _exhaustive: never = provider;
      throw new Error(`Unknown provider: ${_exhaustive}`);
  }
}

/**
 * Get the Inngest event name for sync completion
 *
 * @param provider - The integration provider
 * @returns The Inngest completion event name
 *
 * @example
 * getSyncCompleteEventName(IntegrationProvider.BLING) // → 'bling/sync:complete'
 */
export function getSyncCompleteEventName(provider: IntegrationProvider): string {
  switch (provider) {
    case IntegrationProvider.BLING:
      return 'bling/sync:complete';
    case IntegrationProvider.MERCADO_LIVRE:
      return 'meli/sync:complete';
    case IntegrationProvider.SHOPEE:
      return 'shopee/sync:complete';
    default:
      // Exhaustive check
      const _exhaustive: never = provider;
      throw new Error(`Unknown provider: ${_exhaustive}`);
  }
}
