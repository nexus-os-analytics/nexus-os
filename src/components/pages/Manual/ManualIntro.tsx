'use client';
import { Blockquote, List, Stack, Text, Title } from '@mantine/core';

interface ManualIntroProps {
  id?: string;
}

export function ManualIntro({ id = 'sobre' }: ManualIntroProps) {
  return (
    <section id={id}>
      <Stack gap="md">
        <Title order={2}>Sobre esta integração</Title>
        <Text>
          O <strong>Nexus OS</strong> se conecta ao <strong>Bling ERP</strong> para coletar dados
          operacionais e gerar análises, alertas e recomendações práticas focadas em aumento de
          margem e redução de perdas.
        </Text>
        <List spacing="xs">
          <List.Item>Centraliza métricas de estoque, compras e vendas;</List.Item>
          <List.Item>Detecta excessos, rupturas e oportunidades de preço;</List.Item>
          <List.Item>Ajuda a priorizar ações com impacto financeiro real.</List.Item>
        </List>
        <Blockquote color="brand.6">
          O objetivo não é substituir o ERP, mas potencializá-lo com camadas de inteligência,
          insights acionáveis e comunicação clara para o time.
        </Blockquote>
      </Stack>
    </section>
  );
}
