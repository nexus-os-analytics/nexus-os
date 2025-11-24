import { BlingRuptureRisk } from '@prisma/client';
import type { Product, SalesHistory } from './bling-types';

/**
 * Calculate idle days since last sale
 * @param lastSaleDate - ISO date string of last sale
 * @returns Number of idle days
 */
export function calculateIdleDays(lastSaleDate: string): number {
  const last = new Date(lastSaleDate);
  const now = new Date();
  const diff = now.getTime() - last.getTime();
  return Math.floor(diff / (1000 * 60 * 60 * 24));
}

/**
 * Calculate capital stuck in inventory
 * Fallback: if costPrice is missing or zero, fall back to an estimated cost
 * using salePrice * 0.6. This avoids showing 0
 * when cost data is not available, and makes the engine still usable.
 * @param stock - Current stock level
 * @param costPrice - Cost price per unit
 * @param salePrice - Sale price per unit (optional)
 * @returns Total capital stuck in inventory
 */
export function calculateCapitalStuck(
  stock: number,
  costPrice: number,
  salePrice?: number
): number {
  if (typeof stock !== 'number' || stock <= 0) return 0;

  let effectiveCost = 0;
  if (typeof costPrice === 'number' && costPrice > 0) {
    effectiveCost = costPrice;
  } else if (typeof salePrice === 'number' && salePrice > 0) {
    effectiveCost = salePrice * 0.6;
  }

  return stock * effectiveCost;
}

/**
 * Calculate average daily sales based on history, using distinct sold days.
 * Safer than using first/last indexes because input may not be sorted and may contain
 * multiple entries per day. Returns 0 if no sales days.
 * @param salesHistory - Array of sales history records
 * @returns Average daily sales
 */
export function calculateDailyAverage(salesHistory: SalesHistory[]): number {
  if (!salesHistory || salesHistory.length === 0) return 0;

  // Count distinct days with sales
  const uniqueDays = new Set<string>();
  let totalQty = 0;
  for (const s of salesHistory) {
    uniqueDays.add(isoDateToDayString(s.date));
    totalQty += s.quantity ?? 0;
  }

  const daysWithSales = uniqueDays.size;
  if (daysWithSales === 0) return 0;

  return totalQty / daysWithSales;
}

/**
 * Calculates the number of days the current stock will last based on the average daily sales.
 * When dailyAverage <= 0 we return Infinity (stock will not run out at current measured rate),
 * instead of 0 which is misleading.
 * @param stock - The current stock level.
 * @param dailyAverage - The average number of units sold per day.
 * @returns The number of days the stock will cover. Returns `0` if the daily average is zero or less.
 */
export function calculateStockCoverageDays(stock: number, dailyAverage: number): number {
  if (dailyAverage <= 0) return Infinity;
  return stock / dailyAverage;
}

/**
 * Calculate stock turnover (how many times stock is sold and replaced)
 * @param monthlyAvgSales - Average sales per month
 * @param stock - Current stock level
 * @returns Stock turnover ratio
 */
export function calculateStockTurnover(monthlyAvgSales: number, stock: number): number {
  if (stock <= 0) return 0;
  return monthlyAvgSales / stock;
}

/**
 * Calculates the trend score based on sales history.
 * @param history - Sales history
 * @returns Trend score (0 if not enough data)
 */
export function calculateTrend(history: SalesHistory[]): number {
  if (!history || history.length < 14) return 0;

  const last7 = history.slice(-7).reduce((acc, s) => acc + s.quantity, 0);
  const prev7 = history.slice(-14, -7).reduce((acc, s) => acc + s.quantity, 0);

  if (prev7 <= 0) return last7 > 0 ? 1 : 0;

  return (last7 - prev7) / prev7;
}

/**
 * Converts an ISO date string to a day string (YYYY-MM-DD).
 * @param iso - ISO date string
 * @returns Day string (YYYY-MM-DD)
 */
export function isoDateToDayString(iso: string) {
  return iso.split('T')[0]; // "YYYY-MM-DD"
}

/**
 * Calculates the date string for a specific number of days ago.
 * @param days - Number of days ago
 * @returns Date string (YYYY-MM-DD)
 */
export function daysAgoDate(days: number) {
  const d = new Date();
  d.setUTCDate(d.getUTCDate() - days);
  return d.toISOString().split('T')[0];
}

/**
 * Filter sales history to be within [startDate, endDate] inclusive.
 * Dates are "YYYY-MM-DD" strings or ISO timestamps.
 * @param history - Sales history
 * @param startDate - Start date (YYYY-MM-DD)
 * @param endDate - End date (YYYY-MM-DD)
 * @returns Filtered sales history
 */
export function filterHistoryInRange(history: SalesHistory[], startDate: string, endDate: string) {
  const start = new Date(startDate);
  const end = new Date(endDate);
  return history.filter((h) => {
    const d = new Date(h.date);
    return d >= start && d <= end;
  });
}

/**
 * Sums the quantities in the sales history.
 * @param history - Sales history
 * @returns Total quantity sold
 */
export function sumQuantity(history: SalesHistory[]) {
  return history.reduce((s, h) => s + (h.quantity ?? 0), 0);
}

/**
 * Counts the distinct days with sales in the history array (day granularity).
 * @param history - Sales history
 * @returns Number of distinct sales days
 */
export function distinctSalesDays(history: SalesHistory[]) {
  const set = new Set<string>();
  for (const h of history) {
    set.add(isoDateToDayString(h.date));
  }
  return set.size;
}

/**
 * Computes the VVD (Vendas por Dia) for a given sales history.
 * @param history - Sales history
 * @returns VVD value
 */
export function computeVVD(history: SalesHistory[]) {
  const days = distinctSalesDays(history);
  if (days === 0) return 0;
  const total = sumQuantity(history);
  return total / days;
}

/**
 * Safely compute last sale date of product from lastSaleDate field or history
 * returns null if none.
 * @param product - Product object
 * @param history - Sales history
 * @returns Last sale date string or null
 */
export function computeLastSaleDate(product: Product, history: SalesHistory[]) {
  if (product.lastSaleDate) return product.lastSaleDate;
  if (history && history.length > 0) {
    // find latest date in history
    const latest = history.reduce((a, b) => (new Date(a.date) > new Date(b.date) ? a : b));
    return latest.date;
  }
  return null;
}

/**
 * Classify rupture risk using coverage days
 * @param stockCoverageDays - Number of stock coverage days
 * @returns Rupture risk level
 */
export function classifyRuptureRisk(stockCoverageDays: number): BlingRuptureRisk {
  if (!isFinite(stockCoverageDays)) return BlingRuptureRisk.LOW;
  if (stockCoverageDays <= 5) return BlingRuptureRisk.CRITICAL;
  if (stockCoverageDays <= 10) return BlingRuptureRisk.HIGH;
  if (stockCoverageDays <= 20) return BlingRuptureRisk.MEDIUM;
  return BlingRuptureRisk.LOW;
}
