'use client';

import { Alert, type AlertProps } from '@mantine/core';
import type { BlingAlertType } from '@prisma/client';
import { getAlertTypeColor, getAlertTypeDescription, getAlertTypeEmoji, getAlertTypeLabel } from '@/lib/constants';

interface AlertCardProps extends Omit<AlertProps, 'color' | 'icon' | 'title'> {
  /** Alert type to determine styling */
  alertType: BlingAlertType | 'FINE';
  /** Title to display in the alert */
  title?: React.ReactNode;
  /** Alert message content */
  message?: React.ReactNode;
  /** Show emoji as icon (default: true) */
  showEmoji?: boolean;
  /** Use auto-generated description if no title provided (default: true) */
  useAutoDescription?: boolean;
}

/**
 * AlertCard Component
 *
 * Renders a Mantine Alert with automatic color, emoji and styling based on alert type.
 * Provides consistent visual styling for Bling product alerts throughout the application.
 *
 * Features:
 * - Automatic color based on alert type
 * - Emoji icon support
 * - Auto-generated description if not provided
 * - Full Mantine Alert functionality
 * - Accessible ARIA attributes
 *
 * @example
 * <AlertCard
 *   alertType="DEAD_STOCK"
 *   title="Raquete de Tênis"
 *   message="Não vende há 999 dias. Considere liquidação."
 * />
 *
 * @example
 * <AlertCard
 *   alertType="OPPORTUNITY"
 *   message="Produto em crescimento de 150%!"
 * />
 */
export function AlertCard({
  alertType,
  title,
  message,
  showEmoji = true,
  useAutoDescription = true,
  ...alertProps
}: AlertCardProps) {
  const color = getAlertTypeColor(alertType);
  const emoji = getAlertTypeEmoji(alertType);
  const autoLabel = getAlertTypeLabel(alertType);
  const autoDescription = getAlertTypeDescription(alertType);

  // Use provided title or auto-generated label
  const displayTitle = title || autoLabel;

  // For children prop, use message if provided, otherwise use auto description
  const displayContent = message || (useAutoDescription ? autoDescription : null);

  return (
    <Alert
      color={color}
      variant="light"
      icon={showEmoji ? emoji : undefined}
      title={displayTitle}
      {...alertProps}
    >
      {displayContent}
    </Alert>
  );
}
