'use client';

import { Button, Container, Group, Stack, Text, Title } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export const dynamic = 'force-static';

export default function StripeSuccessPage() {
  const { data: session, update } = useSession();

  const handleProfileUpdate = async () => {
    await update({
      user: {
        planTier: 'PRO', // Update the plan tier to PRO
      },
    });
  };

  useEffect(() => {
    if (session?.user?.planTier !== 'PRO') {
      handleProfileUpdate();
    }
  }, [session]);

  return (
    <Container size="sm" py="xl">
      <Stack align="center" gap="md">
        <IconCheck size={64} color="var(--mantine-color-green-6)" />
        <Title order={2}>Plano PRO Ativado!</Title>
        <Text ta="center" c="dimmed">
          Parabéns! Sua assinatura PRO foi confirmada e já está ativa. Aproveite todos os recursos
          premium da plataforma.
        </Text>
        <Text size="sm" c="dimmed" ta="center">
          Se o plano não for ativado em alguns minutos, entre em contato com o suporte.
        </Text>

        <Group mt="lg">
          <Button component={Link} href="/minha-conta" variant="outline" color="brand">
            Minha Conta
          </Button>
          <Button component={Link} href="/dashboard" color="brand">
            Acessar Dashboard
          </Button>
        </Group>
      </Stack>
    </Container>
  );
}
