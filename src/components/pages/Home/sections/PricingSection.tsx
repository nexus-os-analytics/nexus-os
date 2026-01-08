'use client';
import { Button, Card, Container, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import Link from 'next/link';

export function PricingSection() {
  return (
    <Container id="precos" size="lg" py="xl">
      <Stack align="center" gap="sm">
        <Title ta="center">Planos</Title>
        <Text c="dimmed" ta="center">
          Sem cartão de crédito • Cancele quando quiser
        </Text>
      </Stack>
      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg" mt="md">
        <Card withBorder>
          <Title order={3}>Free</Title>
          <Text c="dimmed" mt="xs">
            R$ 0/mês — 50 produtos, alertas básicos, sincronização diária
          </Text>
          <Link href="/cadastre-se">
            <Button mt="md" color="brand">
              Começar Grátis
            </Button>
          </Link>
        </Card>
        <Card withBorder>
          <Group justify="space-between">
            <Title order={3}>PRO</Title>
            <Text fw={600} c="brand.7">
              R$ 79,90/mês
            </Text>
          </Group>
          <Text c="dimmed" mt="xs">
            Produtos ilimitados, relatórios PDF, e-mails automáticos, suporte prioritário
          </Text>
          <Link href="/precos">
            <Button mt="md" variant="light">
              Ver detalhes
            </Button>
          </Link>
        </Card>
      </SimpleGrid>
    </Container>
  );
}
