'use client';
import { Button, Group, Select, Stack, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useState } from 'react';

interface InviteUserFormProps {
  onSuccess: () => void;
}

export default function InviteUserForm({ onSuccess }: InviteUserFormProps) {
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
