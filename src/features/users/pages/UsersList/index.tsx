'use client';
import {
  ActionIcon,
  Avatar,
  Badge,
  Button,
  Card,
  Group,
  Pagination,
  Select,
  Stack,
  Table,
  Text,
  TextInput,
} from '@mantine/core';
import { useModals } from '@mantine/modals';
import { notifications } from '@mantine/notifications';
import { IconSearch, IconTrash, IconUserEdit } from '@tabler/icons-react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { deleteUserAction } from '@/features/users/actions/user.actions';
// removed unused router
import EditUserModal from '@/features/users/components/EditUserModal';
import { PAGE_SIZE_DEFAULT } from '../../constants';
import type { User } from '../../types/user';
import InviteUserForm from './InviteUserForm';

export default function UsersList() {
  const modals = useModals();
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [statusFilter, setStatusFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  const queryKey = useMemo(
    () => [
      'users',
      { search, role: roleFilter, status: statusFilter, page, pageSize: PAGE_SIZE_DEFAULT },
    ],
    [search, roleFilter, statusFilter, page]
  );
  const { data, isLoading, isError } = useQuery<{
    items: User[];
    total: number;
    page: number;
    pageSize: number;
  }>({
    queryKey,
    queryFn: async () => {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (roleFilter) params.set('role', roleFilter);
      if (statusFilter) params.set('status', statusFilter);
      params.set('page', String(page));
      params.set('pageSize', String(PAGE_SIZE_DEFAULT));
      const res = await fetch(`/api/users?${params.toString()}`);
      if (!res.ok) throw new Error('Falha ao carregar usuários');
      return (await res.json()) as { items: User[]; total: number; page: number; pageSize: number };
    },
  });

  useEffect(() => {
    if (isError) {
      // Could notify if desired
    }
  }, [isError]);

  const items = data?.items ?? [];
  const totalPages = Math.ceil((data?.total ?? 0) / (data?.pageSize ?? PAGE_SIZE_DEFAULT));

  const onEdit = (user: User) => {
    modals.openModal({
      title: 'Editar usuário',
      children: <EditUserModal user={user} onClose={() => modals.closeAll()} />,
    });
  };

  const onDelete = (id: string, name: string) => {
    modals.openConfirmModal({
      title: 'Excluir usuário',
      children: <Text>Tem certeza que deseja excluir "{name}"?</Text>,
      labels: { confirm: 'Excluir', cancel: 'Cancelar' },
      confirmProps: { color: 'red' },
      onConfirm: () => {
        void (async () => {
          try {
            await deleteUserAction(id);
            notifications.show({
              title: 'Usuário excluído',
              message: 'A lista foi atualizada.',
              color: 'green',
            });
            await queryClient.invalidateQueries({ queryKey: ['users'] });
          } catch (e) {
            notifications.show({
              title: 'Erro ao excluir',
              message: (e as Error).message,
              color: 'red',
            });
          }
        })();
      },
    });
  };

  return (
    <Stack>
      <Group justify="space-between" mb="md">
        <Text fw={700} size="xl">
          Gerenciar Usuários
        </Text>
        <Button
          color="green.8"
          radius="md"
          onClick={() =>
            modals.openModal({
              title: 'Convidar novo usuário',
              children: <InviteUserForm onSuccess={() => modals.closeAll()} />,
            })
          }
        >
          Convidar Usuário
        </Button>
      </Group>

      <Card withBorder radius="md" p="md">
        <Group align="end" mb="md" wrap="wrap" gap="md">
          <TextInput
            label="Buscar usuário"
            placeholder="Nome ou e-mail"
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            style={{ flexGrow: 1, minWidth: 200 }}
          />
          <Select
            label="Filtrar por função"
            placeholder="Todos"
            data={[
              { value: 'USER', label: 'Usuário' },
              { value: 'ADMIN', label: 'Administrador' },
              { value: 'SUPER_ADMIN', label: 'Super Admin' },
            ]}
            value={roleFilter}
            onChange={setRoleFilter}
            clearable
            style={{ flexGrow: 1, minWidth: 150 }}
          />
          <Select
            label="Status"
            placeholder="Todos"
            data={[
              { value: 'active', label: 'Ativo' },
              { value: 'inactive', label: 'Inativo' },
            ]}
            value={statusFilter}
            onChange={setStatusFilter}
            clearable
            style={{ flexGrow: 1, minWidth: 120 }}
          />
        </Group>

        <Table.ScrollContainer minWidth={800}>
          <Table striped highlightOnHover withTableBorder>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Usuário</Table.Th>
                <Table.Th>E-mail</Table.Th>
                <Table.Th>Função</Table.Th>
                <Table.Th>Status</Table.Th>
                <Table.Th hiddenFrom="sm">Tentativas</Table.Th>
                <Table.Th hiddenFrom="sm">Criado em</Table.Th>
                <Table.Th></Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {isLoading && (
                <Table.Tr>
                  <Table.Td colSpan={7}>
                    <Text>Carregando...</Text>
                  </Table.Td>
                </Table.Tr>
              )}
              {!isLoading && items.length === 0 && (
                <Table.Tr>
                  <Table.Td colSpan={7}>
                    <Text>Nenhum usuário encontrado</Text>
                  </Table.Td>
                </Table.Tr>
              )}
              {!isLoading &&
                items.length > 0 &&
                items.map((user: User) => (
                  <Table.Tr key={user.id}>
                    <Table.Td>
                      <Group>
                        <Avatar
                          src={user.image ?? undefined}
                          alt={user.name}
                          radius="xl"
                          color="green.7"
                        >
                          {user.name[0]}
                        </Avatar>
                        <Text fw={500}>{user.name}</Text>
                      </Group>
                    </Table.Td>
                    <Table.Td>{user.email}</Table.Td>
                    <Table.Td>
                      <Badge color={user.role === 'ADMIN' ? 'blue' : 'gray'}>{user.role}</Badge>
                    </Table.Td>
                    <Table.Td>
                      {!user.deletedAt ? (
                        <Badge color="green">Ativo</Badge>
                      ) : (
                        <Badge color="gray">Inativo</Badge>
                      )}
                    </Table.Td>
                    <Table.Td hiddenFrom="sm">{user.failedAttempts}</Table.Td>
                    <Table.Td hiddenFrom="sm">
                      {new Date(user.createdAt).toLocaleDateString('pt-BR')}
                    </Table.Td>
                    <Table.Td>
                      <Group gap="xs">
                        <ActionIcon color="blue" variant="subtle" onClick={() => onEdit(user)}>
                          <IconUserEdit size={16} />
                        </ActionIcon>
                        <ActionIcon
                          color="red"
                          variant="subtle"
                          onClick={() => onDelete(user.id, user.name)}
                        >
                          <IconTrash size={16} />
                        </ActionIcon>
                      </Group>
                    </Table.Td>
                  </Table.Tr>
                ))}
            </Table.Tbody>
          </Table>
        </Table.ScrollContainer>

        <Group justify="center" mt="md">
          <Pagination total={totalPages} value={page} onChange={setPage} color="green" />
        </Group>
      </Card>
    </Stack>
  );
}
