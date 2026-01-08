'use client';
import { Blockquote, Button, Stack, Title } from '@mantine/core';
import Link from 'next/link';

interface ManualCtaProps {
  id?: string;
}

export function ManualCta({ id = 'cta' }: ManualCtaProps) {
  return (
    <section id={id}>
      <Stack gap="md" align="start">
        <Title order={2}>Pronto para começar?</Title>
        <Blockquote color="brand.6">
          Conecte seu Bling ao Nexus OS e veja em poucos minutos onde estão as maiores oportunidades
          de margem e redução de perdas.
        </Blockquote>
        <Button
          component={Link}
          href="/cadastre-se"
          variant="gradient"
          gradient={{ from: 'brand.6', to: 'brand.4' }}
        >
          Criar conta e conectar Bling
        </Button>
      </Stack>
    </section>
  );
}
