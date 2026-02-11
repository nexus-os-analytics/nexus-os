import { z } from 'zod';

const CUSTOM_INSTRUCTIONS_MAX = 500;

const ToneEnum = z.enum([
  'urgent-direct',
  'friendly-casual',
  'professional-technical',
  'enthusiastic-emotional',
]);

const StrategyEnum = z.enum(['aggressive-liquidation', 'strategic-combo', 'checkout-upsell']);

export const ProductInfoSchema = z
  .object({
    name: z.string().min(1),
    sku: z.string().min(1),
    categoryName: z.string().optional().nullable(),
    salePrice: z.number().nonnegative(),
    suggestedPrice: z.number().nonnegative().optional(),
    costPrice: z.number().nonnegative(),
    currentStock: z.number().int().nonnegative().optional(),
    image: z.string().url().optional().nullable(),
    blingProductId: z.string().min(1),
  })
  .strict();

const AlertTypeEnum = z.enum(['FINE', 'RUPTURE', 'DEAD_STOCK', 'OPPORTUNITY', 'LIQUIDATION']);

export const AlertContextSchema = z
  .object({
    type: AlertTypeEnum,
    discountPct: z.number().int().nonnegative().optional(),
    discountAmount: z.number().nonnegative().optional(),
    daysRemaining: z.number().int().nonnegative().optional(),
    estimatedDeadline: z.number().int().nonnegative().optional(),
    growthTrend: z.number().optional(),
    capitalStuck: z.number().optional(),
    vvdReal: z.number().optional(),
    vvd30: z.number().optional(),
    vvd7: z.number().optional(),
    daysSinceLastSale: z.number().int().optional(),
    excessUnits: z.number().int().optional(),
    excessPercentage: z.number().optional(),
    excessCapital: z.number().optional(),
  })
  .strict();

export const GenerateProductCampaignSchema = z
  .object({
    product: ProductInfoSchema,
    strategy: StrategyEnum,
    toneOfVoice: ToneEnum,
    customInstructions: z.string().max(CUSTOM_INSTRUCTIONS_MAX).optional(),
    alert: AlertContextSchema.optional(),
  })
  .strict();

export type GenerateProductCampaignInput = z.infer<typeof GenerateProductCampaignSchema>;
