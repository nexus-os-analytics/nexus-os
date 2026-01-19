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
    costPrice: z.number().nonnegative(),
    currentStock: z.number().int().nonnegative().optional(),
    image: z.string().url().optional().nullable(),
    blingProductId: z.string().min(1),
  })
  .strict();

export const GenerateProductCampaignSchema = z
  .object({
    product: ProductInfoSchema,
    strategy: StrategyEnum,
    toneOfVoice: ToneEnum,
    customInstructions: z.string().max(CUSTOM_INSTRUCTIONS_MAX).optional(),
  })
  .strict();

export type GenerateProductCampaignInput = z.infer<typeof GenerateProductCampaignSchema>;
