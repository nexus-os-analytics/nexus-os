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
  SegmentedControl,
  Stack,
  Text,
  TextInput,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { zod4Resolver } from 'mantine-form-zod-resolver';
import Link from 'next/link';
import { signIn } from 'next-auth/react';
import { useEffect, useState } from 'react';
import { GoogleButton } from '@/components/commons/GoogleButton';
import { useQueryString } from '@/hooks';
import axiosInstance from '@/lib/api';
import { SignUpSchema, useSignUp } from '../../services';

export function SignUp() {
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const { mutateAsync: signUp, isPending, error } = useSignUp();
  const { getQueryParam } = useQueryString();
  const planParam = (getQueryParam('plan') || '').toUpperCase();
  const [planTier, setPlanTier] = useState<'FREE' | 'PRO'>(planParam === 'PRO' ? 'PRO' : 'FREE');

  const form = useForm({
    initialValues: {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      terms: false,
      planTier,
    },
    validate: zod4Resolver(SignUpSchema),
  });

  const handleSubmit = async (values: typeof form.values) => {
    try {
      await signUp({
        name: values.name,
        email: values.email,
        password: values.password,
        confirmPassword: values.confirmPassword,
        terms: values.terms as true,
        planTier,
      });
      // Não autenticar automaticamente até verificação de e-mail
      // Se plano PRO, iniciar checkout do Stripe anonimamente
      if (planTier === 'PRO') {
        const res = await axiosInstance.post('/stripe/checkout-anon', { email: values.email });
        const url = res.data?.url as string | undefined;
        if (url) {
          window.location.href = url;
          return;
        }
      }
    } catch (error) {
      console.error('Error during sign up:', error);
    }
  };

  const handleGoogleSignIn = async () => {
    try {
      setLoading(true);
      await signIn('google', { callbackUrl: planParam ? `/bling?plan=${planParam}` : '/bling' });
    } catch (error) {
      console.error('Erro ao autenticar com o Google:', error);
      setErrorMessage('Erro ao autenticar com o Google. Tente novamente.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (error) {
      setErrorMessage('Não foi possível criar sua conta. Verifique os dados informados.');
    }
  }, [error]);

  return (
    <Paper radius="md" p="lg" withBorder>
      <form onSubmit={form.onSubmit(handleSubmit)}>
        <Stack>
          {errorMessage && (
            <Alert title="Ops! Algo deu errado" color="red">
              {errorMessage}
            </Alert>
          )}
          <Text ta="center" fz="lg" fw={500}>
            Criar uma conta
          </Text>
          <SegmentedControl
            value={planTier}
            onChange={(value) => setPlanTier(value as 'FREE' | 'PRO')}
            data={[
              { label: 'Plano FREE', value: 'FREE' },
              { label: 'Plano PRO', value: 'PRO' },
            ]}
          />
          <TextInput
            label="Name"
            placeholder="Seu nome"
            value={form.values.name}
            onChange={(event) => form.setFieldValue('name', event.currentTarget.value)}
            error={form.errors.name}
            radius="md"
          />

          <TextInput
            label="E-mail"
            placeholder="email@exemplo.com"
            value={form.values.email}
            onChange={(event) => form.setFieldValue('email', event.currentTarget.value)}
            error={form.errors.email}
            radius="md"
          />

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
          <Checkbox
            label="Aceito os termos e condições"
            checked={form.values.terms}
            onChange={(event) => form.setFieldValue('terms', event.currentTarget.checked)}
            error={form.errors.terms}
          />
          <Button type="submit" radius="xl" fullWidth loading={isPending || loading}>
            Criar conta
          </Button>
        </Group>
      </form>

      <Divider label="Ou continue com" labelPosition="center" my="lg" />

      <Group grow mb="md" mt="md">
        <GoogleButton radius="xl" loading={isPending || loading} onClick={handleGoogleSignIn}>
          Google
        </GoogleButton>
      </Group>

      <Group justify="center">
        <Anchor component={Link} href="/login" type="button" c="dimmed" size="xs" ta="center">
          Já tem uma conta? Entre agora!
        </Anchor>
      </Group>
    </Paper>
  );
}
