'use client';
import {
  Badge,
  Button,
  Card,
  Container,
  Group,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import {
  IconAlertTriangle,
  IconCash,
  IconChartBar,
  IconFileSpreadsheet,
} from '@tabler/icons-react';
import Link from 'next/link';

const problems: { title: string; value: string; desc: string; icon: React.ReactNode }[] = [
  {
    title: 'Produtos acabam sem aviso',
    value: '– R$ 2.800/mês',
    desc: 'Ruptura por falta de previsão e lead time ignorado.',
    icon: <IconAlertTriangle size={18} />,
  },
  {
    title: 'Dinheiro parado',
    value: 'R$ 15.000 travados',
    desc: 'Estoque que não vende consumindo caixa e espaço.',
    icon: <IconCash size={18} />,
  },
  {
    title: 'Horas perdidas no Excel',
    value: '15h/semana',
    desc: 'Planilhas manuais, dados desatualizados e erros humanos.',
    icon: <IconFileSpreadsheet size={18} />,
  },
  {
    title: 'Descobre oportunidades tarde',
    value: 'Receita deixada na mesa',
    desc: 'Itens em alta sem ação rápida para aproveitar demanda.',
    icon: <IconChartBar size={18} />,
  },
];

export function ProblemSection() {
  return (
    <Container id="problema" size="lg" py="xl">
      <Stack gap="sm" align="center">
        <Badge variant="light" color="gray">
          Você não está sozinho — 78% dos lojistas enfrentam isso
        </Badge>
        <Title ta="center" maw={800}>
          Esses problemas estão custando{' '}
          <Text span c="brand.7" inherit>
            caro
          </Text>{' '}
          para o seu negócio
        </Title>
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="md" mt="md" w="100%">
          {problems.map((p) => (
            <Card key={p.title} withBorder radius="md">
              <Group gap="sm">
                <ThemeIcon variant="light" color="gold" size={36} radius="md">
                  {p.icon}
                </ThemeIcon>
                <div>
                  <Title order={4}>{p.title}</Title>
                  <Text c="dimmed" size="sm">
                    {p.desc}
                  </Text>
                </div>
              </Group>
              <Text fw={600} mt="sm">
                {p.value}
              </Text>
            </Card>
          ))}
        </SimpleGrid>
        <Button component={Link} href="/precos" mt="md" size="md" variant="filled" color="brand">
          Resolver problemas agora
        </Button>
      </Stack>
    </Container>
  );
}
