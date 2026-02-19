import type { BlingAlert } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import {
  calculateDiscountedPrice,
  calculateIncreasedPrice,
  getRecommendedDiscount,
  getRecommendedIncrease,
  getStrategyColor,
  getUrgencyColor,
  isValidDiscount,
  isValidIncrease,
} from '../recommendations';

function alert(overrides: Partial<BlingAlert>): BlingAlert {
  return {
    id: 'test-id',
    blingProductId: 'bp-1',
    type: 'FINE',
    risk: 'LOW',
    vvdReal: 1,
    vvd30: 1,
    vvd7: 1,
    daysRemaining: 0,
    reorderPoint: 0,
    growthTrend: 0,
    capitalStuck: 0,
    daysSinceLastSale: 0,
    suggestedPrice: 0,
    discount: 0,
    discountAmount: 0,
    estimatedDeadline: 0,
    recoverableAmount: 0,
    daysOutOfStock: 0,
    estimatedLostSales: 0,
    estimatedLostAmount: 0,
    idealStock: 0,
    excessUnits: 0,
    excessPercentage: 0,
    excessCapital: 0,
    message: null,
    recommendations: null,
    lastCriticalNotifiedAt: null,
    createdAt: new Date(),
    updatedAt: new Date(),
    jobId: null,
    ...overrides,
  } as BlingAlert;
}

const ORIGINAL_PRICE = 100;

describe('getRecommendedDiscount', () => {
  it('DEAD_STOCK 30-60 days: 30%, high urgency', () => {
    const result = getRecommendedDiscount(
      alert({ type: 'DEAD_STOCK', daysSinceLastSale: 45 }),
      ORIGINAL_PRICE
    );
    expect(result.percentage).toBe(30);
    expect(result.urgency).toBe('high');
    expect(result.finalPrice).toBe(70);
    expect(result.savings).toBe(30);
  });

  it('DEAD_STOCK 60-90 days: 35%, very-high urgency', () => {
    const result = getRecommendedDiscount(
      alert({ type: 'DEAD_STOCK', daysSinceLastSale: 75 }),
      ORIGINAL_PRICE
    );
    expect(result.percentage).toBe(35);
    expect(result.urgency).toBe('very-high');
    expect(result.finalPrice).toBe(65);
  });

  it('DEAD_STOCK 90+ days: 40%, critical urgency', () => {
    const result = getRecommendedDiscount(
      alert({ type: 'DEAD_STOCK', daysSinceLastSale: 100 }),
      ORIGINAL_PRICE
    );
    expect(result.percentage).toBe(40);
    expect(result.urgency).toBe('critical');
    expect(result.finalPrice).toBe(60);
  });

  it('DEAD_STOCK 365+ days: 40%, critical with never-sold reason', () => {
    const result = getRecommendedDiscount(
      alert({ type: 'DEAD_STOCK', daysSinceLastSale: 400 }),
      ORIGINAL_PRICE
    );
    expect(result.percentage).toBe(40);
    expect(result.reason).toContain('nunca vendeu');
  });

  it('LIQUIDATION 200-300% excess: 10%, moderate', () => {
    const result = getRecommendedDiscount(
      alert({ type: 'LIQUIDATION', excessPercentage: 250 }),
      ORIGINAL_PRICE
    );
    expect(result.percentage).toBe(10);
    expect(result.urgency).toBe('moderate');
    expect(result.finalPrice).toBe(90);
  });

  it('LIQUIDATION 300-500% excess: 15%, high', () => {
    const result = getRecommendedDiscount(
      alert({ type: 'LIQUIDATION', excessPercentage: 400 }),
      ORIGINAL_PRICE
    );
    expect(result.percentage).toBe(15);
    expect(result.urgency).toBe('high');
  });

  it('LIQUIDATION 500%+ excess: 20%, very-high', () => {
    const result = getRecommendedDiscount(
      alert({ type: 'LIQUIDATION', excessPercentage: 600 }),
      ORIGINAL_PRICE
    );
    expect(result.percentage).toBe(20);
    expect(result.urgency).toBe('very-high');
    expect(result.finalPrice).toBe(80);
  });
});

describe('getRecommendedIncrease', () => {
  it('OPPORTUNITY 50-100% growth: 10%, conservative', () => {
    const result = getRecommendedIncrease(
      alert({ type: 'OPPORTUNITY', growthTrend: 75 }),
      ORIGINAL_PRICE
    );
    expect(result.percentage).toBe(10);
    expect(result.strategy).toBe('conservative');
    expect(result.finalPrice).toBeCloseTo(110, 2);
    expect(result.gain).toBeCloseTo(10, 2);
  });

  it('OPPORTUNITY 100-150% growth: 15%, moderate', () => {
    const result = getRecommendedIncrease(
      alert({ type: 'OPPORTUNITY', growthTrend: 120 }),
      ORIGINAL_PRICE
    );
    expect(result.percentage).toBe(15);
    expect(result.strategy).toBe('moderate');
    expect(result.finalPrice).toBeCloseTo(115, 2);
  });

  it('OPPORTUNITY 150%+ growth: 20%, aggressive', () => {
    const result = getRecommendedIncrease(
      alert({ type: 'OPPORTUNITY', growthTrend: 180 }),
      ORIGINAL_PRICE
    );
    expect(result.percentage).toBe(20);
    expect(result.strategy).toBe('aggressive');
    expect(result.finalPrice).toBe(120);
  });

  it('fallback uses vvdReal when growth below 50%', () => {
    const result = getRecommendedIncrease(
      alert({ type: 'OPPORTUNITY', growthTrend: 20, vvdReal: 2.5 }),
      ORIGINAL_PRICE
    );
    expect(result.percentage).toBe(10);
    expect(result.reason).toContain('VVD');
  });
});

describe('isValidDiscount', () => {
  it('accepts 10 and 40 as boundaries', () => {
    expect(isValidDiscount(10)).toBe(true);
    expect(isValidDiscount(40)).toBe(true);
  });

  it('rejects below 10 and above 40', () => {
    expect(isValidDiscount(9)).toBe(false);
    expect(isValidDiscount(41)).toBe(false);
  });

  it('accepts value in range', () => {
    expect(isValidDiscount(25)).toBe(true);
  });
});

describe('isValidIncrease', () => {
  it('accepts 10 and 20 as boundaries', () => {
    expect(isValidIncrease(10)).toBe(true);
    expect(isValidIncrease(20)).toBe(true);
  });

  it('rejects below 10 and above 20', () => {
    expect(isValidIncrease(9)).toBe(false);
    expect(isValidIncrease(21)).toBe(false);
  });
});

describe('calculateDiscountedPrice', () => {
  it('applies discount percentage correctly', () => {
    expect(calculateDiscountedPrice(100, 20)).toBe(80);
    expect(calculateDiscountedPrice(200, 25)).toBe(150);
  });
});

describe('calculateIncreasedPrice', () => {
  it('applies increase percentage correctly', () => {
    expect(calculateIncreasedPrice(100, 10)).toBeCloseTo(110, 2);
    expect(calculateIncreasedPrice(100, 20)).toBeCloseTo(120, 2);
  });
});

describe('getUrgencyColor', () => {
  it('returns correct color for each urgency', () => {
    expect(getUrgencyColor('critical')).toBe('red');
    expect(getUrgencyColor('very-high')).toBe('orange');
    expect(getUrgencyColor('high')).toBe('yellow');
    expect(getUrgencyColor('moderate')).toBe('blue');
  });

  it('returns gray for unknown', () => {
    expect(getUrgencyColor('unknown' as 'moderate')).toBe('gray');
  });
});

describe('getStrategyColor', () => {
  it('returns correct color for each strategy', () => {
    expect(getStrategyColor('aggressive')).toBe('green');
    expect(getStrategyColor('moderate')).toBe('blue');
    expect(getStrategyColor('conservative')).toBe('gray');
  });

  it('returns gray for unknown', () => {
    expect(getStrategyColor('unknown' as 'conservative')).toBe('gray');
  });
});
