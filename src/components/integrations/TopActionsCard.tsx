/**
 * Top Actions Card Component
 *
 * Displays a single top priority action for a product
 *
 * @module components/integrations/TopActionsCard
 */

'use client';

import { Badge, Card, Group, Text } from '@mantine/core';
import type { IntegrationTopAction } from '@/types/integrations';
import { formatCurrency, getAlertColor } from './utils';

export interface TopActionsCardProps {
  /** The action data to display */
  action: IntegrationTopAction;
}

/**
 * Card component for displaying a top priority action
 *
 * Shows product name, SKU, alert badge, impact amount, and recommendations
 */
export function TopActionsCard({ action }: TopActionsCardProps) {
  return (
    <Card withBorder>
      <Group justify="space-between" mb="xs">
        <div>
          <Text fw={500}>{action.name}</Text>
          <Text size="sm" c="dimmed">
            SKU: {action.sku}
          </Text>
        </div>
        {action.alertType && (
          <Badge color={getAlertColor(action.alertType)} variant="light">
            {action.alertType}
          </Badge>
        )}
      </Group>

      {action.impactAmount && action.impactAmount > 0 && (
        <Text size="sm" c="dimmed" mb="xs">
          {action.impactLabel}: {formatCurrency(action.impactAmount)}
        </Text>
      )}

      {action.recommendations && (
        <Text size="sm" mt="sm">
          {action.recommendations}
        </Text>
      )}
    </Card>
  );
}
