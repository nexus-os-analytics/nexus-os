/**
 * Campaign Type Selector Component
 *
 * Step 1: Choose between LIQUIDATION or OPPORTUNITY campaign
 */

'use client';

import {
  Stack,
  Title,
  Text,
  SimpleGrid,
  Paper,
  Button,
  Group,
  Badge,
  ThemeIcon,
} from '@mantine/core';
import { IconDroplet, IconTrendingUp, IconAlertCircle, IconSparkles } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import type { CampaignType } from '@prisma/client';
import type { CampaignOpportunities } from '@/features/campaigns/types';
import { formatCurrency } from '@/lib/utils';

interface CampaignTypeSelectorProps {
  onSelect: (type: CampaignType) => void;
}

export function CampaignTypeSelector({ onSelect }: CampaignTypeSelectorProps) {
  // Fetch opportunities
  const { data, isLoading } = useQuery<CampaignOpportunities>({
    queryKey: ['campaign-opportunities'],
    queryFn: async () => {
      const response = await fetch('/api/campaigns/opportunities');
      if (!response.ok) throw new Error('Failed to fetch opportunities');
      return response.json();
    },
  });

  return (
    <Stack gap="xl">
      <Stack gap="xs">
        <Title order={2}>Criar Campanha com IA</Title>
        <Text c="dimmed">
          Escolha o tipo de campanha que deseja criar. A IA irá gerar textos persuasivos otimizados
          para cada objetivo.
        </Text>
      </Stack>

      <SimpleGrid cols={{ base: 1, md: 2 }} spacing="lg">
        {/* Liquidation Card */}
        <Paper withBorder p="xl" radius="md" style={{ position: 'relative', overflow: 'hidden' }}>
          <Stack gap="md">
            <Group justify="space-between" align="flex-start">
              <ThemeIcon size={60} radius="md" variant="light" color="blue">
                <IconDroplet size={32} />
              </ThemeIcon>
              <Badge size="lg" variant="light" color="blue">
                Liquidação
              </Badge>
            </Group>

            <Stack gap="xs">
              <Title order={3}>Campanha de Liquidação</Title>
              <Text size="sm" c="dimmed">
                Para produtos com capital parado ou excesso de estoque
              </Text>
            </Stack>

            <Paper withBorder p="sm" radius="sm" bg="blue.0">
              <Stack gap="xs">
                <Text size="sm" fw={500}>
                  Objetivo: Recuperar capital através de descontos
                </Text>
                <Text size="xs" c="dimmed">
                  Desconto recomendado: 10% a 40%
                </Text>
              </Stack>
            </Paper>

            {!isLoading && data && (
              <Stack gap={6}>
                <Group gap="xs">
                  <IconAlertCircle size={16} />
                  <Text size="sm" fw={500}>
                    {data.liquidation.count} produtos disponíveis
                  </Text>
                </Group>
                {data.liquidation.totalAtRisk > 0 && (
                  <Text size="xs" c="red">
                    {formatCurrency(data.liquidation.totalAtRisk)} em risco
                  </Text>
                )}
              </Stack>
            )}

            <Button
              fullWidth
              size="md"
              leftSection={<IconSparkles size={18} />}
              onClick={() => onSelect('LIQUIDATION')}
              disabled={isLoading || data?.liquidation.count === 0}
              loading={isLoading}
            >
              Criar Campanha de Liquidação
            </Button>
          </Stack>
        </Paper>

        {/* Opportunity Card */}
        <Paper withBorder p="xl" radius="md" style={{ position: 'relative', overflow: 'hidden' }}>
          <Stack gap="md">
            <Group justify="space-between" align="flex-start">
              <ThemeIcon size={60} radius="md" variant="light" color="green">
                <IconTrendingUp size={32} />
              </ThemeIcon>
              <Badge size="lg" variant="light" color="green">
                Oportunidade
              </Badge>
            </Group>

            <Stack gap="xs">
              <Title order={3}>Campanha de Oportunidade</Title>
              <Text size="sm" c="dimmed">
                Para produtos com alta demanda e crescimento forte
              </Text>
            </Stack>

            <Paper withBorder p="sm" radius="sm" bg="green.0">
              <Stack gap="xs">
                <Text size="sm" fw={500}>
                  Objetivo: Maximizar lucro com aumento estratégico
                </Text>
                <Text size="xs" c="dimmed">
                  Aumento recomendado: 10% a 20%
                </Text>
              </Stack>
            </Paper>

            {!isLoading && data && (
              <Stack gap={6}>
                <Group gap="xs">
                  <IconSparkles size={16} />
                  <Text size="sm" fw={500}>
                    {data.opportunity.count} produtos disponíveis
                  </Text>
                </Group>
                {data.opportunity.averageGrowth > 0 && (
                  <Text size="xs" c="green">
                    Crescimento médio: {data.opportunity.averageGrowth.toFixed(0)}%
                  </Text>
                )}
              </Stack>
            )}

            <Button
              fullWidth
              size="md"
              color="green"
              leftSection={<IconSparkles size={18} />}
              onClick={() => onSelect('OPPORTUNITY')}
              disabled={isLoading || data?.opportunity.count === 0}
              loading={isLoading}
            >
              Criar Campanha de Oportunidade
            </Button>
          </Stack>
        </Paper>
      </SimpleGrid>

      {!isLoading && data && data.liquidation.count === 0 && data.opportunity.count === 0 && (
        <Paper withBorder p="xl" radius="md" bg="gray.0">
          <Stack align="center" gap="md">
            <ThemeIcon size={60} radius="md" variant="light" color="gray">
              <IconAlertCircle size={32} />
            </ThemeIcon>
            <Stack gap="xs" align="center">
              <Title order={4}>Nenhuma oportunidade disponível</Title>
              <Text size="sm" c="dimmed" ta="center">
                No momento não há produtos elegíveis para criar campanhas. Certifique-se de ter
                produtos com alertas ativos.
              </Text>
            </Stack>
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
