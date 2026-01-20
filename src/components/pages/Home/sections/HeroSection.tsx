'use client';
import { Button, Container, Stack, Text, Title } from '@mantine/core';
import Link from 'next/link';

export function HeroSection() {
  return (
    <Container id="hero" size="lg" pt="xl">
      <Stack gap="lg" align="center" ta="center" mb="xl">
        <Title order={1} maw={900}>
          Pare de perder{' '}
          <Text span c="brand.7" inherit>
            Vendas e Dinheiro
          </Text>{' '}
          no seu estoque.
        </Title>
        <Text c="dimmed" maw={760}>
          O Nexus OS conecta ao Bling, analisa seu estoque em tempo real e te alerta antes dos
          problemas para você agir com confiança.
        </Text>
        <Button
          component={Link}
          href="/cadastre-se"
          size="xl"
          variant="gradient"
          gradient={{ from: 'brand.6', to: 'brand.8', deg: 135 }}
        >
          Comece Agora
        </Button>
      </Stack>
    </Container>
  );
}
