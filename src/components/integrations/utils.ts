/**
 * Integration component utilities
 *
 * Helper functions for formatting and styling integration UI components
 *
 * @module components/integrations/utils
 */

/**
 * Format a number as Brazilian currency (R$)
 *
 * @param value - The numeric value to format
 * @returns Formatted currency string
 *
 * @example
 * formatCurrency(1234.56) // → 'R$ 1.234,56'
 */
export function formatCurrency(value: number): string {
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  }).format(value);
}

/**
 * Get Mantine color for an alert type
 *
 * Maps alert types to Mantine's color system
 *
 * @param alertType - The alert type string
 * @returns Mantine color name
 *
 * @example
 * getAlertColor('RUPTURE') // → 'red'
 */
export function getAlertColor(alertType: string | undefined): string {
  if (!alertType) return 'gray';

  const colorMap: Record<string, string> = {
    FINE: 'green',
    RUPTURE: 'red',
    DEAD_STOCK: 'gray',
    OPPORTUNITY: 'blue',
    LIQUIDATION: 'orange',
  };

  return colorMap[alertType] ?? 'gray';
}

/**
 * Get Mantine color for a risk level
 *
 * @param riskLevel - The risk level string
 * @returns Mantine color name
 *
 * @example
 * getRiskColor('CRITICAL') // → 'red'
 */
export function getRiskColor(riskLevel: string | undefined): string {
  if (!riskLevel) return 'gray';

  const colorMap: Record<string, string> = {
    LOW: 'green',
    MEDIUM: 'yellow',
    HIGH: 'orange',
    CRITICAL: 'red',
  };

  return colorMap[riskLevel] ?? 'gray';
}

/**
 * Format a number with thousands separator
 *
 * @param value - The numeric value to format
 * @returns Formatted number string
 *
 * @example
 * formatNumber(1234567) // → '1.234.567'
 */
export function formatNumber(value: number): string {
  return new Intl.NumberFormat('pt-BR').format(value);
}
