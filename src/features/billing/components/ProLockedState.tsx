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
    <Paper
      withBorder
      radius="md"
      p="xl"
      style={{
        background:
          'linear-gradient(135deg, var(--mantine-color-blue-6) 0%, var(--mantine-color-cyan-6) 100%)',
        borderColor: 'rgba(255, 255, 255, 0.2)',
      }}
    >
      <Stack gap="sm" align="start">
        <Title order={3} c="white">
          {title}
        </Title>
        <Text c="white" style={{ opacity: 0.9 }}>
          {description}
        </Text>
        <Button
          variant="outline"
          color="white"
          fullWidth
          onClick={() => openCheckout()}
          loading={isPending}
          styles={{
            root: {
              borderColor: 'white',
              color: 'white',
            },
          }}
        >
          {ctaLabel}
        </Button>
      </Stack>
    </Paper>
  );
}
