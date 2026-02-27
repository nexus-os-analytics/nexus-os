'use client';

import { Badge, Button, Card, Container, Group, List, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import type { PlanTier } from '@prisma/client';
import Link from 'next/link';
import { useState } from 'react';
import { HTTP_STATUS } from '@/lib/constants/http-status';

interface TierCard {
  id: PlanTier | 'FREE' | 'PRO';
  name: string;
  description: string;
  priceLabel: string; // e.g., "R$ 0/mês" or "R$ 97/mês"
  secondaryLabel?: string; // e.g., "Grátis para sempre" ou texto pequeno abaixo do preço
  features: string[];
  plan: PlanTier;
  recommended?: boolean;
}

const tiers: TierCard[] = [
  {
    id: 'FREE',
    plan: 'FREE',
    name: 'Free',
    description: 'Para começar sem custo e validar o Nexus OS no seu dia a dia.',
    priceLabel: 'R$ 0/mês',
    secondaryLabel: 'Grátis para sempre',
    features: ['Até 30 produtos', 'Sync 1x/dia (automática)', 'Alertas básicos', 'Dashboard principal'],
  },
  {
    id: 'PRO',
    plan: 'PRO',
    name: 'PRO',
    description: 'Para operar em escala, com inteligência de ponta e integrações completas.',
    priceLabel: 'R$ 97/mês',
    secondaryLabel: 'Pagamentos via Cartão ou PIX • Cancele quando quiser',
    features: [
      'Produtos ilimitados',
      'Sync em tempo quase real e manual',
      'Alertas avançados e relatórios aprofundados',
      'Gerador IA de Campanhas',
      'Integração completa com Bling',
    ],
    recommended: true,
  },
];

export function Pricing() {
  const [loading, setLoading] = useState(false);

  async function startProCheckout() {
    try {
      setLoading(true);
      const res = await fetch('/api/stripe/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ plan: 'pro' }),
      });
      if (res.status === HTTP_STATUS.UNAUTHORIZED) {
        globalThis.location.href = '/login?plan=PRO';
        return;
      }
      const data = await res.json();
      if (data.url) {
        globalThis.location.href = data.url as string;
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <Container size="lg" py="xl">
      <Stack gap="md" align="center">
        <Title order={1}>Planos transparentes para cada momento</Title>
        <Text c="dimmed" ta="center" maw={700}>
          Sem surpresas, sem taxas escondidas. Cancele quando quiser.
        </Text>
      </Stack>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" mt="xl">
        {tiers.map((t) => (
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
                <Title order={2}>{t.priceLabel}</Title>
              </Group>
              {t.secondaryLabel ? (
                <Text size="sm" c="dimmed">
                  {t.secondaryLabel}
                </Text>
              ) : null}
            </Stack>
            <List spacing="xs" size="sm">
              {t.features.map((f) => (
                <List.Item key={f}>{f}</List.Item>
              ))}
            </List>
            {t.plan === 'PRO' ? (
              <Stack gap="xs" mt="md">
                <Button
                  onClick={startProCheckout}
                  loading={loading}
                  color="brand"
                  variant={t.recommended ? 'filled' : 'outline'}
                >
                  Assinar PRO com Cartão
                </Button>
                <Button
                  component={Link}
                  href="/pagamento/pix"
                  color="brand"
                  variant="light"
                >
                  Pagar PRO com PIX
                </Button>
              </Stack>
            ) : (
              <Button
                component={Link}
                mt="md"
                href={'/cadastre-se?plan=free'}
                color="brand"
                variant={t.recommended ? 'filled' : 'outline'}
              >
                Começar Grátis
              </Button>
            )}
          </Card>
        ))}
      </SimpleGrid>

      <Card withBorder radius="md" mt="xl">
        <Card.Section inheritPadding py="md">
          <Group justify="center">
            <Text fw={500}>Ficou com alguma dúvida?</Text>
          </Group>
        </Card.Section>
        <Card.Section inheritPadding pb="md" ta="center">
          <Text size="sm" c="dimmed">
            Mande um e-mail para nossa equipe que vamos te ajudar a escolher o melhor plano para o
            seu negócio.
          </Text>
          <Group mt="md" justify="center">
            <Button
              component="a"
              href="mailto:contato@nexusos.com.br"
              target="_blank"
              rel="noopener noreferrer"
              color="brand"
              variant="outline"
              fullWidth
              size="lg"
              style={{
                maxWidth: 350,
              }}
            >
              Falar com vendas
            </Button>
          </Group>
        </Card.Section>
      </Card>
    </Container>
  );
}
