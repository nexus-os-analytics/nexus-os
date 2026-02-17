/**
 * Alert type colors, labels and configuration
 * Centralizes all visual and textual properties for Bling product alerts
 * Ensures consistency across the application
 */

import type { BlingAlertType } from '@prisma/client';
import type { MantineColor } from '@mantine/core';

export interface AlertTypeConfig {
  /** Portuguese label for UI display */
  label: string;
  /** Emoji visual indicator */
  emoji: string;
  /** Mantine theme color name */
  color: MantineColor;
  /** Color shade for light variant background (0-9) */
  colorShade: number;
  /** Description for accessibility and documentation */
  description: string;
}

/**
 * Alert type configuration mapping
 * Each alert type has a corresponding visual styling and label
 */
export const ALERT_TYPE_CONFIG: Record<BlingAlertType | 'FINE', AlertTypeConfig> = {
  DEAD_STOCK: {
    label: 'CAPITAL PARADO',
    emoji: '🟧',
    color: 'deadStock',
    colorShade: 5,
    description: 'Produto sem venda há 30+ dias com capital travado',
  },
  LIQUIDATION: {
    label: 'LIQUIDAÇÃO',
    emoji: '🟠',
    color: 'liquidation',
    colorShade: 5,
    description: 'Excesso de estoque em relação às vendas estimadas',
  },
  RUPTURE: {
    label: 'RUPTURA',
    emoji: '🔴',
    color: 'red',
    colorShade: 5,
    description: 'Risco crítico de ruptura de estoque',
  },
  OPPORTUNITY: {
    label: 'OPORTUNIDADE',
    emoji: '🟢',
    color: 'opportunity',
    colorShade: 5,
    description: 'Produto em crescimento de demanda',
  },
  FINE: {
    label: 'SAUDÁVEL',
    emoji: '✅',
    color: 'fine',
    colorShade: 5,
    description: 'Estoque em situação saudável',
  },
};

/**
 * Get alert configuration by type
 * @param type - The BlingAlertType
 * @returns AlertTypeConfig with all visual and textual properties
 */
export function getAlertTypeConfig(type: BlingAlertType | 'FINE'): AlertTypeConfig {
  return (
    ALERT_TYPE_CONFIG[type] || {
      label: 'OBSERVAR',
      emoji: '📋',
      color: 'gray',
      colorShade: 5,
      description: 'Monitorar indicadores',
    }
  );
}

/**
 * Get Portuguese label for alert type
 * @param type - The BlingAlertType
 * @returns Portuguese label string
 */
export function getAlertTypeLabel(type: BlingAlertType | 'FINE'): string {
  return getAlertTypeConfig(type).label;
}

/**
 * Get emoji for alert type
 * @param type - The BlingAlertType
 * @returns Emoji character
 */
export function getAlertTypeEmoji(type: BlingAlertType | 'FINE'): string {
  return getAlertTypeConfig(type).emoji;
}

/**
 * Get Mantine color for alert type
 * @param type - The BlingAlertType
 * @returns Mantine color name
 */
export function getAlertTypeColor(type: BlingAlertType | 'FINE'): MantineColor {
  return getAlertTypeConfig(type).color;
}

/**
 * Get description for alert type
 * @param type - The BlingAlertType
 * @returns Description string
 */
export function getAlertTypeDescription(type: BlingAlertType | 'FINE'): string {
  return getAlertTypeConfig(type).description;
}

/** Alert urgency hierarchy */
export const ALERT_URGENCY_ORDER: (BlingAlertType | 'FINE')[] = [
  'RUPTURE', // 🔴 Critical - immediate action
  'DEAD_STOCK', // 🟧 Important - action needed
  'LIQUIDATION', // 🟠 Moderate - recommended action
  'OPPORTUNITY', // 🟢 Growth - positive
  'FINE', // ✅ Normal - ok
];
