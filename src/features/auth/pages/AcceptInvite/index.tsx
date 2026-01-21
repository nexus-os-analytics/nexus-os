'use client';
import { Anchor, Button, Group, Paper, PasswordInput, Skeleton, Stack, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { z } from 'zod';
import { useAcceptInvitation, useVerifyInvitation } from '@/features/users/services';
import { useQueryString } from '@/hooks';

const MIN_PASSWORD_LENGTH = 6;
const AcceptInviteSchema = z
  .object({
    token: z.string().min(1, 'Token é obrigatório'),
    password: z.string().min(MIN_PASSWORD_LENGTH, 'A senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z
      .string()
      .min(MIN_PASSWORD_LENGTH, 'A confirmação de senha deve ter pelo menos 6 caracteres'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

export function AcceptInvite() {
  const { getQueryParam } = useQueryString();
  const token = getQueryParam('invite');
  const router = useRouter();
  const { data: verifyData, isLoading, error } = useVerifyInvitation(token);
  const { mutateAsync: acceptInvitation, isPending } = useAcceptInvitation();

  const form = useForm({
    initialValues: {
      token: token || '',
      password: '',
      confirmPassword: '',
    },
    validate: zod4Resolver(AcceptInviteSchema),
  });

  // Token is taken from query string at mount via initialValues

  const handleSubmit = async (values: typeof form.values) => {
    if (!token) return;
    const res = await acceptInvitation({
      token,
      password: values.password,
      confirmPassword: values.confirmPassword,
    });

    // Auto sign-in and redirect to /bling
    if (res?.email) {
      await signIn('credentials', {
        email: res.email,
        password: values.password,
        callbackUrl: '/bling',
        redirect: true,
      });
    } else {
      router.push('/login');
    }
  };

  if (isLoading) return <Skeleton height={400} radius="md" />;

  if (error || !verifyData?.isValid) {
    return (
      <Paper radius="md" p="lg" withBorder>
        <Stack>
          <Text ta="center" fz="lg" fw={500}>
            Ops! Algum erro ocorreu
          </Text>
          <Text c="dimmed" fz="sm" ta="center">
            O convite é inválido ou expirou. Solicite um novo convite ao administrador ou crie uma
            conta manualmente{' '}
            <Anchor component={Link} href="/cadastre-se">
              clicando aqui
            </Anchor>
            .
          </Text>
        </Stack>
      </Paper>
    );
  }

  return (
    <Paper radius="md" p="lg" withBorder>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <Text ta="center" fz="lg" fw={500}>
            Defina sua senha para ativar sua conta
          </Text>
          <Text ta="center" c="dimmed" fz="sm">
            E-mail convidado: <strong>{verifyData?.email}</strong>
          </Text>

          <PasswordInput
            label="Senha"
            placeholder="Sua senha"
            value={form.values.password}
            onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
            error={form.errors.password}
            radius="md"
          />

          <PasswordInput
            label="Confirmação de senha"
            placeholder="Confirme sua senha"
            value={form.values.confirmPassword}
            onChange={(event) => form.setFieldValue('confirmPassword', event.currentTarget.value)}
            error={form.errors.confirmPassword}
            radius="md"
          />
        </Stack>

        <Group justify="space-between" mt="xl">
          <Button type="submit" radius="xl" fullWidth loading={isPending}>
            Ativar conta
          </Button>
        </Group>
      </form>
    </Paper>
  );
}
