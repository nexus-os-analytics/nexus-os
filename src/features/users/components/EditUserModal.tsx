'use client';
import { zodResolver } from '@hookform/resolvers/zod';
import { Button, Group, Select, Stack, Switch, Text, TextInput } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import { Controller, useForm } from 'react-hook-form';
import { z } from 'zod';
import { toggleUserStatusAction, updateUserAction } from '@/features/users/actions/user.actions';
import type { User } from '@/features/users/types/user';

interface EditUserModalProps {
  user: User;
  onClose?: () => void;
}

const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 120;
const FormSchema = z.object({
  name: z
    .string()
    .min(NAME_MIN_LENGTH, 'Nome muito curto')
    .max(NAME_MAX_LENGTH, 'Nome muito longo'),
  email: z.string().email('E-mail inválido'),
  role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']),
  planTier: z.enum(['FREE', 'PRO']),
  active: z.boolean(),
});

type FormValues = z.infer<typeof FormSchema>;

export default function EditUserModal({ user, onClose }: EditUserModalProps) {
  const queryClient = useQueryClient();
  const [submitting, setSubmitting] = useState(false);

  const { control, handleSubmit } = useForm<FormValues>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      name: user.name,
      email: user.email,
      role: user.role,
      planTier: user.planTier ?? 'FREE',
      active: !user.deletedAt,
    },
    mode: 'onChange',
  });

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true);
    try {
      // Update basic fields
      await updateUserAction({
        id: user.id,
        name: values.name,
        email: values.email,
        role: values.role,
        planTier: values.planTier,
      });

      // Toggle status if changed
      const shouldBeInactive = !values.active;
      const isCurrentlyInactive = Boolean(user.deletedAt);
      if (shouldBeInactive !== isCurrentlyInactive) {
        await toggleUserStatusAction(user.id, shouldBeInactive);
      }

      notifications.show({
        title: 'Usuário atualizado',
        message: 'As informações foram salvas com sucesso.',
        color: 'green',
      });
      await queryClient.invalidateQueries({ queryKey: ['users'] });
      onClose?.();
    } catch (e) {
      notifications.show({
        title: 'Erro ao salvar',
        message: (e as Error).message,
        color: 'red',
      });
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)}>
      <Stack>
        <Controller
          name="name"
          control={control}
          render={({ field, fieldState }) => (
            <TextInput
              label="Nome"
              placeholder="Nome do usuário"
              {...field}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          name="email"
          control={control}
          render={({ field, fieldState }) => (
            <TextInput
              label="E-mail"
              placeholder="email@exemplo.com"
              {...field}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          name="role"
          control={control}
          render={({ field, fieldState }) => (
            <Select
              label="Função"
              data={[
                { value: 'USER', label: 'Usuário' },
                { value: 'ADMIN', label: 'Administrador' },
                { value: 'SUPER_ADMIN', label: 'Super Admin' },
              ]}
              {...field}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          name="planTier"
          control={control}
          render={({ field, fieldState }) => (
            <Select
              label="Plano"
              data={[
                { value: 'FREE', label: 'FREE' },
                { value: 'PRO', label: 'PRO' },
              ]}
              {...field}
              error={fieldState.error?.message}
            />
          )}
        />
        <Controller
          name="active"
          control={control}
          render={({ field }) => (
            <Group justify="space-between" align="center">
              <Text>Status</Text>
              <Switch
                checked={field.value}
                onChange={(e) => field.onChange(e.currentTarget.checked)}
                label={field.value ? 'Ativo' : 'Inativo'}
              />
            </Group>
          )}
        />
        <Group justify="flex-end" mt="md">
          <Button variant="default" onClick={onClose} disabled={submitting}>
            Cancelar
          </Button>
          <Button type="submit" color="green" loading={submitting}>
            Salvar
          </Button>
        </Group>
      </Stack>
    </form>
  );
}
