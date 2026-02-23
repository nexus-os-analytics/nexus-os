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
export const APP_NAME = process.env.NEXT_PUBLIC_APP_NAME || 'Nexus OS';
export const APP_DESCRIPTION =
  process.env.NEXT_PUBLIC_APP_DESCRIPTION ||
  'Plataforma inteligente que conecta dados do Bling ERP para otimizar estoque, reduzir rupturas e destravar capital.';
export const APP_LANGUAGE = process.env.NEXT_PUBLIC_APP_LANGUAGE || 'pt-BR';
export const APP_URL = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
export const APP_MANUAL_URL =
  process.env.NEXT_PUBLIC_APP_MANUAL_URL || 'https://app.nexusos.com.br/manual';
export const APP_VIDEO_URL =
  process.env.NEXT_PUBLIC_APP_VIDEO_URL || 'https://youtu.be/nexus-os-demo';

/**
 * PIX manual payment related constants
 */
export const PIX_KEY = process.env.PIX_KEY;
export const PIX_MERCHANT_NAME = process.env.PIX_MERCHANT_NAME ?? 'Nexus OS';
export const PIX_MERCHANT_CITY = process.env.PIX_MERCHANT_CITY ?? 'Sao Paulo';
export const PIX_PRO_AMOUNT_BRL = Number(process.env.PIX_PRO_AMOUNT_BRL ?? '97');
export const PIX_PAYMENTS_EMAIL =
  process.env.PIX_PAYMENTS_EMAIL ?? process.env.CONTACT_EMAIL ?? 'pagamentos@nexusos.com.br';

/**
 * React Query related constants
 */
export const QUERY_STALE_TIME = 5 * 60_000; // 5 minutes
/**
 * Alert type configuration and colors
 */
export * from './alert-config';
