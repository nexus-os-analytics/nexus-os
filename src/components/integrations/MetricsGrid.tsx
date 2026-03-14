/**
 * Metrics Grid Component
 *
 * Displays key metrics in a responsive grid layout
 *
 * @module components/integrations/MetricsGrid
 */

'use client';

import { Paper, SimpleGrid, Text, Title } from '@mantine/core';
import { IconAlertTriangle, IconCash, IconTrendingUp } from '@tabler/icons-react';
import type { IntegrationMetrics } from '@/types/integrations';
import { formatCurrency, formatNumber } from './utils';

export interface MetricsGridProps {
  /** The metrics to display */
  metrics: IntegrationMetrics;
}

interface MetricCardProps {
  label: string;
  value: string | number;
  icon: React.ReactNode;
  color: string;
}

function MetricCard({ label, value, icon, color }: MetricCardProps) {
  return (
    <Paper p="md" withBorder>
      <div style={{ display: 'flex', alignItems: 'center', marginBottom: '8px' }}>
        <div style={{ color: `var(--mantine-color-${color}-6)`, marginRight: '8px' }}>{icon}</div>
        <Text size="xs" c="dimmed">
          {label}
        </Text>
      </div>
      <Title order={2} size="h2">
        {value}
      </Title>
    </Paper>
  );
}

/**
 * Grid of metric cards showing capital stuck, ruptures, and opportunities
 */
export function MetricsGrid({ metrics }: MetricsGridProps) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="md">
      <MetricCard
        label="Capital Parado"
        value={formatCurrency(metrics.capitalStuck)}
        icon={<IconCash size={20} />}
        color="orange"
      />
      <MetricCard
        label="Alertas de Ruptura"
        value={formatNumber(metrics.ruptureCount)}
        icon={<IconAlertTriangle size={20} />}
        color="red"
      />
      <MetricCard
        label="Oportunidades"
        value={formatNumber(metrics.opportunityCount)}
        icon={<IconTrendingUp size={20} />}
        color="green"
      />
    </SimpleGrid>
  );
}
