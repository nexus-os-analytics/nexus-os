/**
 * Campaign Detail Page Component
 *
 * Displays full campaign details with all variations
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
  Image,
  Radio,
  Alert,
  Skeleton,
  ActionIcon,
  Menu,
  Modal,
  Divider,
  SimpleGrid,
  Card,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconDots,
  IconPlayerPause,
  IconPlayerPlay,
  IconTrash,
  IconCopy,
  IconCheck,
  IconAlertCircle,
  IconDroplet,
  IconTrendingUp,
  IconSparkles,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import type { CampaignWithRelations } from '@/features/campaigns/types';
import { formatCurrency } from '@/lib/utils';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/pt-br';

dayjs.extend(relativeTime);
dayjs.locale('pt-br');

interface CampaignDetailProps {
  campaignId: string;
}

export function CampaignDetail({ campaignId }: CampaignDetailProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Fetch campaign
  const { data: campaign, isLoading } = useQuery<CampaignWithRelations>({
    queryKey: ['campaign', campaignId],
    queryFn: async () => {
      const response = await fetch(`/api/campaigns/${campaignId}`);
      if (!response.ok) throw new Error('Failed to fetch campaign');
      return response.json();
    },
  });

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: 'ACTIVE' | 'PAUSED') => {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update campaign');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaign', campaignId] });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      notifications.show({
        title: 'Status atualizado',
        message: 'Campanha atualizada com sucesso',
        color: 'green',
        icon: <IconCheck />,
      });
    },
  });

  // Delete mutation
  const deleteMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch(`/api/campaigns/${campaignId}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete campaign');
      return response.json();
    },
    onSuccess: () => {
      notifications.show({
        title: 'Campanha excluída',
        message: 'Campanha removida com sucesso',
        color: 'green',
        icon: <IconCheck />,
      });
      router.push('/campanhas');
    },
  });

  if (isLoading) {
    return (
      <Stack gap="xl">
        <Skeleton height={60} />
        <Skeleton height={200} />
        <Skeleton height={400} />
      </Stack>
    );
  }

  if (!campaign) {
    return (
      <Alert icon={<IconAlertCircle />} title="Campanha não encontrada" color="red">
        A campanha solicitada não existe ou foi removida.
      </Alert>
    );
  }

  const isLiquidation = campaign.type === 'LIQUIDATION';
  const percentage = campaign.discountPercentage || campaign.increasePercentage || 0;
  const Icon = isLiquidation ? IconDroplet : IconTrendingUp;
  const variations = campaign.variations as Array<{
    id: string;
    headline: string;
    subheadline: string;
    cta: string;
  }>;

  const statusConfig = {
    DRAFT: { color: 'gray', label: 'Rascunho' },
    ACTIVE: { color: 'green', label: 'Ativa' },
    PAUSED: { color: 'yellow', label: 'Pausada' },
    COMPLETED: { color: 'blue', label: 'Concluída' },
  };

  return (
    <>
      <Stack gap="xl">
        {/* Header */}
        <Group justify="space-between" align="flex-start">
          <Stack gap="xs">
            <Button
              variant="subtle"
              leftSection={<IconArrowLeft size={16} />}
              onClick={() => router.push('/campanhas')}
              size="sm"
            >
              Voltar
            </Button>
            <Group gap="xs">
              <Icon
                size={24}
                color={
                  isLiquidation ? 'var(--mantine-color-blue-6)' : 'var(--mantine-color-green-6)'
                }
              />
              <Title order={2}>{campaign.product.name}</Title>
            </Group>
            <Group gap="xs">
              <Badge variant="light" color={isLiquidation ? 'blue' : 'green'}>
                {isLiquidation ? 'Liquidação' : 'Oportunidade'}
              </Badge>
              <Badge variant="light" color={statusConfig[campaign.status].color}>
                {statusConfig[campaign.status].label}
              </Badge>
            </Group>
          </Stack>

          <Group gap="xs">
            {campaign.status === 'ACTIVE' && (
              <ActionIcon
                size="lg"
                variant="light"
                color="yellow"
                onClick={() => updateStatusMutation.mutate('PAUSED')}
                loading={updateStatusMutation.isPending}
              >
                <IconPlayerPause size={18} />
              </ActionIcon>
            )}

            {campaign.status === 'PAUSED' && (
              <ActionIcon
                size="lg"
                variant="light"
                color="green"
                onClick={() => updateStatusMutation.mutate('ACTIVE')}
                loading={updateStatusMutation.isPending}
              >
                <IconPlayerPlay size={18} />
              </ActionIcon>
            )}

            <Menu shadow="md" width={200}>
              <Menu.Target>
                <ActionIcon size="lg" variant="subtle">
                  <IconDots size={18} />
                </ActionIcon>
              </Menu.Target>

              <Menu.Dropdown>
                <Menu.Item
                  leftSection={<IconCopy size={16} />}
                  onClick={() => {
                    notifications.show({
                      title: 'Em breve',
                      message: 'Funcionalidade de duplicar em desenvolvimento',
                      color: 'blue',
                    });
                  }}
                >
                  Duplicar
                </Menu.Item>
                <Menu.Divider />
                <Menu.Item
                  color="red"
                  leftSection={<IconTrash size={16} />}
                  onClick={() => setDeleteModalOpen(true)}
                >
                  Excluir
                </Menu.Item>
              </Menu.Dropdown>
            </Menu>
          </Group>
        </Group>

        {/* Campaign Info */}
        <Paper withBorder p="lg" radius="md">
          <Stack gap="md">
            <Group align="flex-start" gap="lg">
              {campaign.product.image && (
                <Image
                  src={campaign.product.image}
                  alt={campaign.product.name}
                  w={160}
                  h={160}
                  fit="contain"
                  radius="md"
                />
              )}

              <Stack gap="sm" flex={1}>
                <div>
                  <Text size="sm" c="dimmed">
                    Produto
                  </Text>
                  <Text fw={500} size="lg">
                    {campaign.product.name}
                  </Text>
                  <Text size="sm" c="dimmed">
                    SKU: {campaign.product.sku}
                  </Text>
                </div>

                <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="md">
                  <div>
                    <Text size="xs" c="dimmed">
                      {isLiquidation ? 'Desconto' : 'Aumento'}
                    </Text>
                    <Text size="xl" fw={600} c={isLiquidation ? 'red' : 'green'}>
                      {percentage}%
                    </Text>
                  </div>
                  <div>
                    <Text size="xs" c="dimmed">
                      Tom de voz
                    </Text>
                    <Text size="md" fw={500} tt="capitalize">
                      {campaign.toneOfVoice}
                    </Text>
                  </div>
                  <div>
                    <Text size="xs" c="dimmed">
                      Criada
                    </Text>
                    <Text size="md" fw={500}>
                      {dayjs(campaign.createdAt).format('DD/MM/YYYY')}
                    </Text>
                  </div>
                  {campaign.startedAt && (
                    <div>
                      <Text size="xs" c="dimmed">
                        Iniciada
                      </Text>
                      <Text size="md" fw={500}>
                        {dayjs(campaign.startedAt).format('DD/MM/YYYY')}
                      </Text>
                    </div>
                  )}
                </SimpleGrid>
              </Stack>
            </Group>
          </Stack>
        </Paper>

        {/* Metrics (placeholder) */}
        {campaign.status === 'ACTIVE' && (
          <Paper withBorder p="lg" radius="md">
            <Title order={3} mb="md">
              📊 Métricas
            </Title>
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
              <Card padding="md" radius="md" withBorder>
                <Text size="sm" c="dimmed">
                  Cliques
                </Text>
                <Text size="xl" fw={700}>
                  {campaign.clicks}
                </Text>
              </Card>
              <Card padding="md" radius="md" withBorder>
                <Text size="sm" c="dimmed">
                  Conversões
                </Text>
                <Text size="xl" fw={700}>
                  {campaign.conversions}
                </Text>
              </Card>
              <Card padding="md" radius="md" withBorder>
                <Text size="sm" c="dimmed">
                  ROI
                </Text>
                <Text size="xl" fw={700}>
                  {campaign.roi ? `${campaign.roi.toFixed(1)}%` : '—'}
                </Text>
              </Card>
            </SimpleGrid>
            <Text size="sm" c="dimmed" mt="md">
              * Métricas serão populadas quando o tracking for implementado
            </Text>
          </Paper>
        )}

        {/* Variations */}
        <Paper withBorder p="lg" radius="md">
          <Group justify="space-between" mb="md">
            <Title order={3}>
              <IconSparkles size={24} style={{ verticalAlign: 'middle', marginRight: 8 }} />
              Variações Geradas
            </Title>
            <Badge size="lg" variant="light">
              {variations.length} variações
            </Badge>
          </Group>

          <Stack gap="md">
            {variations.map((variation, index) => (
              <Paper
                key={variation.id}
                withBorder
                p="lg"
                radius="md"
                style={{
                  backgroundColor:
                    campaign.selectedVariationId === variation.id
                      ? 'var(--mantine-color-blue-0)'
                      : undefined,
                }}
              >
                <Group justify="space-between" mb="md">
                  <Badge variant="light">Variação {index + 1}</Badge>
                  {campaign.selectedVariationId === variation.id && (
                    <Badge variant="filled" color="blue">
                      ✓ Selecionada
                    </Badge>
                  )}
                </Group>
                <Stack gap="sm">
                  <div>
                    <Text size="xs" c="dimmed" mb={4}>
                      Título Principal
                    </Text>
                    <Text fw={600} size="lg">
                      {variation.headline}
                    </Text>
                  </div>
                  <div>
                    <Text size="xs" c="dimmed" mb={4}>
                      Subtítulo
                    </Text>
                    <Text>{variation.subheadline}</Text>
                  </div>
                  <div>
                    <Text size="xs" c="dimmed" mb={4}>
                      Call-to-Action
                    </Text>
                    <Text fw={500} c="blue">
                      {variation.cta}
                    </Text>
                  </div>
                  <Group justify="flex-end" mt="sm">
                    <Button
                      size="xs"
                      variant="light"
                      leftSection={<IconCopy size={14} />}
                      onClick={() => {
                        const text = `${variation.headline}\n\n${variation.subheadline}\n\n${variation.cta}`;
                        navigator.clipboard.writeText(text);
                        notifications.show({
                          title: 'Copiado!',
                          message: 'Variação copiada para a área de transferência',
                          color: 'green',
                          icon: <IconCheck />,
                        });
                      }}
                    >
                      Copiar
                    </Button>
                  </Group>
                </Stack>
              </Paper>
            ))}
          </Stack>
        </Paper>
      </Stack>

      {/* Delete confirmation modal */}
      <Modal
        opened={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Excluir campanha"
        centered
      >
        <Stack gap="md">
          <Text size="sm">
            Tem certeza que deseja excluir esta campanha? Esta ação não pode ser desfeita.
          </Text>
          <Group justify="flex-end">
            <Button variant="default" onClick={() => setDeleteModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              color="red"
              onClick={() => deleteMutation.mutate()}
              loading={deleteMutation.isPending}
            >
              Excluir
            </Button>
          </Group>
        </Stack>
      </Modal>
    </>
  );
}
