'use client';
import {
  Accordion,
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
            R$ 0/mês — até 50 produtos, alertas básicos, sincronização diária
          </Text>
          <List size="sm" mt="sm">
            <List.Item>Alertas de ruptura básicos</List.Item>
            <List.Item>Capital parado (limitado)</List.Item>
            <List.Item>Conexão oficial Bling</List.Item>
          </List>
          <Link href="/cadastre-se">
            <Button mt="md" color="brand">
              Começar Grátis
            </Button>
          </Link>
        </Card>
        <Card withBorder>
          <Group justify="space-between" align="center">
            <Title order={3}>PRO</Title>
            <Group gap="xs">
              <Badge variant="light" color="yellow">
                14 dias grátis
              </Badge>
              <Text fw={600} c="brand.7">
                R$ 79,90/mês
              </Text>
            </Group>
          </Group>
          <Text c="dimmed" mt="xs">
            Produtos ilimitados, relatórios PDF, e-mails automáticos, suporte prioritário
          </Text>
          <List size="sm" mt="sm">
            <List.Item>Alertas inteligentes por e-mail</List.Item>
            <List.Item>Recomendações de compra e liquidação</List.Item>
            <List.Item>Relatórios exportáveis e históricos</List.Item>
          </List>
          <Group mt="md">
            <Link href="/precos">
              <Button variant="light">Ver detalhes</Button>
            </Link>
            <Link href="/cadastre-se">
              <Button color="brand">Experimentar PRO</Button>
            </Link>
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
        <Accordion.Item value="dias-gratis">
          <Accordion.Control>Como funcionam os 14 dias grátis do PRO?</Accordion.Control>
          <Accordion.Panel>
            Você testa todas as funcionalidades do PRO por 14 dias sem cobrança. Cancele a qualquer
            momento.
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
