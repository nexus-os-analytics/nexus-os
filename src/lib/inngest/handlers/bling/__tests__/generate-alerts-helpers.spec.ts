import { describe, expect, it } from 'vitest';
import {
  getDaysWithSalesWithinWindow,
  inferStockOutDate,
  resolveCurrentStock,
} from '../generate-alerts.utils';

function dateDaysAgo(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

describe('resolveCurrentStock', () => {
  it('returns productStock when balance is older than last sale', () => {
    const lastSale = dateDaysAgo(2);
    const balanceUpdated = dateDaysAgo(5);
    expect(
      resolveCurrentStock(10, 8, balanceUpdated, lastSale)
    ).toBe(10);
  });

  it('returns stockBalanceStock when balance is newer than last sale', () => {
    const lastSale = dateDaysAgo(5);
    const balanceUpdated = dateDaysAgo(1);
    expect(
      resolveCurrentStock(10, 7, balanceUpdated, lastSale)
    ).toBe(7);
  });

  it('falls back to productStock when stockBalanceStock is null', () => {
    const lastSale = dateDaysAgo(5);
    const balanceUpdated = dateDaysAgo(1);
    expect(
      resolveCurrentStock(12, null, balanceUpdated, lastSale)
    ).toBe(12);
  });

  it('returns 0 when balance is older and productStock is null', () => {
    const lastSale = dateDaysAgo(2);
    const balanceUpdated = dateDaysAgo(5);
    expect(
      resolveCurrentStock(null, 8, balanceUpdated, lastSale)
    ).toBe(0);
  });
});

describe('getDaysWithSalesWithinWindow', () => {
  it('counts unique calendar days with sales within window', () => {
    const today = new Date();
    const sales = [
      { date: new Date(today) },
      { date: new Date(today) },
      { date: dateDaysAgo(1) },
      { date: dateDaysAgo(2) },
    ];
    expect(getDaysWithSalesWithinWindow(sales, 7)).toBe(3);
  });

  it('excludes sales outside window', () => {
    const sales = [
      { date: dateDaysAgo(1) },
      { date: dateDaysAgo(10) },
    ];
    expect(getDaysWithSalesWithinWindow(sales, 7)).toBe(1);
  });

  it('returns 0 for empty sales', () => {
    expect(getDaysWithSalesWithinWindow([], 30)).toBe(0);
  });
});

describe('inferStockOutDate', () => {
  it('returns undefined when hasStockOut is false', () => {
    expect(
      inferStockOutDate(false, 0, new Date(), new Date())
    ).toBeUndefined();
  });

  it('returns stockBalanceUpdatedAt when stock is 0 and updatedAt present', () => {
    const updatedAt = dateDaysAgo(3);
    const result = inferStockOutDate(true, 0, updatedAt, dateDaysAgo(1));
    expect(result).toBeInstanceOf(Date);
    expect(result!.toISOString()).toBe(new Date(updatedAt).toISOString());
  });

  it('returns lastSaleDate when hasStockOut and no balance date', () => {
    const lastSale = dateDaysAgo(5);
    const result = inferStockOutDate(true, 0, null, lastSale);
    expect(result).toBeInstanceOf(Date);
    expect(result!.toISOString()).toBe(new Date(lastSale).toISOString());
  });

  it('returns undefined when hasStockOut but lastSaleDate is null', () => {
    const result = inferStockOutDate(true, 0, null, null);
    expect(result).toBeUndefined();
  });
});
