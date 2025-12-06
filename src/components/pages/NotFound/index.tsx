'use client';

import { Button, Container, Group, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { IconAlertTriangle } from '@tabler/icons-react';
import Link from 'next/link';

export interface NotFoundPageProps {
  message?: string;
  backHref?: string;
  backLabel?: string;
}

export function NotFoundPage({
  message = 'A página que você procura não foi encontrada.',
  backHref = '/',
  backLabel = 'Voltar para início',
}: NotFoundPageProps) {
  return (
    <Container size="sm" px="md">
      <Stack align="center" gap="sm" mt="xl">
        <ThemeIcon color="yellow" radius="xl" size={64}>
          <IconAlertTriangle size={32} />
        </ThemeIcon>
        <Title order={2}>404 — Não encontrado</Title>
        <Text c="dimmed" ta="center">
          {message}
        </Text>
        <Group mt="md">
          <Button component={Link} href={backHref} variant="filled">
            {backLabel}
          </Button>
          <Button component={Link} href="/private/dashboard" variant="light">
            Ir para o dashboard
          </Button>
        </Group>
      </Stack>
    </Container>
  );
}
