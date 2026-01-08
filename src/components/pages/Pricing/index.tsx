'use client';

import {
  Badge,
  Button,
  Card,
  Container,
  Divider,
  Group,
  List,
  SegmentedControl,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import Link from 'next/link';
import { useMemo, useState } from 'react';

interface Tier {
  id: string;
  name: string;
  description: string;
  monthly: number;
  yearly: number; // billed yearly, per month equivalent
  features: string[];
  recommended?: boolean;
}

const tiers: Tier[] = [
  {
    id: 'starter',
    name: 'Starter',
    description: 'Para começar e testar o produto',
    monthly: 49,
    yearly: 39,
    features: ['Até 1 usuário', 'Relatórios básicos', 'Suporte por email'],
  },
  {
    id: 'pro',
    name: 'Pro',
    description: 'Para equipes que precisam de performance',
    monthly: 99,
    yearly: 79,
    features: [
      'Até 5 usuários',
      'Dashboards avançados',
      'Integração com Bling',
      'Suporte prioritário',
    ],
    recommended: true,
  },
  {
    id: 'enterprise',
    name: 'Enterprise',
    description: 'Soluções sob medida para grandes operações',
    monthly: 249,
    yearly: 199,
    features: [
      'Usuários ilimitados',
      'SLA dedicado',
      'Onboarding e treinamento',
      'Recursos avançados e customização',
    ],
  },
];

export function Pricing() {
  const [billing, setBilling] = useState<'mensal' | 'anual'>('mensal');

  const displayTiers = useMemo(() => {
    return tiers.map((t) => ({
      ...t,
      price: billing === 'mensal' ? t.monthly : t.yearly,
      suffix: billing === 'mensal' ? '/mês' : '/mês (cobrança anual)',
    }));
  }, [billing]);

  return (
    <Container size="lg" py="xl">
      <Stack gap="md" align="center">
        <Title order={1}>Planos e Preços</Title>
        <Text c="dimmed" ta="center" maw={700}>
          Escolha o plano ideal para o seu negócio. Economize com a opção anual.
        </Text>

        <SegmentedControl
          value={billing}
          onChange={(v) => setBilling(v as 'mensal' | 'anual')}
          data={[
            { label: 'Mensal', value: 'mensal' },
            { label: 'Anual', value: 'anual' },
          ]}
        />
      </Stack>

      <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg" mt="xl">
        {displayTiers.map((t) => (
          <Card key={t.id} shadow="sm" radius="md" withBorder>
            <Group justify="space-between" align="flex-start">
              <Stack gap={4}>
                <Title order={3}>{t.name}</Title>
                <Text size="sm" c="dimmed">
                  {t.description}
                </Text>
              </Stack>
              {t.recommended ? (
                <Badge color="blue" variant="filled">
                  Recomendado
                </Badge>
              ) : null}
            </Group>

            <Stack mt="md" gap={4}>
              <Group align="baseline" gap={6}>
                <Title order={2}>R$ {t.price}</Title>
                <Text c="dimmed">{t.suffix}</Text>
              </Group>
              <Text size="sm" c="dimmed">
                Sem taxas ocultas. Cancele quando quiser.
              </Text>
            </Stack>

            <Divider my="md" />

            <List spacing="xs" size="sm">
              {t.features.map((f) => (
                <List.Item key={f}>{f}</List.Item>
              ))}
            </List>

            <Link href="/auth/cadastre-se">
              <Button fullWidth mt="md" size="md" variant={t.recommended ? 'filled' : 'light'}>
                Começar com {t.name}
              </Button>
            </Link>
          </Card>
        ))}
      </SimpleGrid>

      <Card withBorder radius="md" mt="xl">
        <Card.Section inheritPadding py="md">
          <Group justify="space-between">
            <Text fw={500}>Perguntas Frequentes</Text>
          </Group>
        </Card.Section>
        <Card.Section inheritPadding pb="md">
          <Text size="sm" c="dimmed">
            Precisa de ajuda para escolher? Fale com nosso time e encontre o plano ideal.
          </Text>
          <Link href="/public/contato">
            <Button mt="md" variant="subtle">
              Falar com vendas
            </Button>
          </Link>
        </Card.Section>
      </Card>
    </Container>
  );
}
