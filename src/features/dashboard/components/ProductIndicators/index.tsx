'use client';
import { Card, Group, SimpleGrid, Text, ThemeIcon, Title } from '@mantine/core';
import { AlertTriangle, DollarSign, TrendingUp } from 'lucide-react';
import type { GetOverviewMetricsResponse } from '@/features/products/types';

interface ProductIndicatorsProps {
  metrics: Pick<GetOverviewMetricsResponse, 'capitalStuck' | 'ruptureCount' | 'opportunityCount'>;
}

export function ProductIndicators({ metrics }: ProductIndicatorsProps) {
  return (
    <SimpleGrid cols={{ base: 1, sm: 3 }} spacing={{ base: 'md', sm: 'lg' }}>
      <Card padding="xl" radius="md" withBorder shadow="md">
        <Group justify="space-between" mb="md">
          <ThemeIcon size={48} radius="md" color="brand" variant="light">
            <DollarSign size={24} />
          </ThemeIcon>
        </Group>
        <Text size="sm" mb={4}>
          Capital Parado
        </Text>
        <Title order={2}>
          R$ {metrics.capitalStuck.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </Title>
        <Text size="xs" mt="xs">
          Isso está custando juros e armazenamento
        </Text>
      </Card>

      <Card padding="xl" radius="md" withBorder shadow="md">
        <Group justify="space-between" mb="md">
          <ThemeIcon size={48} radius="md" color="red" variant="light">
            <AlertTriangle size={24} />
          </ThemeIcon>
        </Group>
        <Text size="sm" mb={4}>
          Produtos em Risco
        </Text>
        <Title order={2}>{metrics.ruptureCount}</Title>
        <Text size="xs" mt="xs">
          Podem zerar nos próximos dias
        </Text>
      </Card>

      <Card padding="xl" radius="md" withBorder shadow="md">
        <Group justify="space-between" mb="md">
          <ThemeIcon size={48} radius="md" color="teal" variant="light">
            <TrendingUp size={24} />
          </ThemeIcon>
        </Group>
        <Text size="sm" mb={4}>
          Oportunidades
        </Text>
        <Title order={2}>{metrics.opportunityCount}</Title>
        <Text size="xs" mt="xs">
          Produtos vendendo acima da média
        </Text>
      </Card>
    </SimpleGrid>
  );
}
