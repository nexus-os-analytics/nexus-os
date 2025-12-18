'use client';
import { Button, Group, Select, Stack, TextInput, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';
import { createUserAction } from '@/features/users/actions/user.actions';

export default function UserNew() {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<string | null>('USER');
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);

  const submit = async () => {
    setLoading(true);
    try {
      await createUserAction({
        name,
        email,
        role: (role ?? 'USER') as 'USER' | 'ADMIN' | 'SUPER_ADMIN',
        phone,
      });
      notifications.show({
        title: 'Usuário criado',
        message: 'Cadastro realizado com sucesso.',
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
      <Title order={3}>Novo Usuário</Title>
      <TextInput
        label="Nome"
        value={name}
        onChange={(e) => setName(e.currentTarget.value)}
        required
      />
      <TextInput
        label="E-mail"
        value={email}
        onChange={(e) => setEmail(e.currentTarget.value)}
        required
      />
      <TextInput label="Telefone" value={phone} onChange={(e) => setPhone(e.currentTarget.value)} />
      <Select
        label="Função"
        value={role}
        onChange={setRole}
        data={[
          { value: 'USER', label: 'Usuário' },
          { value: 'ADMIN', label: 'Administrador' },
          { value: 'SUPER_ADMIN', label: 'Super Admin' },
        ]}
      />
      <Group justify="flex-end">
        <Button loading={loading} onClick={submit} color="green.8">
          Criar usuário
        </Button>
      </Group>
    </Stack>
  );
}
