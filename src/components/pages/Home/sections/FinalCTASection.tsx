'use client';
import { Button, Card, Container, Group, Stack, Text, Title } from '@mantine/core';
import Link from 'next/link';

export function FinalCTASection() {
  return (
    <Container id="cta-final" size="lg" py="xl">
      <Card withBorder radius="md">
        <Stack align="center" gap="sm" ta="center">
          <Text fw={600}>🚀 Mais de 17 lojistas já usam</Text>
          <Title order={2}>Pare de perder dinheiro no seu estoque.</Title>
          <Text c="dimmed" maw={760}>
            Conecte seu Bling agora e veja em 2 minutos quanto capital você tem parado.
          </Text>
          <Group mt="md">
            <Button component={Link} href="/precos" color="brand" variant="outline">
              Ver detalhes
            </Button>
            <Button component={Link} href="/cadastre-se?plan=pro" color="brand">
              Experimentar PRO
            </Button>
          </Group>
        </Stack>
      </Card>
    </Container>
  );
}
