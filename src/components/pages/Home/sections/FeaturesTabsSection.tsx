'use client';
import {
  Button,
  Container,
  Group,
  List,
  Image as MantineImage,
  Stack,
  Tabs,
  Text,
  Title,
} from '@mantine/core';
import Link from 'next/link';

export function FeaturesTabsSection() {
  return (
    <Container id="funcionalidades" size="lg" py="xl">
      <Stack gap="lg" align="center">
        <Title ta="center">Funcionalidades</Title>
        <Text ta="center" c="dimmed" maw={760}>
          Inteligência prática — Nexus não só mostra dados, ele te diz o que fazer.
        </Text>

        <Tabs defaultValue="ruptura" mt="md" w="100%">
          <Tabs.List grow>
            <Tabs.Tab value="ruptura">Alertas de Ruptura</Tabs.Tab>
            <Tabs.Tab value="capital">Capital Parado</Tabs.Tab>
            <Tabs.Tab value="oportunidades">Oportunidades</Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="ruptura" pt="md">
            <Group align="flex-start" gap="xl" wrap="wrap">
              <Stack flex={1} gap="sm" maw={560}>
                <Title order={3}>Evite perda de vendas</Title>
                <Text c="dimmed">
                  Detectamos produtos em risco antes da ruptura, considerando giro, lead time e
                  sazonalidade.
                </Text>
                <List size="sm">
                  <List.Item>Repor antes de acabar</List.Item>
                  <List.Item>Priorização por margem e demanda</List.Item>
                  <List.Item>Alertas por e-mail</List.Item>
                </List>
                <Text fw={500}>Exemplo: 3 itens críticos — R$ 2.800 em risco</Text>
              </Stack>
              <MantineImage src="/img/product_placeholder.webp" alt="Ruptura" radius="md" w={420} />
            </Group>
          </Tabs.Panel>

          <Tabs.Panel value="capital" pt="md">
            <Group align="flex-start" gap="xl" wrap="wrap">
              <Stack flex={1} gap="sm" maw={560}>
                <Title order={3}>Identifique produtos encalhados</Title>
                <Text c="dimmed">
                  Mostramos capital parado por categoria, idade do estoque e chance de liquidação.
                </Text>
                <List size="sm">
                  <List.Item>Estoque parado há 90+ dias</List.Item>
                  <List.Item>Recomendação de preço de liquidação</List.Item>
                  <List.Item>Relatórios exportáveis</List.Item>
                </List>
                <Text fw={500}>Exemplo: R$ 11.700 parados — 12 SKUs</Text>
              </Stack>
              <MantineImage
                src="/img/product_placeholder.webp"
                alt="Capital Parado"
                radius="md"
                w={420}
              />
            </Group>
          </Tabs.Panel>

          <Tabs.Panel value="oportunidades" pt="md">
            <Group align="flex-start" gap="xl" wrap="wrap">
              <Stack flex={1} gap="sm" maw={560}>
                <Title order={3}>Detecte crescimento e momentum</Title>
                <Text c="dimmed">
                  Aproveite picos de demanda com recomendações de compra e campanhas.
                </Text>
                <List size="sm">
                  <List.Item>Itens com aceleração de vendas</List.Item>
                  <List.Item>Sugestão de reorder otimizado</List.Item>
                  <List.Item>Gatilhos para campanhas</List.Item>
                </List>
                <Text fw={500}>Exemplo: +150% em 7 dias — abasteça já</Text>
              </Stack>
              <MantineImage
                src="/img/product_placeholder.webp"
                alt="Oportunidades"
                radius="md"
                w={420}
              />
            </Group>
          </Tabs.Panel>
        </Tabs>
        <Button component={Link} href="/precos" variant="filled" color="brand" size="xl">
          Começar Grátis
        </Button>
      </Stack>
    </Container>
  );
}
