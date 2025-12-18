'use client';
import { Button, Group, Select, Stack, TextInput, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useQuery } from '@tanstack/react-query';
import { useEffect, useState } from 'react';
import { deleteUserAction, updateUserAction } from '@/features/users/actions/user.actions';
import type { User } from '@/features/users/types/user';

interface Props {
  id: string;
}

export default function UserDetail({ id }: Props) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'USER' | 'ADMIN' | 'SUPER_ADMIN'>('USER');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const { data, isLoading } = useQuery<User>({
    queryKey: ['user', id],
    queryFn: async () => {
      const res = await fetch(`/api/users/${id}`);
      if (!res.ok) throw new Error('Falha ao carregar usuário');
      return (await res.json()) as User;
    },
  });

  useEffect(() => {
    if (data) {
      setName(data.name ?? '');
      setEmail(data.email ?? '');
      setRole(data.role);
      setPhone(data.phone ?? '');
    }
  }, [data]);

  const submit = async () => {
    setLoading(true);
    try {
      await updateUserAction({ id, name, role, phone });
      notifications.show({
        title: 'Usuário atualizado',
        message: 'Alterações salvas.',
        color: 'green',
      });
    } catch (e) {
      notifications.show({ title: 'Erro', message: (e as Error).message, color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  const remove = async () => {
    setLoading(true);
    try {
      await deleteUserAction(id);
      notifications.show({
        title: 'Usuário removido',
        message: 'Usuário marcado como inativo.',
        color: 'green',
      });
    } catch (e) {
      notifications.show({ title: 'Erro', message: (e as Error).message, color: 'red' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Stack>
      <Title order={3}>Editar Usuário</Title>
      <TextInput
        label="Nome"
        value={name}
        onChange={(e) => setName(e.currentTarget.value)}
        required
      />
      <TextInput label="E-mail" value={email} disabled />
      <TextInput label="Telefone" value={phone} onChange={(e) => setPhone(e.currentTarget.value)} />
      <Select
        label="Função"
        value={role}
        onChange={(val) => setRole((val ?? 'USER') as typeof role)}
        data={[
          { value: 'USER', label: 'Usuário' },
          { value: 'ADMIN', label: 'Administrador' },
          { value: 'SUPER_ADMIN', label: 'Super Admin' },
        ]}
      />
      <Group justify="space-between">
        <Button color="red" variant="outline" onClick={remove} disabled={isLoading || loading}>
          Remover
        </Button>
        <Button loading={loading} onClick={submit} color="green.8" disabled={isLoading}>
          Salvar alterações
        </Button>
      </Group>
    </Stack>
  );
}
