/**
 * Mercado Livre utility functions.
 *
 * NOTE: The metrics engine will be extracted to a shared location
 * (src/lib/integrations/metrics-engine.ts) in a future iteration to avoid
 * duplication with Bling's implementation.
 *
 * For now, this file serves as a placeholder for ML-specific utilities.
 */

/**
 * Format Mercado Livre item ID (MLBxxxxxxxx format)
 */
export function formatMeliItemId(itemId: string): string {
  return itemId.toUpperCase();
}

/**
 * Extract seller ID from Mercado Livre user ID
 */
export function extractSellerId(meliUserId: string): number {
  return parseInt(meliUserId, 10);
}

/**
 * Validate Mercado Livre scope permissions
 */
export function hasRequiredScope(scope: string): boolean {
  const requiredScopes = ['read', 'write'];
  const scopes = scope.split(' ');
  return requiredScopes.every((required) => scopes.includes(required));
}
