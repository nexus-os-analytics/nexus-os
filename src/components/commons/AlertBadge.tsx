'use client';

import { Badge, type BadgeProps } from '@mantine/core';
import type { BlingAlertType } from '@prisma/client';
import { getAlertTypeColor, getAlertTypeEmoji, getAlertTypeLabel } from '@/lib/constants';

interface AlertBadgeProps extends Omit<BadgeProps, 'color'> {
  /** Alert type to determine styling */
  alertType: BlingAlertType | 'FINE';
  /** Show emoji before label (default: true) */
  showEmoji?: boolean;
  /** Show label text (default: true) */
  showLabel?: boolean;
}

/**
 * AlertBadge Component
 *
 * Renders a Mantine Badge with automatic color, emoji and label based on alert type.
 * Provides consistent visual styling for Bling alerts throughout the application.
 *
 * @example
 * <AlertBadge alertType="RUPTURE" />
 * // Output: 🔴 RUPTURA (with red background)
 *
 * @example
 * <AlertBadge alertType="OPPORTUNITY" showEmoji={false} size="lg" />
 * // Output: OPORTUNIDADE (with green background, large size)
 */
export function AlertBadge({
  alertType,
  showEmoji = true,
  showLabel = true,
  ...badgeProps
}: AlertBadgeProps) {
  const color = getAlertTypeColor(alertType);
  const emoji = getAlertTypeEmoji(alertType);
  const label = getAlertTypeLabel(alertType);

  const content = [
    showEmoji && emoji,
    showLabel && label,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <Badge color={color} variant="light" {...badgeProps}>
      {content}
    </Badge>
  );
}
