/**
 * Campaign Card Component
 *
 * Displays campaign summary with quick actions
 */

'use client';

import { useState } from 'react';
import {
  Paper,
  Stack,
  Group,
  Text,
  Badge,
  Button,
  ActionIcon,
  Menu,
  Image,
  Modal,
} from '@mantine/core';
import {
  IconDots,
  IconEye,
  IconPlayerPause,
  IconPlayerPlay,
  IconTrash,
  IconCopy,
  IconCheck,
  IconDroplet,
  IconTrendingUp,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import type { CampaignWithRelations } from '@/features/campaigns/types';
import { formatCurrency } from '@/lib/utils';
import dayjs from 'dayjs';
import relativeTime from 'dayjs/plugin/relativeTime';
import 'dayjs/locale/pt-br';

dayjs.extend(relativeTime);
dayjs.locale('pt-br');

interface CampaignCardProps {
  campaign: CampaignWithRelations;
}

export function CampaignCard({ campaign }: CampaignCardProps) {
  const router = useRouter();
  const queryClient = useQueryClient();
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);

  // Status badge config
  const statusConfig = {
    DRAFT: { color: 'gray', label: 'Rascunho' },
    ACTIVE: { color: 'green', label: 'Ativa' },
    PAUSED: { color: 'yellow', label: 'Pausada' },
    COMPLETED: { color: 'blue', label: 'Concluída' },
  };

  // Update status mutation
  const updateStatusMutation = useMutation({
    mutationFn: async (newStatus: 'ACTIVE' | 'PAUSED') => {
      const response = await fetch(`/api/campaigns/${campaign.id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) throw new Error('Failed to update campaign');
      return response.json();
    },
    onSuccess: () => {
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
      const response = await fetch(`/api/campaigns/${campaign.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete campaign');
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      notifications.show({
        title: 'Campanha excluída',
        message: 'Campanha removida com sucesso',
        color: 'green',
        icon: <IconCheck />,
      });
      setDeleteModalOpen(false);
    },
  });

  const isLiquidation = campaign.type === 'LIQUIDATION';
  const percentage = campaign.discountPercentage || campaign.increasePercentage || 0;
  const Icon = isLiquidation ? IconDroplet : IconTrendingUp;

  return (
    <>
      <Paper withBorder p="md" radius="md">
        <Group align="flex-start" justify="space-between" wrap="nowrap">
          <Group align="flex-start" gap="md" flex={1}>
            {/* Product image */}
            {campaign.product.image && (
              <Image
                src={campaign.product.image}
                alt={campaign.product.name}
                w={80}
                h={80}
                fit="contain"
                radius="sm"
              />
            )}

            {/* Campaign info */}
            <Stack gap="xs" flex={1}>
              <Group gap="xs" wrap="wrap">
                <Icon
                  size={18}
                  color={
                    isLiquidation ? 'var(--mantine-color-blue-6)' : 'var(--mantine-color-green-6)'
                  }
                />
                <Badge variant="light" color={isLiquidation ? 'blue' : 'green'}>
                  {isLiquidation ? 'Liquidação' : 'Oportunidade'}
                </Badge>
                <Badge variant="light" color={statusConfig[campaign.status].color}>
                  {statusConfig[campaign.status].label}
                </Badge>
              </Group>

              <div>
                <Text fw={500} size="md">
                  {campaign.product.name}
                </Text>
                <Text size="xs" c="dimmed">
                  SKU: {campaign.product.sku}
                </Text>
              </div>

              <Group gap="md">
                <div>
                  <Text size="xs" c="dimmed">
                    {isLiquidation ? 'Desconto' : 'Aumento'}
                  </Text>
                  <Text size="sm" fw={600} c={isLiquidation ? 'red' : 'green'}>
                    {percentage}%
                  </Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed">
                    Tom
                  </Text>
                  <Text size="sm" fw={500} tt="capitalize">
                    {campaign.toneOfVoice}
                  </Text>
                </div>
                <div>
                  <Text size="xs" c="dimmed">
                    Criada
                  </Text>
                  <Text size="sm" fw={500}>
                    {dayjs(campaign.createdAt).fromNow()}
                  </Text>
                </div>
                {campaign.status === 'ACTIVE' && campaign.startedAt && (
                  <div>
                    <Text size="xs" c="dimmed">
                      Iniciada
                    </Text>
                    <Text size="sm" fw={500}>
                      {dayjs(campaign.startedAt).fromNow()}
                    </Text>
                  </div>
                )}
              </Group>

              {/* Metrics (placeholder for future) */}
              {campaign.status === 'ACTIVE' && (
                <Group gap="md">
                  <Text size="xs" c="dimmed">
                    📊 Cliques: {campaign.clicks} | Conversões: {campaign.conversions}
                  </Text>
                </Group>
              )}
            </Stack>
          </Group>

          {/* Actions */}
          <Group gap="xs">
            <Button
              size="sm"
              variant="light"
              leftSection={<IconEye size={16} />}
              onClick={() => router.push(`/campanhas/${campaign.id}`)}
            >
              Ver
            </Button>

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
                  leftSection={<IconEye size={16} />}
                  onClick={() => router.push(`/campanhas/${campaign.id}`)}
                >
                  Ver detalhes
                </Menu.Item>
                <Menu.Item
                  leftSection={<IconCopy size={16} />}
                  onClick={() => {
                    // TODO: Implement duplicate
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
      </Paper>

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
