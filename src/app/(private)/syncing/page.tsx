'use client';

import { Center, Container, Loader, Stack, Text, Title } from '@mantine/core';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import { useEffect } from 'react';

export default function SyncingPage() {
  const { data: session, update } = useSession();
  const router = useRouter();

  useEffect(() => {
    const interval = setInterval(async () => {
      await update();
    }, 5000); // Poll every 5 seconds

    return () => clearInterval(interval);
  }, [update]);

  useEffect(() => {
    if (session?.user?.blingSyncStatus === 'COMPLETED') {
      router.push('/first-impact');
    }
    if (session?.user?.blingSyncStatus === 'FAILED') {
      // Handle failure (maybe redirect to bling page with error)
      router.push('/bling?error=sync_failed');
    }
  }, [session, router]);

  return (
    <Container size="sm" h="100vh">
      <Center h="100%">
        <Stack align="center" gap="md">
          <Loader size="xl" type="dots" />
          <Title order={2}>Importando produtos...</Title>
          <Text c="dimmed" ta="center">
            Estamos sincronizando seus produtos e gerando alertas inteligentes.
            <br />
            Isso pode levar alguns minutos.
          </Text>
        </Stack>
      </Center>
    </Container>
  );
}
