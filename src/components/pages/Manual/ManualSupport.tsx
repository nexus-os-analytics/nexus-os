'use client';
import { Anchor, List, Stack, Text, Title } from '@mantine/core';

interface ManualSupportProps {
  id?: string;
}

export function ManualSupport({ id = 'suporte' }: ManualSupportProps) {
  return (
    <section id={id}>
      <Stack gap="md">
        <Title order={2}>Suporte e ajuda</Title>
        <Text>Precisa de ajuda? Fale com nosso time ou acesse materiais de apoio.</Text>
        <List spacing="xs">
          <List.Item>
            Documentação:{' '}
            <Anchor href="mailto:contato@nexusos.com.br">contato@nexusos.com.br</Anchor>
          </List.Item>
          <List.Item>
            Suporte e ajuda:{' '}
            <Anchor href="mailto:contato@nexusos.com.br">contato@nexusos.com.br</Anchor>
          </List.Item>
          <List.Item>Base de conhecimento (em breve)</List.Item>
          <List.Item>Onboarding assistido para planos empresariais</List.Item>
        </List>
      </Stack>
    </section>
  );
}
