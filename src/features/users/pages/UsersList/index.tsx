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
import { useState } from 'react';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  avatar?: string | null;
  phone?: string | null;
  acceptedTerms: boolean;
  createdAt: string;
  isTwoFactorEnabled: boolean;
  failedAttempts: number;
  lockedUntil?: string | null;
}

function InviteUserForm({ onSuccess }: { onSuccess: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string | null>('USER');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/users/invite', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, role }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || 'Falha ao enviar convite');
      }
      notifications.show({
        title: 'Convite enviado',
        message: 'O usuário receberá um e-mail com instruções.',
        color: 'green',
      });
      onSuccess();
    } catch (e) {
      notifications.show({ title: 'Erro', message: (e as Error).message, color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack>
      <TextInput
        label="Nome"
        placeholder="Nome completo"
        value={name}
        onChange={(e) => setName(e.currentTarget.value)}
        required
      />
      <TextInput
        label="E-mail"
        placeholder="email@exemplo.com"
        value={email}
        onChange={(e) => setEmail(e.currentTarget.value)}
        required
      />
      <Select
        label="Função"
        data={[
          { value: 'USER', label: 'Usuário' },
          { value: 'ADMIN', label: 'Administrador' },
          { value: 'SUPER_ADMIN', label: 'Super Admin' },
        ]}
        value={role}
        onChange={setRole}
        required
      />
      <Group justify="flex-end">
        <Button loading={loading} onClick={submit} color="green.8">
          Enviar convite
        </Button>
      </Group>
    </Stack>
  );
}

export default function UsersList() {
  const modals = useModals();
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<string | null>(null);
  const [page, setPage] = useState(1);

  // Mock de dados (trocar por fetch da API)
  const users: User[] = Array.from({ length: 42 }).map((_, i) => ({
    id: crypto.randomUUID(),
    name: `Usuário ${i + 1}`,
    email: `usuario${i + 1}@exemplo.com`,
    role: i % 3 === 0 ? 'ADMIN' : 'USER',
    avatar: null,
    phone: '(11) 99999-0000',
    acceptedTerms: true,
    createdAt: new Date().toISOString(),
    isTwoFactorEnabled: i % 2 === 0,
    failedAttempts: Math.floor(Math.random() * 3),
  }));

  const filtered = users.filter(
    (u) =>
      (!roleFilter || u.role === roleFilter) &&
      (u.name.toLowerCase().includes(search.toLowerCase()) ||
        u.email.toLowerCase().includes(search.toLowerCase()))
  );

  const itemsPerPage = 10;
  const totalPages = Math.ceil(filtered.length / itemsPerPage);
  const paginated = filtered.slice((page - 1) * itemsPerPage, page * itemsPerPage);

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
        <Group align="end" mb="md">
          <TextInput
            label="Buscar usuário"
            placeholder="Nome ou e-mail"
            leftSection={<IconSearch size={16} />}
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
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
          />
        </Group>

        <Table striped highlightOnHover withTableBorder>
          <Table.Thead>
            <Table.Tr>
              <Table.Th>Usuário</Table.Th>
              <Table.Th>E-mail</Table.Th>
              <Table.Th>Função</Table.Th>
              <Table.Th>2FA</Table.Th>
              <Table.Th>Tentativas</Table.Th>
              <Table.Th>Criado em</Table.Th>
              <Table.Th></Table.Th>
            </Table.Tr>
          </Table.Thead>

          <Table.Tbody>
            {paginated.map((user) => (
              <Table.Tr key={user.id}>
                <Table.Td>
                  <Group>
                    <Avatar src={user.avatar} alt={user.name} radius="xl" color="green.7">
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
                  {user.isTwoFactorEnabled ? (
                    <Badge color="green">Ativo</Badge>
                  ) : (
                    <Badge color="gray">Inativo</Badge>
                  )}
                </Table.Td>
                <Table.Td>{user.failedAttempts}</Table.Td>
                <Table.Td>{new Date(user.createdAt).toLocaleDateString('pt-BR')}</Table.Td>
                <Table.Td>
                  <Group gap="xs">
                    <ActionIcon color="blue" variant="subtle">
                      <IconUserEdit size={16} />
                    </ActionIcon>
                    <ActionIcon color="red" variant="subtle">
                      <IconTrash size={16} />
                    </ActionIcon>
                  </Group>
                </Table.Td>
              </Table.Tr>
            ))}
          </Table.Tbody>
        </Table>

        <Group justify="center" mt="md">
          <Pagination total={totalPages} value={page} onChange={setPage} color="green" />
        </Group>
      </Card>
    </Stack>
  );
}
