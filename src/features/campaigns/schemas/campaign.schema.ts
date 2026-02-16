/**
 * Campaign Validation Schemas
 *
 * Zod schemas for campaign-related API endpoints and forms
 */

import { z } from 'zod';
import { CampaignType, CampaignStatus } from '@prisma/client';

/**
 * Tone of voice schema
 */
export const toneOfVoiceSchema = z.enum(['urgent', 'promotional', 'professional', 'friendly']);

/**
 * Ad variation schema
 */
export const adVariationSchema = z.object({
  id: z.string().uuid(),
  title: z.string().min(1).max(200),
  body: z.string().min(1).max(1000),
  cta: z.string().min(1).max(100),
});

/**
 * Campaign generation input schema
 */
export const campaignGenerationSchema = z
  .object({
    type: z.nativeEnum(CampaignType),
    blingProductId: z.string().min(1),
    discountPercentage: z.number().int().min(10).max(40).optional(),
    increasePercentage: z.number().int().min(10).max(20).optional(),
    toneOfVoice: toneOfVoiceSchema,
    customInstructions: z.string().max(500).optional(),
  })
  .refine(
    (data) => {
      // LIQUIDATION requires discountPercentage
      if (data.type === CampaignType.LIQUIDATION) {
        return data.discountPercentage !== undefined;
      }
      // OPPORTUNITY requires increasePercentage
      if (data.type === CampaignType.OPPORTUNITY) {
        return data.increasePercentage !== undefined;
      }
      return true;
    },
    {
      message:
        'discountPercentage required for LIQUIDATION, increasePercentage required for OPPORTUNITY',
    }
  );

/**
 * Campaign activation schema
 */
export const campaignActivationSchema = z.object({
  selectedVariationId: z.string().uuid(),
});

/**
 * Campaign filters schema
 */
export const campaignFiltersSchema = z.object({
  status: z.nativeEnum(CampaignStatus).optional(),
  type: z.nativeEnum(CampaignType).optional(),
  startDate: z.coerce.date().optional(),
  endDate: z.coerce.date().optional(),
});

/**
 * Campaign update schema
 */
export const campaignUpdateSchema = z.object({
  status: z.nativeEnum(CampaignStatus).optional(),
  selectedVariationId: z.string().uuid().optional(),
  customInstructions: z.string().max(500).optional(),
});

/**
 * Campaign metrics update schema (for future tracking)
 */
export const campaignMetricsSchema = z.object({
  clicks: z.number().int().min(0).optional(),
  conversions: z.number().int().min(0).optional(),
  revenue: z.number().min(0).optional(),
  roi: z.number().optional(),
});

/**
 * Type exports
 */
export type CampaignGenerationInput = z.infer<typeof campaignGenerationSchema>;
export type CampaignActivationInput = z.infer<typeof campaignActivationSchema>;
export type CampaignFilters = z.infer<typeof campaignFiltersSchema>;
export type CampaignUpdateInput = z.infer<typeof campaignUpdateSchema>;
export type CampaignMetricsInput = z.infer<typeof campaignMetricsSchema>;
