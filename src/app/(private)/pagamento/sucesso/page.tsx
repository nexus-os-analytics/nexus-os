'use client';

import { Button, Container, Group, Loader, Stack, Text, Title } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export const dynamic = 'force-static';

export default function StripeSuccessPage() {
  const { data: session, update } = useSession();
  const [planActivated, setPlanActivated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Update session once on mount and check plan status
  useEffect(() => {
    let mounted = true;

    const checkPlanStatus = async () => {
      try {
        // Force session refresh to get latest plan status from database
        const updatedSession = await update();

        if (!mounted) return;

        if (updatedSession?.user?.planTier === 'PRO') {
          setPlanActivated(true);
        }
      } catch (error) {
        console.error('Error updating session:', error);
      } finally {
        if (mounted) {
          setIsLoading(false);
        }
      }
    };

    checkPlanStatus();

    return () => {
      mounted = false;
    };
  }, [update]);

  return (
    <Container size="sm" py="xl">
      <Stack align="center" gap="md">
        {isLoading ? (
          <>
            <Loader size="xl" color="brand" />
            <Title order={2}>Ativando seu Plano PRO...</Title>
            <Text ta="center" c="dimmed">
              Estamos processando sua assinatura. Isso pode levar alguns segundos.
            </Text>
          </>
        ) : planActivated ? (
          <>
            <IconCheck size={64} color="var(--mantine-color-green-6)" />
            <Title order={2}>Plano PRO Ativado!</Title>
            <Text ta="center" c="dimmed">
              Parabéns! Sua assinatura PRO foi confirmada e já está ativa. Aproveite todos os
              recursos premium da plataforma.
            </Text>
          </>
        ) : (
          <>
            <IconCheck size={64} color="var(--mantine-color-green-6)" />
            <Title order={2}>Pagamento Confirmado!</Title>
            <Text ta="center" c="dimmed">
              Sua assinatura está sendo processada. O plano PRO será ativado em breve. Você receberá
              um e-mail de confirmação quando tudo estiver pronto.
            </Text>
            <Text size="sm" c="dimmed" ta="center">
              Se o plano não for ativado em alguns minutos, entre em contato com o suporte.
            </Text>
          </>
        )}

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
