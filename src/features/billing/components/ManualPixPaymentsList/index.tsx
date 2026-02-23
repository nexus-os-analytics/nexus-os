'use client';

import {
  Badge,
  Button,
  Group,
  Pagination,
  Select,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconCheck, IconX } from '@tabler/icons-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useCallback, useMemo, useState } from 'react';
import type { PixPaymentStatus } from '@prisma/client';

interface PaymentItem {
  id: string;
  amount: number;
  status: PixPaymentStatus;
  pixExternalId: string;
  createdAt: string;
  updatedAt: string;
  user: { id: string; name: string | null; email: string };
}

interface ListResponse {
  items: PaymentItem[];
  total: number;
  page: number;
  pageSize: number;
}

const STATUS_OPTIONS = [
  { value: '', label: 'Todos' },
  { value: 'AGUARDANDO_PAGAMENTO', label: 'Aguardando' },
  { value: 'PAGAMENTO_CONFIRMADO', label: 'Confirmado' },
  { value: 'PAGAMENTO_RECUSADO', label: 'Recusado' },
  { value: 'EXPIRADO', label: 'Expirado' },
];

const PAGE_SIZE = 20;

function formatCurrency(value: number) {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleString('pt-BR');
}

function StatusBadge({ status }: { status: PixPaymentStatus }) {
  const color =
    status === 'PAGAMENTO_CONFIRMADO'
      ? 'green'
      : status === 'PAGAMENTO_RECUSADO' || status === 'EXPIRADO'
        ? 'red'
        : 'yellow';
  const label =
    status === 'AGUARDANDO_PAGAMENTO'
      ? 'Aguardando'
      : status === 'PAGAMENTO_CONFIRMADO'
        ? 'Confirmado'
        : status === 'PAGAMENTO_RECUSADO'
          ? 'Recusado'
          : 'Expirado';
  return <Badge color={color}>{label}</Badge>;
}

export function ManualPixPaymentsList() {
  const queryClient = useQueryClient();
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const queryKey = useMemo(
    () => ['payments', 'pix', 'list', { status: statusFilter, page }],
    [statusFilter, page]
  );

  const { data, isLoading } = useQuery<ListResponse>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (statusFilter ?? '') params.set('status', statusFilter!);
      params.set('page', String(page));
      params.set('pageSize', String(PAGE_SIZE));
      const res = await fetch(`/api/payments/pix/list?${params.toString()}`);
      if (!res.ok) throw new Error('Falha ao carregar pagamentos');
      return res.json() as Promise<ListResponse>;
    },
  });

  const updateStatus = useCallback(
    async (paymentId: string, newStatus: 'PAGAMENTO_CONFIRMADO' | 'PAGAMENTO_RECUSADO') => {
      const res = await fetch(`/api/payments/pix/${paymentId}/status`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: newStatus }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error((json as { error?: string }).error ?? 'Falha ao atualizar status');
      }
    },
    []
  );

  const handleConfirm = useCallback(
    (id: string) => {
      void (async () => {
        try {
          await updateStatus(id, 'PAGAMENTO_CONFIRMADO');
          notifications.show({
            title: 'Status atualizado',
            message: 'Pagamento confirmado. O usuário será notificado por e-mail.',
            color: 'green',
          });
          await queryClient.invalidateQueries({ queryKey: ['payments', 'pix'] });
        } catch (e) {
          notifications.show({
            title: 'Erro',
            message: (e as Error).message,
            color: 'red',
          });
        }
      })();
    },
    [updateStatus, queryClient]
  );

  const handleReject = useCallback(
    (id: string) => {
      void (async () => {
        try {
          await updateStatus(id, 'PAGAMENTO_RECUSADO');
          notifications.show({
            title: 'Status atualizado',
            message: 'Pagamento marcado como recusado. O usuário será notificado.',
            color: 'yellow',
          });
          await queryClient.invalidateQueries({ queryKey: ['payments', 'pix'] });
        } catch (e) {
          notifications.show({
            title: 'Erro',
            message: (e as Error).message,
            color: 'red',
          });
        }
      })();
    },
    [updateStatus, queryClient]
  );

  const items = data?.items ?? [];
  const totalPages = Math.ceil((data?.total ?? 0) / (data?.pageSize ?? PAGE_SIZE));

  return (
    <Stack gap="lg">
      <Title order={3}>Pagamentos PIX</Title>

      <Group>
        <Select
          label="Status"
          placeholder="Filtrar por status"
          data={STATUS_OPTIONS}
          value={statusFilter ?? ''}
          onChange={(v) => {
            setStatusFilter(v || null);
            setPage(1);
          }}
          clearable
          w={200}
        />
      </Group>

      {isLoading ? (
        <Text c="dimmed">Carregando...</Text>
      ) : (
        <>
          <Table striped highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Data</Table.Th>
                <Table.Th>Usuário</Table.Th>
                <Table.Th>Valor</Table.Th>
                <Table.Th>ID</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th>Ações</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {items.map((p) => (
                <Table.Tr key={p.id}>
                  <Table.Td>{formatDate(p.createdAt)}</Table.Td>
                  <Table.Td>
                    <Stack gap={0}>
                      <Text size="sm" fw={500}>
                        {p.user.name ?? '—'}
                      </Text>
                      <Text size="xs" c="dimmed">
                        {p.user.email}
                      </Text>
                    </Stack>
                  </Table.Td>
                  <Table.Td>{formatCurrency(p.amount)}</Table.Td>
                  <Table.Td>
                    <Text size="xs" ff="monospace">
                      {p.pixExternalId}
                    </Text>
                  </Table.Td>
                  <Table.Td>
                    <StatusBadge status={p.status} />
                  </Table.Td>
                  <Table.Td>
                    {p.status === 'AGUARDANDO_PAGAMENTO' && (
                      <Group gap="xs">
                        <Button
                          size="xs"
                          color="green"
                          leftSection={<IconCheck size={14} />}
                          onClick={() => handleConfirm(p.id)}
                        >
                          Confirmar
                        </Button>
                        <Button
                          size="xs"
                          color="red"
                          variant="light"
                          leftSection={<IconX size={14} />}
                          onClick={() => handleReject(p.id)}
                        >
                          Recusar
                        </Button>
                      </Group>
                    )}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
          </Table>

          {items.length === 0 && (
            <Text c="dimmed" ta="center" py="xl">
              Nenhum pagamento encontrado.
            </Text>
          )}

          {totalPages > 1 && (
            <Group justify="center" mt="md">
              <Pagination total={totalPages} value={page} onChange={setPage} />
            </Group>
          )}
        </>
      )}
    </Stack>
  );
}
