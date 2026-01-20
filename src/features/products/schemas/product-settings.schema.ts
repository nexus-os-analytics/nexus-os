import { z } from 'zod';

// Threshold constants
const LEAD_TIME_MIN = 1;
const LEAD_TIME_MAX = 90;
const SAFETY_DAYS_MIN = 0;
const SAFETY_DAYS_MAX = 30;
const CRITICAL_DAYS_MIN = 1;
const CRITICAL_DAYS_MAX = 30;
const HIGH_DAYS_MIN = 1;
const HIGH_DAYS_MAX = 30;
const MEDIUM_DAYS_MIN = 1;
const MEDIUM_DAYS_MAX = 60;
const OPPORTUNITY_DEMAND_MIN = 0;
const OPPORTUNITY_DEMAND_MAX = 20;
const COST_FACTOR_MIN = 0.1;
const COST_FACTOR_MAX = 3;

export function toNumber(value: unknown): number {
  if (typeof value === 'number') return value;
  if (typeof value === 'string') {
    const normalized = value.replace(/[^0-9,.-]/g, '').replace(',', '.');
    const n = Number(normalized);
    if (!Number.isFinite(n)) throw new Error('Valor numérico inválido');
    return n;
  }
  throw new Error('Valor numérico inválido');
}

const intField = (min: number, max: number) =>
  z.preprocess((v) => Math.trunc(toNumber(v)), z.number().int().min(min).max(max));

const floatField = (min: number, max?: number) =>
  z.preprocess(
    (v) => toNumber(v),
    max != null ? z.number().min(min).max(max) : z.number().min(min)
  );

// Accepts either 0..1 or 0..100 and normalizes to fraction 0..1
const PERCENT_BASE = 100;
const FRACTION_MAX = 1;
const ZERO = 0;
const percentFractionField = z.preprocess((v) => {
  const n = toNumber(v);
  return n > FRACTION_MAX ? n / PERCENT_BASE : n;
}, z.number().min(ZERO).max(FRACTION_MAX));

export const SaveProductSettingsSchema = z
  .object({
    blingProductId: z.string().min(1, 'Produto inválido'),
    leadTimeDays: intField(LEAD_TIME_MIN, LEAD_TIME_MAX),
    safetyDays: intField(SAFETY_DAYS_MIN, SAFETY_DAYS_MAX),
    criticalDaysRemainingThreshold: intField(CRITICAL_DAYS_MIN, CRITICAL_DAYS_MAX),
    highDaysRemainingThreshold: intField(HIGH_DAYS_MIN, HIGH_DAYS_MAX),
    mediumDaysRemainingThreshold: intField(MEDIUM_DAYS_MIN, MEDIUM_DAYS_MAX),
    opportunityGrowthThresholdPct: percentFractionField,
    opportunityDemandVvd: floatField(OPPORTUNITY_DEMAND_MIN, OPPORTUNITY_DEMAND_MAX),
    deadStockCapitalThreshold: floatField(ZERO),
    capitalOptimizationThreshold: floatField(ZERO),
    ruptureCapitalThreshold: floatField(ZERO),
    liquidationDiscount: percentFractionField,
    costFactor: floatField(COST_FACTOR_MIN, COST_FACTOR_MAX),
    liquidationExcessCapitalThreshold: floatField(ZERO),
    fineExcessCapitalMax: floatField(ZERO),
  })
  .strict();

export type SaveProductSettingsInput = z.infer<typeof SaveProductSettingsSchema>;
