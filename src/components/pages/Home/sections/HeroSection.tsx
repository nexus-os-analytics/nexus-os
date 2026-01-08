'use client';
import { Badge, Button, Container, Group, Stack, Text, TextInput, Title } from '@mantine/core';
import { IconCheck } from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';
import { useMemo, useState } from 'react';

export function HeroSection() {
  const [email, setEmail] = useState('');
  const signupHref = useMemo(() => {
    const base = '/cadastre-se';
    if (!email) return base;
    const params = new URLSearchParams({ email });
    return `${base}?${params.toString()}`;
  }, [email]);

  return (
    <Container id="hero" size="lg" pt="xl" pb="lg">
      <Stack align="center" gap="lg">
        <Title order={1} ta="center" maw={900}>
          Pare de perder{' '}
          <Text span c="brand.7" inherit>
            Vendas e Dinheiro
          </Text>{' '}
          no seu estoque.
        </Title>
        <Text ta="center" c="dimmed" maw={760}>
          Nexus analisa automaticamente o Bling e alerta antes dos problemas.
        </Text>

        <Group wrap="wrap" justify="center">
          <TextInput
            size="md"
            placeholder="seu@email.com"
            value={email}
            onChange={(e) => setEmail(e.currentTarget.value)}
            leftSection="@"
          />
          <Link href={signupHref}>
            <Button
              size="md"
              variant="gradient"
              gradient={{ from: 'brand.6', to: 'brand.8', deg: 135 }}
            >
              Começar Gratuitamente
            </Button>
          </Link>
        </Group>

        <Group gap="sm" justify="center">
          <Badge leftSection={<IconCheck size={14} />} variant="light" color="gray">
            Sem cartão de crédito
          </Badge>
          <Badge leftSection={<IconCheck size={14} />} variant="light" color="gray">
            Cancele quando quiser
          </Badge>
          <Badge leftSection={<IconCheck size={14} />} variant="light" color="gray">
            Integração oficial Bling
          </Badge>
        </Group>

        <Stack align="center" mt="lg">
          <div style={{ position: 'relative', maxWidth: 980, width: '100%' }}>
            <Image
              src="/img/product_placeholder.webp"
              alt="Dashboard Nexus OS"
              width={980}
              height={560}
              priority
              style={{ borderRadius: 12, border: '1px solid var(--mantine-color-gray-3)' }}
            />

            {/* Callouts */}
            <Badge style={{ position: 'absolute', top: 16, left: 16 }} color="red" variant="filled">
              R$ 11.700 parados há 95 dias
            </Badge>
            <Badge
              style={{ position: 'absolute', bottom: 16, left: 16 }}
              color="yellow"
              variant="filled"
            >
              3 produtos em risco de ruptura
            </Badge>
            <Badge
              style={{ position: 'absolute', bottom: 16, right: 16 }}
              color="green"
              variant="filled"
            >
              +150% vendas — produto em alta
            </Badge>
          </div>
          <Text c="dimmed" size="sm">
            O Nexus enxerga o que o Bling não mostra.
          </Text>
        </Stack>
      </Stack>
    </Container>
  );
}
