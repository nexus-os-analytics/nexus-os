'use client';
import { Card, Container, Grid, List, Stack, Text, Title } from '@mantine/core';

const steps = [
  {
    emoji: '🔗',
    title: 'Conecte seu Bling',
    desc: 'Em poucos cliques, sem senha, sem complicação.',
  },
  {
    emoji: '⚡',
    title: 'Análise Automática',
    desc: 'Processamos seus dados e detectamos riscos e oportunidades.',
  },
  {
    emoji: '📊',
    title: 'Alertas Inteligentes',
    desc: 'Você recebe avisos antes do problema acontecer.',
  },
  {
    emoji: '🎯',
    title: 'Tome Ação',
    desc: 'Recomendações práticas para repor, liquidar ou aproveitar momentum.',
  },
];

export function HowItWorksSection() {
  return (
    <Container id="como-funciona" size="lg" py="xl">
      <Stack gap="sm" align="center">
        <Title ta="center" maw={840}>
          Como o Nexus OS resolve isso para você (em menos de 5 minutos)
        </Title>
        <Text ta="center" c="dimmed" maw={760}>
          Implantação instantânea e segura — sem senha, sem complicação.
        </Text>

        <Grid mt="md" gutter="md">
          {steps.map((s, i) => (
            <Grid.Col key={`works-section-step-${i}`} span={{ base: 12, sm: 6 }}>
              <Card withBorder radius="md">
                <Title order={4}>
                  {s.emoji} {s.title}
                </Title>
                <Text c="dimmed" mt="xs">
                  {s.desc}
                </Text>
              </Card>
            </Grid.Col>
          ))}
        </Grid>

        <Card withBorder radius="md" mt="md" maw={900}>
          <Title order={5}>Demonstração rápida (2 min)</Title>
          <Text c="dimmed" size="sm" mt="xs">
            Insira aqui um vídeo de demonstração quando disponível; por enquanto, usamos este espaço
            para descrever o fluxo.
          </Text>
          <List size="sm" mt="sm">
            <List.Item>Conecte com OAuth ao Bling</List.Item>
            <List.Item>Sincronize produtos e estoques</List.Item>
            <List.Item>Receba alertas e recomendações</List.Item>
          </List>
        </Card>
      </Stack>
    </Container>
  );
}
