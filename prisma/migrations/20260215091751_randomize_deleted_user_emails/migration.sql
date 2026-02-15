-- Migration: Randomize email for users with deletedAt set
-- Purpose: Update historical soft-deleted users to use randomized email format
--          This allows the original emails to be reused by new users
-- Format: deleted-<timestamp>-<shortId>@removed.local
-- Note: This migration is idempotent and can be run multiple times safely

-- Update all users where deletedAt is not null and email doesn't already follow the pattern
UPDATE users
SET email = CONCAT(
  'deleted-',
  EXTRACT(EPOCH FROM "deletedAt")::bigint * 1000,
  '-',
  SUBSTRING(id, 1, 8),
  '@removed.local'
)
WHERE "deletedAt" IS NOT NULL
  AND email NOT LIKE 'deleted-%@removed.local';
