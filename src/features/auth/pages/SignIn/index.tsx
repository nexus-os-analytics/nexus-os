'use client';
import {
  Alert,
  Anchor,
  Button,
  Checkbox,
  Divider,
  Group,
  Paper,
  PasswordInput,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { GoogleButton } from '@/components/commons/GoogleButton';
import { useQueryString } from '@/hooks';
import { TwoFactorQRCode } from '../../components/TwoFactorQRCode';
import { useAuth } from '../../context/AuthContext';
import { SignInSchema } from '../../services';

export function SignIn() {
  const [loading, setLoading] = useState(false);
  const { required2FA, status } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { getQueryParam } = useQueryString();
  const nextPage = '/bling';
  const redirect = getQueryParam('redirect') || nextPage;
  const router = useRouter();

  const form = useForm({
    initialValues: {
      email: '',
      password: '',
      remember: false,
    },
    validate: zod4Resolver(SignInSchema),
  });

  const handleSign = async (values: typeof form.values) => {
    setLoading(true);
    setErrorMessage(null);

    const result = await signIn('credentials', {
      redirect: false,
      email: values.email,
      password: values.password,
      callbackUrl: required2FA ? nextPage : (redirect as string),
    });

    setLoading(false);

    if (result?.error) {
      setErrorMessage('E-mail ou senha inválidos');
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signIn('google', { callbackUrl: redirect as string });
    } catch (error) {
      console.error('Erro ao autenticar com o Google:', error);
      setErrorMessage('Erro ao autenticar com o Google. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === 'authenticated' && !required2FA) {
      router.push(redirect as string);
    }
  }, [status, required2FA, router, redirect]);

  if (required2FA)
    return (
      <TwoFactorQRCode
        onSuccess={async (code) => {
          await signIn('credentials', {
            redirect: true,
            email: form.values.email,
            password: form.values.password,
            code,
            callbackUrl: redirect,
          });
        }}
      />
    );

  return (
    <Paper radius="md" p="lg" withBorder>
      <form onSubmit={form.onSubmit(handleSign)}>
        <Stack>
          {errorMessage && (
            <Alert title="Ops! Algo deu errado" color="red">
              {errorMessage}
            </Alert>
          )}
          <Text ta="center" fz="lg" fw={500}>
            Acesse sua conta
          </Text>
          <TextInput
            label="E-mail"
            placeholder="email@exemplo.com"
            disabled={loading}
            value={form.values.email}
            onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
            error={form.errors.email}
            radius="md"
          />

          <PasswordInput
            label="Senha"
            placeholder="Sua senha"
            disabled={loading}
            value={form.values.password}
            onChange={(event) => form.setFieldValue('password', event.currentTarget.value)}
            error={form.errors.password}
            radius="md"
          />

          <Checkbox
            label="Manter-me conectado"
            checked={form.values.remember}
            disabled={loading}
            onChange={(event) => form.setFieldValue('remember', event.currentTarget.checked)}
          />
        </Stack>

        <Group justify="space-between" mt="xl">
          <Anchor component={Link} href="/esqueci-minha-senha" type="button" c="dimmed" size="xs">
            Esqueceu sua senha?
          </Anchor>
          <Button type="submit" radius="xl" loading={loading}>
            Entrar
          </Button>
        </Group>
      </form>

      <Divider label="Ou continue com" labelPosition="center" my="lg" />

      <Group grow mb="md" mt="md">
        <GoogleButton radius="xl" loading={loading} onClick={handleGoogleSignIn}>
          Google
        </GoogleButton>
      </Group>

      <Group justify="center">
        <Anchor component={Link} href="/cadastre-se" type="button" c="dimmed" size="xs" ta="center">
          Não tem uma conta? Crie uma agora!
        </Anchor>
      </Group>
    </Paper>
  );
}
