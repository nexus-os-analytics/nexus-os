'use client';

import {
  Badge,
  Button,
  Card,
  Container,
  Group,
  List,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import Link from 'next/link';

interface Tier {
  id: string;
  name: string;
  description: string;
  priceLabel: string; // e.g., "R$ 0/mês" or "R$ 97,00/mês"
  features: string[];
  recommended?: boolean;
}

const tiers: Tier[] = [
  {
    id: 'free',
    name: 'Free',
    description: 'Para começar sem custo',
    priceLabel: 'R$ 0/mês',
    features: [
      'Máximo de produtos: 30',
      'Somente integração com Bling',
      'Somente integração com Shopee',
      'Alertas básicas pelo Dashboard',
    ],
  },
  {
    id: 'pro',
    name: 'PRO',
    description: 'Para operar com escala e inteligência',
    priceLabel: 'R$ 97,00/mês',
    features: [
      'Máximo de produtos: Ilimitado',
      'Integração com Múltiplos ERPs (Bling, Tiny, etc)',
      'Integração com Múltiplos Marketplaces (Shopee, Mercado Livre, etc)',
      'Alertas avançadas por Dashboard e E-mail',
      'Recomendações de compra e liquidação de estoque',
      'Relatórios personalizados',
    ],
    recommended: true,
  },
];

export function Pricing() {
  return (
    <Container size="lg" py="xl">
      <Stack gap="md" align="center">
        <Title order={1}>Planos e Preços</Title>
        <Text c="dimmed" ta="center" maw={700}>
          Escolha o plano ideal para o seu negócio.
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
              <Text size="sm" c="dimmed">
                Sem taxas ocultas. Cancele quando quiser.
              </Text>
            </Stack>
            <List spacing="xs" size="sm">
              {t.features.map((f) => (
                <List.Item key={f}>{f}</List.Item>
              ))}
            </List>
            <Button
              component={Link}
              mt="md"
              href={t.id === 'pro' ? '/cadastre-se?plan=pro' : '/cadastre-se?plan=free'}
              color="brand"
              variant={t.recommended ? 'filled' : 'outline'}
            >
              {t.id === 'pro' ? 'Experimentar PRO' : 'Começar Grátis'}
            </Button>
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
