/**
 * Campaign Recommendation Logic
 *
 * Calculates recommended discount/increase percentages based on alert data
 * Aligned with PRD v2.0 specifications
 */

import type { BlingAlert } from '@prisma/client';
import type { DiscountRecommendation, IncreaseRecommendation } from '../types';

/**
 * Get recommended discount for LIQUIDATION campaigns
 *
 * Rules (from PRD):
 * - DEAD_STOCK:
 *   - 30-60 days: 30% (High urgency)
 *   - 60-90 days: 35% (Very High urgency)
 *   - 90+ days: 40% (Critical urgency)
 *
 * - LIQUIDATION (excess stock):
 *   - 200-300%: 10% (Moderate urgency)
 *   - 300-500%: 15% (High urgency)
 *   - 500%+: 20% (Very High urgency)
 */
export function getRecommendedDiscount(
  alert: BlingAlert,
  originalPrice: number
): DiscountRecommendation {
  let percentage = 15; // Default
  let reason = 'Desconto padrão para recuperação de capital';
  let urgency: DiscountRecommendation['urgency'] = 'moderate';

  if (alert.type === 'DEAD_STOCK') {
    const days = alert.daysSinceLastSale || 0;

    if (days >= 90) {
      percentage = 40;
      reason =
        days > 365
          ? 'Produto nunca vendeu - desconto agressivo necessário'
          : `Produto sem vendas há ${days} dias - risco crítico`;
      urgency = 'critical';
    } else if (days >= 60) {
      percentage = 35;
      reason = `Produto sem vendas há ${days} dias - situação muito preocupante`;
      urgency = 'very-high';
    } else if (days >= 30) {
      percentage = 30;
      reason = `Produto sem vendas há ${days} dias - capital parado`;
      urgency = 'high';
    }
  } else if (alert.type === 'LIQUIDATION') {
    const excess = alert.excessPercentage || 0;

    if (excess >= 500) {
      percentage = 20;
      reason = `Excesso muito alto (${excess.toFixed(0)}% acima do ideal)`;
      urgency = 'very-high';
    } else if (excess >= 300) {
      percentage = 15;
      reason = `Excesso alto (${excess.toFixed(0)}% acima do ideal)`;
      urgency = 'high';
    } else if (excess >= 200) {
      percentage = 10;
      reason = `Excesso moderado (${excess.toFixed(0)}% acima do ideal)`;
      urgency = 'moderate';
    }
  }

  const finalPrice = originalPrice * (1 - percentage / 100);
  const savings = originalPrice - finalPrice;

  return {
    percentage,
    reason,
    urgency,
    finalPrice,
    savings,
  };
}

/**
 * Get recommended price increase for OPPORTUNITY campaigns
 *
 * Rules (from PRD):
 * - 50-100% growth: 10% (Conservative strategy)
 * - 100-150% growth: 15% (Moderate strategy)
 * - 150%+ growth: 20% (Aggressive strategy)
 */
export function getRecommendedIncrease(
  alert: BlingAlert,
  originalPrice: number
): IncreaseRecommendation {
  const growth = alert.growthTrend || 0;

  let percentage = 10; // Default conservative
  let reason = 'Aumento conservador baseado em demanda';
  let strategy: IncreaseRecommendation['strategy'] = 'conservative';

  if (growth >= 150) {
    percentage = 20;
    reason = `Crescimento excepcional (${growth.toFixed(0)}%) - alta demanda sustentada`;
    strategy = 'aggressive';
  } else if (growth >= 100) {
    percentage = 15;
    reason = `Crescimento forte (${growth.toFixed(0)}%) - demanda muito alta`;
    strategy = 'moderate';
  } else if (growth >= 50) {
    percentage = 10;
    reason = `Crescimento consistente (${growth.toFixed(0)}%) - boa oportunidade`;
    strategy = 'conservative';
  } else {
    // Fallback for edge cases
    reason = `Produto em alta demanda (VVD: ${alert.vvdReal.toFixed(1)})`;
  }

  const finalPrice = originalPrice * (1 + percentage / 100);
  const gain = finalPrice - originalPrice;

  return {
    percentage,
    reason,
    strategy,
    finalPrice,
    gain,
  };
}

/**
 * Validate discount percentage is within allowed range
 */
export function isValidDiscount(percentage: number): boolean {
  return percentage >= 10 && percentage <= 40;
}

/**
 * Validate increase percentage is within allowed range
 */
export function isValidIncrease(percentage: number): boolean {
  return percentage >= 10 && percentage <= 20;
}

/**
 * Calculate final price after discount
 */
export function calculateDiscountedPrice(
  originalPrice: number,
  discountPercentage: number
): number {
  return originalPrice * (1 - discountPercentage / 100);
}

/**
 * Calculate final price after increase
 */
export function calculateIncreasedPrice(originalPrice: number, increasePercentage: number): number {
  return originalPrice * (1 + increasePercentage / 100);
}

/**
 * Get urgency badge color
 */
export function getUrgencyColor(urgency: DiscountRecommendation['urgency']): string {
  switch (urgency) {
    case 'critical':
      return 'red';
    case 'very-high':
      return 'orange';
    case 'high':
      return 'yellow';
    case 'moderate':
      return 'blue';
    default:
      return 'gray';
  }
}

/**
 * Get strategy badge color
 */
export function getStrategyColor(strategy: IncreaseRecommendation['strategy']): string {
  switch (strategy) {
    case 'aggressive':
      return 'green';
    case 'moderate':
      return 'blue';
    case 'conservative':
      return 'gray';
    default:
      return 'gray';
  }
}
