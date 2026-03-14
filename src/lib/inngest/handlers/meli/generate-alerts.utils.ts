/**
 * Pure helpers for generate-alerts handler.
 * Exported for unit testing with predictable inputs.
 */

export function resolveCurrentStock(
  productStock: number | null | undefined,
  stockBalanceStock: number | null | undefined,
  stockBalanceUpdatedAt: Date | string | null | undefined,
  lastSaleDate: Date | null
): number {
  const balanceIsOlderThanLastSale = Boolean(
    stockBalanceUpdatedAt &&
    lastSaleDate &&
    new Date(stockBalanceUpdatedAt).getTime() < new Date(lastSaleDate).getTime()
  );
  if (balanceIsOlderThanLastSale) return productStock ?? 0;
  return stockBalanceStock ?? productStock ?? 0;
}

export function getDaysWithSalesWithinWindow(
  sales: { date: Date | string }[],
  days: number
): number {
  const now = new Date();
  const cutoff = new Date(now);
  cutoff.setDate(now.getDate() - days);
  const uniqueDays = new Set(
    sales
      .filter((s) => new Date(s.date) >= cutoff)
      .map((s) => new Date(s.date).toISOString().split('T')[0])
  );
  return uniqueDays.size;
}

export function inferStockOutDate(
  hasStockOut: boolean,
  stockBalanceStock: number | null | undefined,
  stockBalanceUpdatedAt: Date | string | null | undefined,
  lastSaleDate: Date | null
): Date | undefined {
  if (!hasStockOut) return undefined;
  if (stockBalanceStock === 0 && stockBalanceUpdatedAt) return new Date(stockBalanceUpdatedAt);
  return lastSaleDate ?? undefined;
}
