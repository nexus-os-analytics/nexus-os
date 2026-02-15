/**
 * Generates a randomized email address for soft-deleted users.
 * 
 * Format: deleted-<timestamp>-<shortId>@removed.local
 * 
 * @param userId - The UUID of the user being deleted
 * @returns A unique email address following the pattern:
 *          `deleted-<timestamp>-<shortId>@removed.local`
 *          where timestamp is Unix time in milliseconds and shortId is
 *          the first 8 characters of the user's UUID
 * 
 * @example
 * ```typescript
 * generateDeletedEmail('a1b2c3d4-e5f6-7890-abcd-ef1234567890')
 * // Returns: 'deleted-1739587200000-a1b2c3d4@removed.local'
 * ```
 */
export function generateDeletedEmail(userId: string): string {
  const timestamp = Date.now();
  const shortId = userId.slice(0, 8);
  return `deleted-${timestamp}-${shortId}@removed.local`;
}
