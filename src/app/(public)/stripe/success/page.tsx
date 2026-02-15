'use client';

import { Button, Container, Group, Stack, Text, Title } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import Link from 'next/link';

export const dynamic = 'force-static';

export default function StripeSuccessPage() {
  return (
    <Container size="sm" py="xl">
      <Stack align="center" gap="md">
        <IconCheck size={64} color="var(--mantine-color-green-6)" />
        <Title order={2}>Assinatura Confirmada!</Title>
        <Text ta="center" c="dimmed">
          Obrigado por assinar o plano PRO. Sua assinatura está sendo processada e será ativada em
          alguns instantes. Você receberá um e-mail de confirmação em breve.
        </Text>
        <Group>
          <Button component={Link} href="/login" variant="outline" color="brand">
            Ir para o login
          </Button>
          <Button component={Link} href="/dashboard" color="brand">
            Acessar dashboard
          </Button>
        </Group>
      </Stack>
    </Container>
  );
}
