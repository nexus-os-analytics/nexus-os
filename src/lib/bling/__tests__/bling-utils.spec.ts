import { describe, expect, it } from 'vitest';
import type { BlingProductData, BlingProductSettingsType } from '@/lib/bling/bling-types';
import { calculateAllMetrics, mapAlertTypeToPtLabel } from '@/lib/bling/bling-utils';

// Test expectation constants to avoid magic numbers in assertions
const EXPECT_MOUSE_VVD = 1.7;
const KEYBOARD_LAST_SALE_DAYS_AGO = 5;
const EXPECT_KEYBOARD_VVD = 0.65;
const EXPECT_KEYBOARD_DAYS_REMAINING_MIN = 15;
const EXPECT_KEYBOARD_DAYS_REMAINING_MAX = 16;
const WEBCAM_LAST_SALE_DAYS_AGO = 3;
const EXPECT_WEBCAM_VVD7 = 2.2;
const EXPECT_WEBCAM_VVD30 = 1.0;
const EXPECT_WEBCAM_GROWTH = 120;
const EXPECT_WEBCAM_DAYS_REMAINING = 20;
const CHAIR_LAST_SALE_DAYS_AGO = 96;
const EXPECT_CHAIR_DAYS_SINCE_MIN = 96;
const EXPECT_CHAIR_CAPITAL = 6500;
const CABLE_LAST_SALE_DAYS_AGO = 21;
const CABLE_STOCK_OUT_DAYS_AGO = 20;
const EXPECT_CABLE_VVD = 4.0;
const EXPECT_CABLE_DAYS_OUT_OF_STOCK_MIN = 20;
const EXPECT_CABLE_LOST_SALES_MIN = 80;
const SUPPORT_EXPECT_VVD = 0.1;
const SUPPORT_EXPECT_EXCESS_PERCENT = 200;
const SUPPORT_EXPECT_CAPITAL = 1360;

function daysAgo(n: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return d;
}

describe('Nexus Bling metrics expectations', () => {
  it('SKU 001 — Mouse Gamer RGB: RUPTURE, CRITICAL, VVD ~1.7, Days Remaining 0', () => {
    const product: BlingProductData = {
      totalSales: 17,
      daysWithSales: 10, // vvdReal = 1.7
      totalLast30DaysSales: 0,
      totalLast7DaysSales: 0,
      currentStock: 0, // daysRemaining = 0
      costPrice: 100,
      salePrice: 180,
      lastSaleDate: daysAgo(2),
      hasStockOut: false,
      stockOutDate: undefined,
    };

    const m = calculateAllMetrics(product, null);
    expect(m.vvdReal).toBeCloseTo(EXPECT_MOUSE_VVD, 1);
    expect(m.daysRemaining).toBe(0);
    expect(m.risk).toBe('CRITICAL');
    expect(m.type).toBe('RUPTURE');
    expect(mapAlertTypeToPtLabel(m.type)).toBe('RUPTURA');
  });

  it('SKU 002 — Teclado Mecânico: OBSERVE, LOW, VVD ~0.65, Days Remaining ~15', () => {
    const product: BlingProductData = {
      totalSales: 13,
      daysWithSales: 20, // vvdReal = 0.65
      totalLast30DaysSales: 0,
      totalLast7DaysSales: 0,
      currentStock: 10, // daysRemaining ~ 15.38
      costPrice: 200,
      salePrice: 350,
      lastSaleDate: daysAgo(KEYBOARD_LAST_SALE_DAYS_AGO),
      hasStockOut: false,
      stockOutDate: undefined,
    };
    const settings: Partial<BlingProductSettingsType> = {
      // Adjust thresholds so ~15 days maps to LOW risk for this scenario
      highDaysRemainingThreshold: 10,
      mediumDaysRemainingThreshold: 14,
    } as BlingProductSettingsType;

    const m = calculateAllMetrics(product, settings as BlingProductSettingsType);
    expect(m.vvdReal).toBeCloseTo(EXPECT_KEYBOARD_VVD, 2);
    expect(m.daysRemaining).toBeGreaterThanOrEqual(EXPECT_KEYBOARD_DAYS_REMAINING_MIN);
    expect(m.daysRemaining).toBeLessThanOrEqual(EXPECT_KEYBOARD_DAYS_REMAINING_MAX);
    expect(m.risk).toBe('LOW');
    expect(m.type).toBe('FINE');
    expect(mapAlertTypeToPtLabel(m.type)).toBe('OBSERVAR');
  });

  it('SKU 003 — Webcam HD: OPPORTUNITY, MEDIUM, Growth ~+120%', () => {
    const product: BlingProductData = {
      totalSales: 45,
      daysWithSales: 30, // vvdReal = 1.5 -> daysRemaining ~20 when stock=30
      totalLast30DaysSales: 30, // vvd30 = 30/30 = 1.0
      totalLast7DaysSales: 11, // with effective 5 days -> vvd7 = 2.2
      currentStock: 30, // daysRemaining = 20
      costPrice: 120,
      salePrice: 220,
      lastSaleDate: daysAgo(WEBCAM_LAST_SALE_DAYS_AGO),
      hasStockOut: false,
      stockOutDate: undefined,
      daysWithSalesWithinLast7: 5,
    };

    const m = calculateAllMetrics(product, null);
    expect(m.vvd7).toBeCloseTo(EXPECT_WEBCAM_VVD7, 1);
    expect(m.vvd30).toBeCloseTo(EXPECT_WEBCAM_VVD30, 1);
    // growth = ((2.2 - 1.0) / 1.0) * 100 = 120%
    expect(m.growthTrend).toBeCloseTo(EXPECT_WEBCAM_GROWTH, 0);
    expect(m.daysRemaining).toBeCloseTo(EXPECT_WEBCAM_DAYS_REMAINING, 0);
    expect(m.risk).toBe('MEDIUM');
    expect(m.type).toBe('OPPORTUNITY');
  });

  it('SKU 004 — Cadeira Gamer: STUCK_CAPITAL (DEAD_STOCK), VVD 0, Days Since Last Sale 96+, Capital ~R$ 6.500', () => {
    const product: BlingProductData = {
      totalSales: 0,
      daysWithSales: 0, // vvdReal = 0
      totalLast30DaysSales: 0,
      totalLast7DaysSales: 0,
      currentStock: 65,
      costPrice: 100, // capitalStuck = 6500
      salePrice: 400,
      lastSaleDate: daysAgo(CHAIR_LAST_SALE_DAYS_AGO),
      hasStockOut: false,
      stockOutDate: undefined,
    };

    const m = calculateAllMetrics(product, null);
    expect(m.vvdReal).toBe(0);
    expect(m.daysSinceLastSale).toBeGreaterThanOrEqual(EXPECT_CHAIR_DAYS_SINCE_MIN);
    expect(m.capitalStuck).toBeCloseTo(EXPECT_CHAIR_CAPITAL, 0);
    expect(m.type as unknown as string).toBe('DEAD_STOCK');
  });

  it('SKU 005 — Cabo USB-C: RUPTURE, CRITICAL, VVD ~4.0, Days Out of Stock ~20, Lost Sales 80+', () => {
    const product: BlingProductData = {
      totalSales: 40,
      daysWithSales: 10, // vvdReal = 4.0
      totalLast30DaysSales: 0,
      totalLast7DaysSales: 0,
      currentStock: 0, // trigger rupture risk
      costPrice: 20,
      salePrice: 45,
      lastSaleDate: daysAgo(CABLE_LAST_SALE_DAYS_AGO),
      hasStockOut: true,
      stockOutDate: daysAgo(CABLE_STOCK_OUT_DAYS_AGO), // daysOutOfStock ~20
    };

    const m = calculateAllMetrics(product, null);
    expect(m.vvdReal).toBeCloseTo(EXPECT_CABLE_VVD, 1);
    expect(m.daysOutOfStock).toBeGreaterThanOrEqual(EXPECT_CABLE_DAYS_OUT_OF_STOCK_MIN);
    expect(m.estimatedLostSales).toBeGreaterThanOrEqual(EXPECT_CABLE_LOST_SALES_MIN);
    expect(m.risk).toBe('CRITICAL');
    expect(m.type).toBe('RUPTURE');
  });

  it('SKU 006 — Suporte Monitor Duplo: LIQUIDATION, VVD ~0.1, Excesso ~200%, Capital parado ~R$ 1.360', () => {
    // vvdReal = 0.1 -> estimated cover = 0.1 * (15 + 5) = 2
    // currentStock = 6 -> excessUnits = 4 -> excess% = 200%
    // capitalStuck = 6 * 226.67 ~ 1,360
    const product: BlingProductData = {
      totalSales: 1,
      daysWithSales: 10, // vvdReal = 0.1
      totalLast30DaysSales: 2,
      totalLast7DaysSales: 1,
      currentStock: 6,
      costPrice: 226.67,
      salePrice: 320,
      lastSaleDate: daysAgo(10), // within 30 days to allow LIQUIDATION
      hasStockOut: false,
      stockOutDate: undefined,
    };
    const settings: Partial<BlingProductSettingsType> = {
      liquidationExcessCapitalThreshold: 800, // lower threshold to allow LIQUIDATION for ~R$906 excess capital
    } as BlingProductSettingsType;

    const m = calculateAllMetrics(product, settings as BlingProductSettingsType);
    expect(m.vvdReal).toBeCloseTo(SUPPORT_EXPECT_VVD, 2);
    expect(m.excessPercentage).toBeCloseTo(SUPPORT_EXPECT_EXCESS_PERCENT, 0);
    expect(m.capitalStuck).toBeCloseTo(SUPPORT_EXPECT_CAPITAL, 0);
    expect(m.type as unknown as string).toBe('LIQUIDATION');
    expect(mapAlertTypeToPtLabel(m.type)).toBe('LIQUIDAÇÃO');
  });
});
