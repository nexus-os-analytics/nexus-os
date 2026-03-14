/**
 * Metrics Dashboard Component
 *
 * Main dashboard layout for displaying integration metrics
 *
 * @module components/integrations/MetricsDashboard
 */

'use client';

import { Stack, Text, Title } from '@mantine/core';
import type { IntegrationMetrics, IntegrationProvider } from '@/types/integrations';
import { MetricsGrid } from './MetricsGrid';
import { TopActionsCard } from './TopActionsCard';

export interface MetricsDashboardProps {
  /** The metrics to display */
  metrics: IntegrationMetrics;
  /** Integration provider */
  provider: IntegrationProvider;
}

/**
 * Complete dashboard with metrics grid and top actions
 */
export function MetricsDashboard({ metrics, provider }: MetricsDashboardProps) {
  return (
    <Stack gap="xl">
      {/* Metrics Overview Grid */}
      <MetricsGrid metrics={metrics} />

      {/* Top Priority Actions */}
      {metrics.topActions.length > 0 && (
        <Stack gap="md">
          <div>
            <Title order={3} size="h3">
              Ações Prioritárias
            </Title>
            <Text size="sm" c="dimmed">
              Principais produtos que requerem atenção
            </Text>
          </div>

          <Stack gap="sm">
            {metrics.topActions.map((action) => (
              <TopActionsCard key={action.id} action={action} />
            ))}
          </Stack>
        </Stack>
      )}

      {/* Product Count (if available) */}
      {metrics.productCount !== undefined && (
        <Text size="sm" c="dimmed">
          {metrics.productCount} produtos sincronizados
          {metrics.productLimit && ` (limite: ${metrics.productLimit})`}
        </Text>
      )}
    </Stack>
  );
}
