'use client';
import {
  Accordion,
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
            R$ 0/mês — até 30 produtos, integrações Bling e Shopee, alertas no Dashboard
          </Text>
          <List size="sm" mt="sm">
            <List.Item>Máximo de produtos: 30</List.Item>
            <List.Item>Somente integração com Bling</List.Item>
            <List.Item>Somente integração com Shopee</List.Item>
            <List.Item>Alertas básicas pelo Dashboard</List.Item>
          </List>
          <Group mt="md">
            <Button component={Link} href="/cadastre-se?plan=free" color="brand">
              Começar Grátis
            </Button>
          </Group>
        </Card>
        <Card withBorder>
          <Group justify="space-between" align="center">
            <Title order={3}>PRO</Title>
            <Group gap="xs">
              <Text fw={600} c="brand.7">
                R$ 97,00/mês
              </Text>
            </Group>
          </Group>
          <Text c="dimmed" mt="xs">
            Produtos ilimitados, múltiplos ERPs e Marketplaces, alertas avançadas e relatórios
          </Text>
          <List size="sm" mt="sm">
            <List.Item>Máximo de produtos: Ilimitado</List.Item>
            <List.Item>Integração com Múltiplos ERPs (Bling, Tiny, etc)</List.Item>
            <List.Item>
              Integração com Múltiplos Marketplaces (Shopee, Mercado Livre, etc)
            </List.Item>
            <List.Item>Alertas avançadas por Dashboard e E-mail</List.Item>
            <List.Item>Recomendações de compra e liquidação de estoque</List.Item>
            <List.Item>Relatórios personalizados</List.Item>
          </List>
          <Group mt="md">
            <Button component={Link} href="/precos" color="brand" variant="outline">
              Ver detalhes
            </Button>
            <Button component={Link} href="/cadastre-se?plan=pro" color="brand">
              Experimentar PRO
            </Button>
          </Group>
        </Card>
      </SimpleGrid>

      <Accordion mt="lg" variant="separated">
        <Accordion.Item value="preco-gratuito">
          <Accordion.Control>O plano Free é realmente gratuito?</Accordion.Control>
          <Accordion.Panel>
            Sim. O plano Free não exige cartão e pode ser usado indefinidamente com limites.
          </Accordion.Panel>
        </Accordion.Item>
        <Accordion.Item value="cancelamento">
          <Accordion.Control>Posso cancelar quando quiser?</Accordion.Control>
          <Accordion.Panel>
            Sim. O cancelamento é instantâneo e você não será cobrado novamente.
          </Accordion.Panel>
        </Accordion.Item>
      </Accordion>
    </Container>
  );
}
