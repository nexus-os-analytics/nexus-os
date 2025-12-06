'use client';
import { Anchor, Button, Group, Paper, PasswordInput, Skeleton, Stack, Text } from '@mantine/core';
import { useForm } from '@mantine/form';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQueryString } from '@/hooks';
import { ResetPasswordSchema, useResetPassword, useVerifyResetToken } from '../../services';

export function ResetPassword() {
  const { getQueryParam } = useQueryString();
  const token = getQueryParam('token');
  const router = useRouter();
  const { isLoading, error } = useVerifyResetToken(token);
  const { mutateAsync: resetPassword, isPending } = useResetPassword();
  const form = useForm({
    initialValues: {
      token: token || '',
      password: '',
      confirmPassword: '',
    },
    validate: zod4Resolver(ResetPasswordSchema),
  });

  const handleSubmit = async (values: typeof form.values) => {
    if (!token) return;
    await resetPassword({
      token,
      password: values.password,
      confirmPassword: values.confirmPassword,
    });
    form.reset();
    router.push('/login');
  };

  if (isLoading) return <Skeleton height={400} radius="md" />;

  if (error)
    return (
      <Paper radius="md" p="lg" withBorder>
        <Stack>
          <Text ta="center" fz="lg" fw={500}>
            Ops! Algum erro ocorreu
          </Text>
          <Text c="dimmed" fz="sm" ta="center">
            O token de redefinição de senha é inválido ou expirou. Por favor, solicite um novo link
            de redefinição de senha{' '}
            <Anchor component={Link} href="/esqueci-minha-senha">
              clicando aqui
            </Anchor>
            .
          </Text>
        </Stack>
      </Paper>
    );

  return (
    <Paper radius="md" p="lg" withBorder>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          <PasswordInput
            label="Nova senha"
            placeholder="Insira sua nova senha"
            value={form.values.password}
            onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
            error={form.errors.password}
            radius="md"
          />

          <PasswordInput
            label="Confirmação de senha"
            placeholder="Confirme sua nova senha"
            value={form.values.confirmPassword}
            onChange={(event) => form.setFieldValue('confirmPassword', event.currentTarget.value)}
            error={form.errors.confirmPassword}
            radius="md"
          />
        </Stack>

        <Group justify="space-between" mt="xl">
          <Button type="submit" radius="xl" fullWidth loading={isPending}>
            Redefinir senha
          </Button>
        </Group>
      </form>
    </Paper>
  );
}
