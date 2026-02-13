'use client';
import { Alert, Anchor, Button, Group, Text } from '@mantine/core';
import { IconCrown } from '@tabler/icons-react';
import { useSession } from 'next-auth/react';
import { useStripeCheckout } from '../services';

export function UpgradeBanner() {
  const { data, status } = useSession();
  const { mutate: openCheckout, isPending } = useStripeCheckout();
  const plan = data?.user?.planTier ?? 'FREE';

  // Não renderizar durante carregamento ou se o plano não for FREE
  if (status === 'loading' || plan !== 'FREE') return null;

  return (
    <Alert variant="light" color="yellow" radius="md" icon={<IconCrown size={18} />} mb="md">
      <Group
        justify="space-between"
        align="center"
        wrap="wrap"
        style={{ flexDirection: 'column', alignItems: 'flex-start' }}
        hiddenFrom="sm"
      >
        <div>
          <Text fw={600}>Desbloqueie o Nexus OS PRO</Text>
          <Text size="sm" c="dimmed">
            Recursos avançados de alertas, relatórios e integração completa com Bling.
          </Text>
        </div>
        <Group gap="sm" wrap="nowrap" w="100%">
          <Button size="sm" onClick={() => openCheckout()} flex={1} loading={isPending}>
            Fazer upgrade
          </Button>
          <Anchor href="/precos" size="sm">
            Ver planos
          </Anchor>
        </Group>
      </Group>
      <Group justify="space-between" align="center" wrap="nowrap" visibleFrom="sm">
        <div>
          <Text fw={600}>Desbloqueie o Nexus OS PRO</Text>
          <Text size="sm" c="dimmed">
            Recursos avançados de alertas, relatórios e integração completa com Bling.
          </Text>
        </div>
        <Group gap="sm" wrap="nowrap">
          <Button size="sm" onClick={() => openCheckout()} loading={isPending}>
            Fazer upgrade
          </Button>
          <Anchor href="/precos" size="sm">
            Ver planos
          </Anchor>
        </Group>
      </Group>
    </Alert>
  );
}
