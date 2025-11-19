/** biome-ignore-all lint/style/noMagicNumbers: All constants are defined using descriptive names */

/**
 * Security and authentication related constants
 */
export const ONE_DAY_IN_SECONDS = 60 * 60 * 24;
export const THIRTY_MINUTES_IN_SECONDS = 1800;
export const LOCK_OUT_THRESHOLD = 5;
export const LOCK_OUT_DURATION_MINUTES = 15 * 60_000;
export const PASSWORD_RESET_TOKEN_BYTES = 32;
export const PASSWORD_RESET_TOKEN_EXPIRY = 60 * 60 * 1000;
export const API_KEY_EXPIRES_THRESHOLD = 30 * 24 * 60 * 60 * 1000;

/**
 * Application related constants
 */
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'NextJS Base';
export const APP_DESCRIPTION =
  process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
  'A starter template for Next.js applications with authentication and more.';
export const APP_LANGUAGE = process.env.NEXT_PUBLIC_APP_LANGUAGE || 'en';

/**
 * React Query related constants
 */
export const QUERY_STALE_TIME = 5 * 60_000; // 5 minutes
