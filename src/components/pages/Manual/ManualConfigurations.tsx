'use client';
import { List, Stack, Text, Title } from '@mantine/core';

interface ManualConfigurationsProps {
  id?: string;
}

export function ManualConfigurations({ id = 'configuracoes' }: ManualConfigurationsProps) {
  return (
    <section id={id}>
      <Stack gap="md">
        <Title order={2}>Configurações recomendadas</Title>
        <Text>Personalize conforme sua operação:</Text>
        <List spacing="xs">
          <List.Item>Limiares de excesso e ruptura por categoria;</List.Item>
          <List.Item>Perfil de cache e atualização de dados;</List.Item>
          <List.Item>Métricas de margem alvo e custo;</List.Item>
          <List.Item>Notificações por e-mail para alertas críticos.</List.Item>
        </List>
      </Stack>
    </section>
  );
}
