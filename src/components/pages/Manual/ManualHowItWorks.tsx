'use client';
import { Text, Timeline, Title } from '@mantine/core';

interface ManualHowItWorksProps {
  id?: string;
}

export function ManualHowItWorks({ id = 'como-funciona' }: ManualHowItWorksProps) {
  return (
    <section id={id}>
      <Title order={2} mb="md">
        Como funciona
      </Title>
      <Timeline active={-1} bulletSize={24} lineWidth={2}>
        <Timeline.Item title="Conexão segura com o Bling">
          <Text>
            Você autoriza o Nexus OS a acessar dados via API do Bling usando um token de acesso. A
            permissão pode ser revogada a qualquer momento.
          </Text>
        </Timeline.Item>
        <Timeline.Item title="Coleta e padronização de dados">
          <Text>
            O sistema coleta dados relevantes (produtos, pedidos, notas, estoque) e organiza de
            forma consistente para análises agregadas.
          </Text>
        </Timeline.Item>
        <Timeline.Item title="Análise contínua e alertas">
          <Text>
            Algoritmos avaliam métricas como excesso, ruptura, giro, margem e custo, gerando alertas
            e recomendações para ação.
          </Text>
        </Timeline.Item>
        <Timeline.Item title="Acompanhamento e melhoria">
          <Text>
            As ações tomadas impactam indicadores e o Nexus OS monitora os resultados para sugerir
            próximos passos.
          </Text>
        </Timeline.Item>
      </Timeline>
    </section>
  );
}
