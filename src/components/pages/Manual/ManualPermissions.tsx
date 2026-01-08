'use client';
import { Blockquote, Stack, Title } from '@mantine/core';
import { ManualPermissionsTable } from './ManualPermissionsTable';

interface ManualPermissionsProps {
  id?: string;
}

export function ManualPermissions({ id = 'permissoes' }: ManualPermissionsProps) {
  return (
    <section id={id}>
      <Stack gap="md">
        <Title order={2}>Permissões necessárias</Title>
        <ManualPermissionsTable />
        <Blockquote color="brand.6">
          Você mantém total controle sobre o acesso. O token pode ser revogado no Bling a qualquer
          momento e o Nexus OS interromperá o consumo de dados imediatamente.
        </Blockquote>
      </Stack>
    </section>
  );
}
