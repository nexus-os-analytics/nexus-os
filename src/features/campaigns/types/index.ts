/**
 * Campaign Types & Interfaces
 *
 * Defines types for the Campaign Manager v2.0 (BETA)
 * Supports 2 campaign types: LIQUIDATION and OPPORTUNITY
 */

import type {
  Campaign,
  CampaignType,
  CampaignStatus,
  BlingProduct,
  BlingAlert,
} from '@prisma/client';

/**
 * Campaign types (aligned with PRD v2.0)
 */
export type { CampaignType, CampaignStatus };

/**
 * Tone of voice options for campaign generation
 */
export type ToneOfVoice = 'urgent' | 'promotional' | 'professional' | 'friendly';

/**
 * Ad variation structure (3 variations per campaign for A/B testing)
 */
export interface AdVariation {
  id: string;
  title: string;
  body: string;
  cta: string;
}

/**
 * Campaign with relations
 */
export interface CampaignWithRelations extends Campaign {
  product: BlingProduct & {
    alert: BlingAlert | null;
  };
}

/**
 * Discount recommendation for LIQUIDATION campaigns
 */
export interface DiscountRecommendation {
  percentage: number;
  reason: string;
  urgency: 'moderate' | 'high' | 'very-high' | 'critical';
  finalPrice: number;
  savings: number;
}

/**
 * Increase recommendation for OPPORTUNITY campaigns
 */
export interface IncreaseRecommendation {
  percentage: number;
  reason: string;
  strategy: 'conservative' | 'moderate' | 'aggressive';
  finalPrice: number;
  gain: number;
}

/**
 * Campaign opportunities response
 */
export interface CampaignOpportunities {
  liquidation: {
    count: number;
    products: (BlingProduct & { alert: BlingAlert | null })[];
    totalAtRisk: number;
  };
  opportunity: {
    count: number;
    products: (BlingProduct & { alert: BlingAlert | null })[];
    averageGrowth: number;
  };
}

/**
 * Campaign generation input
 */
export interface CampaignGenerationInput {
  type: CampaignType;
  blingProductId: string;
  discountPercentage?: number; // Required for LIQUIDATION (10-40)
  increasePercentage?: number; // Required for OPPORTUNITY (10-20)
  toneOfVoice: ToneOfVoice;
  customInstructions?: string;
}

/**
 * Campaign generation output
 */
export interface CampaignGenerationOutput {
  campaignId: string;
  variations: AdVariation[];
}

/**
 * Campaign activation input
 */
export interface CampaignActivationInput {
  selectedVariationId: string;
}

/**
 * Campaign list filters
 */
export interface CampaignFilters {
  status?: CampaignStatus;
  type?: CampaignType;
  startDate?: Date;
  endDate?: Date;
}

/**
 * Campaign metrics
 */
export interface CampaignMetrics {
  clicks: number;
  conversions: number;
  revenue: number;
  roi: number;
}

/**
 * @deprecated Use CampaignType instead. This will be removed in v3.0
 */
export type CampaignStrategy = 'aggressive-liquidation' | 'strategic-combo' | 'checkout-upsell';
