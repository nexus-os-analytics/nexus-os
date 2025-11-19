'use client';
import { Alert, Button, Stack, Text } from '@mantine/core';
import { useMediaQuery } from '@mantine/hooks';
import Image from 'next/image';
import { useRouter } from 'next/navigation';

export function BlingConnectBanner() {
  const isMobile = useMediaQuery('(max-width: 768px)');
  const router = useRouter();

  return (
    <Alert color="green.9" variant="filled" radius="md" p="lg" mb="xl">
      <Stack
        gap="md"
        align={isMobile ? 'stretch' : 'center'}
        justify="space-between"
        style={{
          flexDirection: isMobile ? 'column' : 'row',
        }}
      >
        <Text fw={500} size="lg" c="white">
          Conecte sua conta{' '}
          <Text span fw={700}>
            Bling
          </Text>{' '}
          para sincronizar produtos e pedidos.
        </Text>
        <Button
          size={isMobile ? 'md' : 'lg'}
          variant="outline"
          color="white"
          radius="md"
          fullWidth={isMobile}
          rightSection={
            <Image src="/img/bling-logo-white.png" alt="Bling Logo" width={81} height={41} />
          }
          onClick={() => router.push('/bling')}
          styles={(theme) => ({
            root: {
              fontWeight: 600,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: 8,
              '&:hover': {
                backgroundColor: theme.colors.green[2],
              },
            },
          })}
        >
          Conectar
        </Button>
      </Stack>
    </Alert>
  );
}
