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
import { HTTP_STATUS } from '@/lib/constants/http-status';
import { TwoFactorQRCode } from '../../components/TwoFactorQRCode';
import { useAuth } from '../../context/AuthContext';
import { SignInSchema } from '../../services';

export function SignIn() {
  const [loading, setLoading] = useState(false);
  const { required2FA, status } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [isUnverified, setIsUnverified] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);
  const [resendMessageColor, setResendMessageColor] = useState<'green' | 'yellow' | 'red'>('green');
  const { getQueryParam } = useQueryString();
  const nextPage = '/bling';
  const planParam = (getQueryParam('plan') || '').toUpperCase();
  const redirect = planParam ? `/bling?plan=${planParam}` : getQueryParam('redirect') || nextPage;
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
    setIsUnverified(false);
    setResendMessage(null);

    const result = await signIn('credentials', {
      redirect: false,
      email: values.email,
      password: values.password,
      callbackUrl: required2FA ? nextPage : (redirect as string),
    });

    setLoading(false);

    if (result?.error) {
      // Verificar se a conta está não verificada para ajustar a mensagem
      try {
        const resp = await fetch(`/api/auth/is-verified?email=${encodeURIComponent(values.email)}`);
        if (resp.ok) {
          const data = (await resp.json()) as { verified: boolean };
          if (!data.verified) {
            setErrorMessage('Confirme seu e-mail para continuar.');
            setIsUnverified(true);
            return;
          }
        }
      } catch (_e) {
        // ignorar erros de verificação
      }
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
    // Check for account activation success
    const activated = getQueryParam('activated');
    if (activated === '1') {
      setSuccessMessage('Conta ativada com sucesso! Faça login para acessar a plataforma.');
      const emailParam = getQueryParam('email');
      if (typeof emailParam === 'string' && emailParam) {
        form.setFieldValue('email', emailParam);
      }
    }

    // Surface authentication errors forwarded by NextAuth (e.g., AccessDenied)
    const err = getQueryParam('error');
    if (err) {
      if (err === 'AccessDenied') {
        setErrorMessage('Conta desativada. Entre em contato com o suporte.');
      } else if (err === 'invalid_credentials') {
        setErrorMessage('E-mail ou senha inválidos');
      } else if (err === 'unverified') {
        setErrorMessage('Confirme seu e-mail para continuar.');
        setIsUnverified(true);
      } else {
        setErrorMessage('Falha na autenticação. Tente novamente.');
      }
    }

    if (status === 'authenticated' && !required2FA) {
      router.push(redirect as string);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status, required2FA, router, redirect, getQueryParam]);

  const handleResendVerification = async () => {
    setResendMessage(null);
    if (!form.values.email) {
      setResendMessage('Informe seu e-mail acima e tente novamente.');
      setResendMessageColor('yellow');
      return;
    }
    setResendLoading(true);
    try {
      const resp = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email: form.values.email }),
      });
      if (resp.status === HTTP_STATUS.TOO_MANY_REQUESTS) {
        setResendMessage('Você solicitou recentemente. Aguarde 1 minuto para reenviar.');
        setResendMessageColor('yellow');
      } else if (resp.ok) {
        setResendMessage('E-mail de verificação reenviado. Verifique sua caixa de entrada.');
        setResendMessageColor('green');
      } else {
        setResendMessage('Não foi possível reenviar o e-mail de verificação.');
        setResendMessageColor('red');
      }
    } catch {
      setResendMessage('Erro ao reenviar. Tente novamente em instantes.');
      setResendMessageColor('red');
    } finally {
      setResendLoading(false);
    }
  };

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
          {successMessage && (
            <Alert title="Sucesso!" color="green">
              {successMessage}
            </Alert>
          )}
          {errorMessage && (
            <Alert title="Ops! Algo deu errado" color="red">
              {errorMessage}
            </Alert>
          )}
          {isUnverified && (
            <Group justify="space-between">
              <Text c="dimmed" size="sm">
                Não recebeu o e-mail?
              </Text>
              <Button variant="light" onClick={handleResendVerification} loading={resendLoading}>
                Reenviar verificação
              </Button>
            </Group>
          )}
          {resendMessage && <Alert color={resendMessageColor}>{resendMessage}</Alert>}
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
