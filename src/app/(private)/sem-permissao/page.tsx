'use client';
import { Button, Center, Stack, Text, Title } from '@mantine/core';
import Link from 'next/link';

export default function NotAllowedPage() {
  return (
    <Center>
      <Stack align="center" gap="lg">
        <Title order={2}>Não autorizado</Title>
        <Text>
          Você não tem permissão para acessar esta página. Por favor, entre em contato com o
          suporte.
        </Text>
        <Button component={Link} variant="filled" size="lg" href="/dashboard">
          Voltar ao Dashboard
        </Button>
      </Stack>
    </Center>
  );
}
