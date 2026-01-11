'use client';
import { Badge, Button, Card, Container, Group, Stack, Text, Title } from '@mantine/core';
import Link from 'next/link';

export function FinalCTASection() {
  return (
    <Container id="cta-final" size="lg" py="xl">
      <Card withBorder radius="md">
        <Stack align="center" gap="sm" ta="center">
          <Text fw={600}>🚀 Mais de 800 lojistas já usam</Text>
          <Title order={2}>Pare de perder dinheiro no seu estoque.</Title>
          <Text c="dimmed" maw={760}>
            Conecte seu Bling agora e veja em 2 minutos quanto capital você tem parado.
          </Text>
          <Group>
            <Link href="/cadastre-se">
              <Button
                size="md"
                variant="gradient"
                gradient={{ from: 'brand.6', to: 'brand.8', deg: 135 }}
              >
                Começar Grátis Agora
              </Button>
            </Link>
            <Button component="a" href="#como-funciona" size="md" variant="outline" color="brand">
              Ver Demonstração
            </Button>
          </Group>
          <Group gap="sm" mt="xs" justify="center">
            <Badge variant="light" color="yellow">
              14 dias grátis
            </Badge>
            <Badge variant="light" color="green">
              Sem cartão
            </Badge>
            <Badge variant="light" color="blue">
              Cancele quando quiser
            </Badge>
          </Group>
          <Text c="dimmed" size="sm" mt="sm">
            🛡️ Garantia: se você não economizar R$ 500 no primeiro mês, devolvemos 100% do seu
            dinheiro.
          </Text>
        </Stack>
      </Card>
    </Container>
  );
}
