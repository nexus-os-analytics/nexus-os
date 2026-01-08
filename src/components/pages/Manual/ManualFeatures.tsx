'use client';
import { Blockquote, List, Stack, Title } from '@mantine/core';

interface ManualFeaturesProps {
  id?: string;
}

export function ManualFeatures({ id = 'funcionalidades' }: ManualFeaturesProps) {
  return (
    <section id={id}>
      <Stack gap="md">
        <Title order={2}>Funcionalidades principais</Title>
        <List spacing="xs">
          <List.Item>Dashboard financeiro com KPIs de margem, giro e cobertura;</List.Item>
          <List.Item>Alertas inteligentes por impacto e prioridade;</List.Item>
          <List.Item>Comparativos de custo vs preço por categoria/produto;</List.Item>
          <List.Item>Recomendações para compra e ajuste de preço;</List.Item>
          <List.Item>Relatórios exportáveis para equipe e gestão.</List.Item>
        </List>
        <Blockquote color="brand.6">
          Exemplo: Produtos com excesso receberão alerta com o valor imobilizado estimado e sugestão
          de ação (promoção, devolução, ajuste de compra).
        </Blockquote>
      </Stack>
    </section>
  );
}
