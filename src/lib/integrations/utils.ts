/**
 * Integration utilities for managing OAuth flows, redirects, and sync status
 *
 * Shared helper functions for integration management across all providers.
 *
 * @module lib/integrations/utils
 */

import prisma from '@/lib/prisma';
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
    default:
      return null;
  }
}

// =============================================================================
// Sync Status Management
// =============================================================================

/**
 * Update user's sync status for a provider
 *
 * Uses Prisma to update the correct status field based on provider.
 *
 * @param userId - The user ID
 * @param provider - The integration provider
 * @param status - The new sync status
 * @returns Promise that resolves when update is complete
 *
 * @example
 * await updateSyncStatus('user123', IntegrationProvider.BLING, SyncStatus.SYNCING)
 */
export async function updateSyncStatus(
  userId: string,
  provider: IntegrationProvider,
  status: SyncStatus
): Promise<void> {
  const field = getSyncStatusField(provider);

  await prisma.user.update({
    where: { id: userId },
    data: {
      [field]: status,
    },
  });
}

/**
 * Get user's current sync status for a provider
 *
 * @param userId - The user ID
 * @param provider - The integration provider
 * @returns Promise resolving to the current sync status
 * @throws Error if user not found
 *
 * @example
 * const status = await getSyncStatus('user123', IntegrationProvider.BLING)
 */
export async function getSyncStatus(
  userId: string,
  provider: IntegrationProvider
): Promise<SyncStatus> {
  const field = getSyncStatusField(provider);

  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }

  // @ts-expect-error - Dynamic field access
  return user[field] as SyncStatus;
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
    default:
      // Exhaustive check
      const _exhaustive: never = provider;
      throw new Error(`Unknown provider: ${_exhaustive}`);
  }
}
