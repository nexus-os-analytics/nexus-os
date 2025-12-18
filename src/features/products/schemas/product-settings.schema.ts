import { z } from 'zod';

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
const percentFractionField = z.preprocess((v) => {
  const n = toNumber(v);
  return n > 1 ? n / 100 : n;
}, z.number().min(0).max(1));

export const SaveProductSettingsSchema = z
  .object({
    blingProductId: z.string().min(1, 'Produto inválido'),
    leadTimeDays: intField(1, 90),
    safetyDays: intField(0, 30),
    criticalDaysRemainingThreshold: intField(1, 30),
    highDaysRemainingThreshold: intField(1, 30),
    mediumDaysRemainingThreshold: intField(1, 60),
    opportunityGrowthThresholdPct: percentFractionField,
    opportunityDemandVvd: floatField(0, 20),
    deadStockCapitalThreshold: floatField(0),
    capitalOptimizationThreshold: floatField(0),
    ruptureCapitalThreshold: floatField(0),
    liquidationDiscount: percentFractionField,
    costFactor: floatField(0.1, 3),
    liquidationExcessCapitalThreshold: floatField(0),
    fineExcessCapitalMax: floatField(0),
  })
  .strict();

export type SaveProductSettingsInput = z.infer<typeof SaveProductSettingsSchema>;
