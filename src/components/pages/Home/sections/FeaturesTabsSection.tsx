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
            <Tabs.Tab value="ruptura" fw={700} fz="lg">
              Alertas de Ruptura
            </Tabs.Tab>
            <Tabs.Tab value="capital" fw={700} fz="lg">
              Capital Parado
            </Tabs.Tab>
            <Tabs.Tab value="oportunidades" fw={700} fz="lg">
              Oportunidades
            </Tabs.Tab>
          </Tabs.List>

          <Tabs.Panel value="ruptura" pt="md">
            <Group align="flex-start" gap="xl" wrap="wrap">
              <Stack flex={1} gap="sm" maw={560}>
                <Title order={3}>Evite perda de vendas</Title>
                <Text c="dimmed">
                  Detectamos produtos antes de acabar seu estoque, considerando giro, lead time e
                  sazonalidade para priorizar o que mais impacta margem.
                </Text>
                <List size="sm">
                  <List.Item>Alertas preventivos com janela de reposição ideal</List.Item>
                  <List.Item>Priorização automática por margem e demanda</List.Item>
                  <List.Item>Recomendações de compra por fornecedor</List.Item>
                </List>
                <Text fw={500}>
                  Exemplo: 3 itens críticos (R$ 2.800) → 1º item: 4 dias de estoque, repor agora ·
                  2º item: 6 dias, combine compra com fornecedor · 3º item: 8 dias, monitorar.
                </Text>
              </Stack>
              <MantineImage
                src="/img/hero-image.png"
                alt="Dashboard de ruptura"
                radius="md"
                w={420}
              />
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
                  <List.Item>Estoque parado há 30+ dias com valor imobilizado</List.Item>
                  <List.Item>Simulações de liquidação por canal</List.Item>
                  <List.Item>Relatórios exportáveis por categoria e SKU</List.Item>
                </List>
                <Text fw={500}>
                  Exemplo: R$ 11.700 parados → Estratégia A: kit promocional limpa 60% em 10 dias ·
                  Estratégia B: campanha marketplace com desconto progressivo.
                </Text>
              </Stack>
              <MantineImage
                src="/img/auth-bg.jpg"
                alt="Dashboard de capital parado"
                radius="md"
                w={420}
              />
            </Group>
          </Tabs.Panel>

          <Tabs.Panel value="oportunidades" pt="md">
            <Group align="flex-start" gap="xl" wrap="wrap">
              <Stack flex={1} gap="sm" maw={560}>
                <Title order={3}>Antecipe as oportunidades</Title>
                <Text c="dimmed">
                  Antecipe a alta, lucre com isso, teste novas estratégias e coloque dinheiro no
                  bolso com planos de ação prontos.
                </Text>
                <List size="sm">
                  <List.Item>Itens com aceleração de vendas</List.Item>
                  <List.Item>Sugestão de reorder otimizado</List.Item>
                  <List.Item>Gatilhos para campanhas</List.Item>
                </List>
                <Text fw={500}>
                  Exemplo: Produto Z → +30% em 7 dias → aumente estoque em 20% e teste campanha ou
                  ajuste preço em +10% para capturar margem.
                </Text>
              </Stack>
              <MantineImage
                src="/img/hero-image.png"
                alt="Dashboard de oportunidades"
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
