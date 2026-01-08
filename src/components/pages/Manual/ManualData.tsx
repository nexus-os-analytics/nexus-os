'use client';
import { List, Stack, Text, Title } from '@mantine/core';

interface ManualDataProps {
  id?: string;
}

export function ManualData({ id = 'dados' }: ManualDataProps) {
  return (
    <section id={id}>
      <Stack gap="md">
        <Title order={2}>Dados coletados e análises realizadas</Title>
        <Text>O Nexus OS coleta e analisa:</Text>
        <List spacing="xs">
          <List.Item>Produtos e variações (códigos, categorias, custos, preços);</List.Item>
          <List.Item>Estoque atual, entradas e saídas, giro e cobertura;</List.Item>
          <List.Item>Pedidos e notas fiscais (volumes, margens, sazonalidade);</List.Item>
          <List.Item>Fornecedores e lead time (quando disponível).</List.Item>
        </List>
        <Text>Com isso, entregamos:</Text>
        <List spacing="xs">
          <List.Item>Alertas de excesso e ruptura por impacto financeiro;</List.Item>
          <List.Item>Oportunidades de preço e margem por categoria/produto;</List.Item>
          <List.Item>Recomendações de compra e redução de perdas;</List.Item>
          <List.Item>Relatórios operacionais claros e priorizados.</List.Item>
        </List>
      </Stack>
    </section>
  );
}
