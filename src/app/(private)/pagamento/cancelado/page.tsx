'use client';

import { Button, Container, Group, Stack, Text, Title } from '@mantine/core';
import { IconX } from '@tabler/icons-react';
import Link from 'next/link';

export const dynamic = 'force-static';

export default function StripeCanceladoPage() {
  return (
    <Container size="sm" py="xl">
      <Stack align="center" gap="md">
        <IconX size={64} color="var(--mantine-color-red-6)" />
        <Title order={2}>Assinatura Cancelada</Title>
        <Text ta="center" c="dimmed">
          Você cancelou o processo de assinatura. Caso mude de ideia, você pode assinar a qualquer
          momento.
        </Text>
        <Group>
          <Button component={Link} href="/precos" variant="outline" color="brand">
            Ver planos novamente
          </Button>
          <Button component={Link} href="/" color="brand">
            Voltar para a página inicial
          </Button>
        </Group>
      </Stack>
    </Container>
  );
}
