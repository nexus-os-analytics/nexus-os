import { PlanTier } from '@prisma/client';
import { describe, expect, it } from 'vitest';
import {
  getPlanEntitlements,
  getPlanFeatureStrings,
  getPlanLimits,
} from '../entitlements';

describe('getPlanEntitlements', () => {
  it('FREE: productLimit 30, sync every 24h, manual not allowed', () => {
    const e = getPlanEntitlements(PlanTier.FREE);
    expect(e.productLimit).toBe(30);
    expect(e.sync.autoIntervalHours).toBe(24);
    expect(e.sync.manualAllowed).toBe(false);
    expect(e.sync.description).toContain('uma vez por dia');
    expect(e.alerts.criticalEmail).toBe(true);
    expect(e.support.channel).toBe('email');
    expect(e.support.priority).toBe(false);
  });

  it('PRO: productLimit unlimited, sync every 1h, manual allowed', () => {
    const e = getPlanEntitlements(PlanTier.PRO);
    expect(e.productLimit).toBe('unlimited');
    expect(e.sync.autoIntervalHours).toBe(1);
    expect(e.sync.manualAllowed).toBe(true);
    expect(e.sync.description).toContain('hora');
    expect(e.support.channel).toBe('whatsapp');
    expect(e.support.priority).toBe(true);
  });
});

describe('getPlanFeatureStrings', () => {
  it('FREE returns array with product limit and feature descriptions', () => {
    const strings = getPlanFeatureStrings(PlanTier.FREE);
    expect(strings).toHaveLength(4);
    expect(strings[0]).toContain('30');
    expect(strings[0]).not.toContain('ilimitados');
    expect(strings.some((s) => s.includes('sincronização'))).toBe(true);
  });

  it('PRO returns array with unlimited products text', () => {
    const strings = getPlanFeatureStrings(PlanTier.PRO);
    expect(strings[0]).toBe('Produtos ilimitados');
  });
});

describe('getPlanLimits', () => {
  it('FREE returns { products: 30 }', () => {
    expect(getPlanLimits(PlanTier.FREE)).toEqual({ products: 30 });
  });

  it('PRO returns { products: "unlimited" }', () => {
    expect(getPlanLimits(PlanTier.PRO)).toEqual({ products: 'unlimited' });
  });
});
