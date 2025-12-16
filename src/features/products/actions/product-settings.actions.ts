'use server';
import {
  type SaveProductSettingsInput,
  SaveProductSettingsSchema,
} from '@/features/products/schemas/product-settings.schema';
import prisma from '@/lib/prisma';

export async function saveProductSettingsAction(input: unknown) {
  const data = SaveProductSettingsSchema.parse(input as SaveProductSettingsInput);

  const {
    blingProductId,
    leadTimeDays,
    safetyDays,
    criticalDaysRemainingThreshold,
    highDaysRemainingThreshold,
    mediumDaysRemainingThreshold,
    opportunityGrowthThresholdPct,
    opportunityDemandVvd,
    deadStockCapitalThreshold,
    capitalOptimizationThreshold,
    ruptureCapitalThreshold,
    liquidationDiscount,
    costFactor,
    liquidationExcessCapitalThreshold,
    fineExcessCapitalMax,
  } = data;

  const settings = await prisma.blingProductSettings.upsert({
    where: { blingProductId: String(blingProductId) },
    update: {
      leadTimeDays,
      safetyDays,
      criticalDaysRemainingThreshold,
      highDaysRemainingThreshold,
      mediumDaysRemainingThreshold,
      opportunityGrowthThresholdPct,
      opportunityDemandVvd,
      deadStockCapitalThreshold,
      capitalOptimizationThreshold,
      ruptureCapitalThreshold,
      liquidationDiscount,
      costFactor,
      liquidationExcessCapitalThreshold,
      fineExcessCapitalMax,
    },
    create: {
      blingProductId: String(blingProductId),
      leadTimeDays,
      safetyDays,
      criticalDaysRemainingThreshold,
      highDaysRemainingThreshold,
      mediumDaysRemainingThreshold,
      opportunityGrowthThresholdPct,
      opportunityDemandVvd,
      deadStockCapitalThreshold,
      capitalOptimizationThreshold,
      ruptureCapitalThreshold,
      liquidationDiscount,
      costFactor,
      liquidationExcessCapitalThreshold,
      fineExcessCapitalMax,
    },
  });

  return { success: true, settings };
}
