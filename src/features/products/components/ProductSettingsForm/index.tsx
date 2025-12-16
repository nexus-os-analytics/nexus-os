import { Button, Card, Divider, Grid, Group, NumberInput, Text, Title } from '@mantine/core';
import { useState } from 'react';
import type { BlingProductSettingsType } from '@/lib/bling';

interface ProductSettingsFormProps {
  settings?: BlingProductSettingsType | null;
}

export function ProductSettingsForm({ settings }: ProductSettingsFormProps) {
  const [formSettings, setSettings] = useState<BlingProductSettingsType | null>(settings || null);

  return (
    <Card padding="lg" radius="md" withBorder shadow="sm" style={{ background: '#FFFFFF' }}>
      <Title order={5} mb="md" style={{ color: '#2E2E2E' }}>
        Configurações do Produto
      </Title>
      <Text size="sm" mb="xl">
        Ajuste os parâmetros que afetam o cálculo dos alertas para este produto
      </Text>

      <Grid gutter="lg">
        {/* Operational Settings */}
        <Grid.Col span={12}>
          <Divider label={<Text size="sm">Configurações Operacionais</Text>} labelPosition="left" />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <NumberInput
            label="Lead Time (dias)"
            description="Tempo de reposição do fornecedor"
            value={formSettings?.leadTimeDays}
            onChange={(val) =>
              setSettings((prev) => (prev ? { ...prev, leadTimeDays: Number(val) } : prev))
            }
            min={1}
            max={90}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <NumberInput
            label="Dias de Segurança"
            description="Margem de segurança para variações"
            value={formSettings?.safetyDays}
            onChange={(val) =>
              setSettings((prev) => (prev ? { ...prev, safetyDays: Number(val) } : prev))
            }
            min={0}
            max={30}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <NumberInput
            label="Fator de Custo"
            description="Multiplicador para cálculos financeiros"
            value={formSettings?.costFactor}
            onChange={(val) =>
              setSettings((prev) => (prev ? { ...prev, costFactor: Number(val) } : prev))
            }
            min={1}
            max={3}
            step={0.1}
            decimalScale={1}
          />
        </Grid.Col>

        {/* Rupture Thresholds */}
        <Grid.Col span={12}>
          <Divider label={<Text size="sm">Limites de Ruptura</Text>} labelPosition="left" mt="md" />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <NumberInput
            label="Crítico (dias)"
            description="Dias restantes para risco crítico"
            value={formSettings?.criticalDaysRemainingThreshold}
            onChange={(val) =>
              setSettings((prev) =>
                prev ? { ...prev, criticalDaysRemainingThreshold: Number(val) } : prev
              )
            }
            min={1}
            max={30}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <NumberInput
            label="Alto (dias)"
            description="Dias restantes para risco alto"
            value={formSettings?.highDaysRemainingThreshold}
            onChange={(val) =>
              setSettings((prev) =>
                prev ? { ...prev, highDaysRemainingThreshold: Number(val) } : prev
              )
            }
            min={1}
            max={30}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <NumberInput
            label="Médio (dias)"
            description="Dias restantes para risco médio"
            value={formSettings?.mediumDaysRemainingThreshold}
            onChange={(val) =>
              setSettings((prev) =>
                prev ? { ...prev, mediumDaysRemainingThreshold: Number(val) } : prev
              )
            }
            min={1}
            max={60}
          />
        </Grid.Col>

        {/* Opportunity Settings */}
        <Grid.Col span={12}>
          <Divider
            label={<Text size="sm">Configurações de Oportunidade</Text>}
            labelPosition="left"
            mt="md"
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <NumberInput
            label="Crescimento Mínimo (%)"
            description="% de crescimento para ser oportunidade"
            value={formSettings?.opportunityGrowthThresholdPct}
            onChange={(val) =>
              setSettings((prev) =>
                prev ? { ...prev, opportunityGrowthThresholdPct: Number(val) } : prev
              )
            }
            min={10}
            max={100}
            suffix="%"
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <NumberInput
            label="VVD Mínima"
            description="VVD mínima para considerar oportunidade"
            value={formSettings?.opportunityDemandVvd}
            onChange={(val) =>
              setSettings((prev) => (prev ? { ...prev, opportunityDemandVvd: Number(val) } : prev))
            }
            min={1}
            max={20}
            step={0.5}
            decimalScale={1}
          />
        </Grid.Col>

        {/* Liquidation Settings */}
        <Grid.Col span={12}>
          <Divider
            label={<Text size="sm">Configurações de Liquidação</Text>}
            labelPosition="left"
            mt="md"
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <NumberInput
            label="Desconto de Liquidação (%)"
            description="% de desconto padrão para liquidação"
            value={formSettings?.liquidationDiscount}
            onChange={(val) =>
              setSettings((prev) => (prev ? { ...prev, liquidationDiscount: Number(val) } : prev))
            }
            min={5}
            max={50}
            suffix="%"
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <NumberInput
            label="Capital Mínimo (R$)"
            description="Capital parado mínimo para alerta"
            value={formSettings?.deadStockCapitalThreshold}
            onChange={(val) =>
              setSettings((prev) =>
                prev ? { ...prev, deadStockCapitalThreshold: Number(val) } : prev
              )
            }
            min={100}
            max={50000}
            step={100}
            prefix="R$ "
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <NumberInput
            label="Capital Excesso Liquidação (R$)"
            description="Excesso de capital para liquidação"
            value={formSettings?.liquidationExcessCapitalThreshold}
            onChange={(val) =>
              setSettings((prev) =>
                prev ? { ...prev, liquidationExcessCapitalThreshold: Number(val) } : prev
              )
            }
            min={1000}
            max={50000}
            step={500}
            prefix="R$ "
          />
        </Grid.Col>
      </Grid>

      <Group justify="flex-end" mt="xl">
        <Button color="brand">Salvar Configurações</Button>
      </Group>
    </Card>
  );
}
