'use client';
import { Button, Paper, Stack, Text, Title } from '@mantine/core';
import { useStripeCheckout } from '../services';

interface ProLockedStateProps {
  title?: string;
  description?: string;
  ctaLabel?: string;
}

export function ProLockedState({
  title = 'Recurso disponível no PRO',
  description = 'Faça o upgrade para desbloquear este recurso e acelerar seus resultados.',
  ctaLabel = 'Desbloquear no PRO',
}: ProLockedStateProps) {
  const { mutate: openCheckout, isPending } = useStripeCheckout();
  return (
    <Paper withBorder radius="md" p="xl">
      <Stack gap="sm" align="start">
        <Title order={3}>{title}</Title>
        <Text c="dimmed">{description}</Text>
        <Button onClick={() => openCheckout()} loading={isPending}>
          {ctaLabel}
        </Button>
      </Stack>
    </Paper>
  );
}
