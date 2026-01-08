'use client';
import { Button, Group, List, Stack, Stepper, Text, Title } from '@mantine/core';
import { useState } from 'react';

interface ManualStepByStepProps {
  id?: string;
}

export function ManualStepByStep({ id = 'passo-a-passo' }: ManualStepByStepProps) {
  const [active, setActive] = useState(0);

  const next = () => setActive((current) => (current < 2 ? current + 1 : current));
  const prev = () => setActive((current) => (current > 0 ? current - 1 : current));

  return (
    <section id={id}>
      <Stack gap="md">
        <Title order={2}>Passo a passo</Title>
        <Stepper active={active} onStepClick={setActive} allowNextStepsSelect={false}>
          <Stepper.Step label="Gerar token no Bling" description="Acesso à API">
            <Stack gap="xs">
              <Text>
                No Bling, acesse <strong>Preferências &gt; Integrações &gt; API</strong> e gere um
                token com as permissões necessárias.
              </Text>
              <List spacing="xs">
                <List.Item>Leitura de produtos e estoque;</List.Item>
                <List.Item>Leitura de pedidos e notas fiscais;</List.Item>
                <List.Item>Leitura de fornecedores (quando aplicável).</List.Item>
              </List>
            </Stack>
          </Stepper.Step>
          <Stepper.Step label="Conectar ao Nexus" description="Colar token e validar">
            <Text>
              No Nexus OS, acesse <strong>Integrações</strong>, selecione <strong>Bling</strong>,
              cole o token e valide a conexão. Você pode revogar a qualquer momento.
            </Text>
          </Stepper.Step>
          <Stepper.Step label="Configurar alertas" description="Limiares e regras">
            <Text>
              Ajuste limiares de excesso/ruptura, metas e regras de custo. Personalize alertas por
              categoria e impacto.
            </Text>
          </Stepper.Step>
          <Stepper.Completed>
            <Text>Pronto! A integração está ativa e as análises começarão automaticamente.</Text>
          </Stepper.Completed>
        </Stepper>
        <Group>
          <Button variant="default" onClick={prev} disabled={active === 0}>
            Voltar
          </Button>
          <Button onClick={next} disabled={active >= 2}>
            Avançar
          </Button>
        </Group>
      </Stack>
    </section>
  );
}
