/**
 * Campaign Dashboard Component
 *
 * Main dashboard for viewing and managing campaigns
 */

'use client';

import { useState } from 'react';
import {
  Stack,
  Title,
  Text,
  Button,
  Group,
  Paper,
  Badge,
  Select,
  Alert,
  Skeleton,
  SimpleGrid,
} from '@mantine/core';
import { IconPlus, IconSparkles, IconAlertCircle, IconRocket } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import type { CampaignStatus, CampaignType } from '@prisma/client';
import type { CampaignWithRelations } from '@/features/campaigns/types';
import { CampaignCard } from '@/features/campaigns/components/CampaignCard';

export function CampaignDashboard() {
  const router = useRouter();
  const [statusFilter, setStatusFilter] = useState<CampaignStatus | 'all'>('all');
  const [typeFilter, setTypeFilter] = useState<CampaignType | 'all'>('all');

  // Build query params
  const queryParams = new URLSearchParams();
  if (statusFilter !== 'all') queryParams.set('status', statusFilter);
  if (typeFilter !== 'all') queryParams.set('type', typeFilter);

  // Fetch campaigns
  const {
    data: campaigns,
    isLoading,
    error,
  } = useQuery<CampaignWithRelations[]>({
    queryKey: ['campaigns', statusFilter, typeFilter],
    queryFn: async () => {
      const response = await fetch(`/api/campaigns?${queryParams.toString()}`);
      if (!response.ok) throw new Error('Failed to fetch campaigns');
      return response.json();
    },
  });

  // Calculate stats
  const stats = campaigns
    ? {
        total: campaigns.length,
        active: campaigns.filter((c) => c.status === 'ACTIVE').length,
        draft: campaigns.filter((c) => c.status === 'DRAFT').length,
        liquidation: campaigns.filter((c) => c.type === 'LIQUIDATION').length,
        opportunity: campaigns.filter((c) => c.type === 'OPPORTUNITY').length,
      }
    : null;

  return (
    <Stack gap="xl">
      {/* Header */}
      <Group justify="space-between" align="flex-start">
        <Stack gap="xs">
          <Title order={1}>Minhas Campanhas</Title>
          <Text c="dimmed">Gerencie suas campanhas de liquidação e oportunidade</Text>
        </Stack>
        <Button
          leftSection={<IconPlus size={18} />}
          size="md"
          onClick={() => router.push('/campanhas/criar?step=1')}
        >
          Nova Campanha
        </Button>
      </Group>

      {/* Stats */}
      {stats && (
        <SimpleGrid cols={{ base: 2, sm: 5 }} spacing="md">
          <Paper withBorder p="md" radius="md">
            <Stack gap={4}>
              <Text size="xs" c="dimmed" tt="uppercase">
                Total
              </Text>
              <Text size="xl" fw={700}>
                {stats.total}
              </Text>
            </Stack>
          </Paper>
          <Paper withBorder p="md" radius="md">
            <Stack gap={4}>
              <Text size="xs" c="dimmed" tt="uppercase">
                Ativas
              </Text>
              <Text size="xl" fw={700} c="green">
                {stats.active}
              </Text>
            </Stack>
          </Paper>
          <Paper withBorder p="md" radius="md">
            <Stack gap={4}>
              <Text size="xs" c="dimmed" tt="uppercase">
                Rascunhos
              </Text>
              <Text size="xl" fw={700} c="gray">
                {stats.draft}
              </Text>
            </Stack>
          </Paper>
          <Paper withBorder p="md" radius="md">
            <Stack gap={4}>
              <Text size="xs" c="dimmed" tt="uppercase">
                Liquidação
              </Text>
              <Text size="xl" fw={700} c="blue">
                {stats.liquidation}
              </Text>
            </Stack>
          </Paper>
          <Paper withBorder p="md" radius="md">
            <Stack gap={4}>
              <Text size="xs" c="dimmed" tt="uppercase">
                Oportunidade
              </Text>
              <Text size="xl" fw={700} c="teal">
                {stats.opportunity}
              </Text>
            </Stack>
          </Paper>
        </SimpleGrid>
      )}

      {/* Filters */}
      <Paper withBorder p="md" radius="md">
        <Group>
          <Select
            label="Status"
            placeholder="Todos"
            value={statusFilter}
            onChange={(value) => setStatusFilter(value as CampaignStatus | 'all')}
            data={[
              { value: 'all', label: 'Todos' },
              { value: 'DRAFT', label: 'Rascunho' },
              { value: 'ACTIVE', label: 'Ativa' },
              { value: 'PAUSED', label: 'Pausada' },
              { value: 'COMPLETED', label: 'Concluída' },
            ]}
            clearable
            style={{ flex: 1, maxWidth: 200 }}
          />
          <Select
            label="Tipo"
            placeholder="Todos"
            value={typeFilter}
            onChange={(value) => setTypeFilter(value as CampaignType | 'all')}
            data={[
              { value: 'all', label: 'Todos' },
              { value: 'LIQUIDATION', label: 'Liquidação' },
              { value: 'OPPORTUNITY', label: 'Oportunidade' },
            ]}
            clearable
            style={{ flex: 1, maxWidth: 200 }}
          />
        </Group>
      </Paper>

      {/* Error state */}
      {error && (
        <Alert icon={<IconAlertCircle />} title="Erro ao carregar campanhas" color="red">
          Não foi possível carregar suas campanhas. Tente novamente mais tarde.
        </Alert>
      )}

      {/* Loading state */}
      {isLoading && (
        <Stack gap="md">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={150} radius="md" />
          ))}
        </Stack>
      )}

      {/* Campaigns list */}
      {!isLoading && campaigns && campaigns.length > 0 && (
        <Stack gap="md">
          <Text fw={500} size="sm" c="dimmed">
            {campaigns.length} {campaigns.length === 1 ? 'campanha' : 'campanhas'}
          </Text>
          {campaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </Stack>
      )}

      {/* Empty state */}
      {!isLoading && campaigns && campaigns.length === 0 && (
        <Paper withBorder p="xl" radius="md">
          <Stack align="center" gap="md">
            <IconSparkles size={48} color="var(--mantine-color-blue-5)" />
            <Stack gap="xs" align="center">
              <Title order={3}>Nenhuma campanha encontrada</Title>
              <Text size="sm" c="dimmed" ta="center">
                {statusFilter !== 'all' || typeFilter !== 'all'
                  ? 'Nenhuma campanha corresponde aos filtros selecionados.'
                  : 'Você ainda não criou nenhuma campanha. Comece agora e deixe a IA criar anúncios persuasivos para você!'}
              </Text>
            </Stack>
            <Button
              leftSection={<IconRocket size={18} />}
              onClick={() => router.push('/campanhas/criar?step=1')}
            >
              Criar Primeira Campanha
            </Button>
          </Stack>
        </Paper>
      )}
    </Stack>
  );
}
