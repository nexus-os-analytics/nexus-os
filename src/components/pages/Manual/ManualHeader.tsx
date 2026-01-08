'use client';
import { Stack, Text, Title } from '@mantine/core';

export function ManualHeader() {
  return (
    <header>
      <Stack gap="xs">
        <Title order={1}>📘 Manual de Integração — Nexus OS + Bling</Title>
        <Text>
          <strong>Versão:</strong> 1.0
          <br />
          <strong>Última atualização:</strong> Janeiro 2026
          <br />
          <strong>Propósito:</strong> guiar o lojista na integração segura e prática entre o{' '}
          <strong>Nexus OS</strong> e o <strong>Bling ERP</strong>, explicando o funcionamento,
          permissões e recomendações de uso.
        </Text>
      </Stack>
    </header>
  );
}
