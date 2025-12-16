'use client';
import { Button, Card, Divider, Grid, Group, NumberInput, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useState, useTransition } from 'react';
import { saveProductSettingsAction } from '@/features/products/actions/product-settings.actions';
import {
  type SaveProductSettingsInput,
  SaveProductSettingsSchema,
} from '@/features/products/schemas/product-settings.schema';
import type { BlingProductSettingsType } from '@/lib/bling';

interface ProductSettingsFormProps {
  settings?: BlingProductSettingsType | null;
  blingProductId: string;
}

const DEFAULT_SETTINGS: SaveProductSettingsInput = {
  blingProductId: '',
  leadTimeDays: 15,
  safetyDays: 5,
  criticalDaysRemainingThreshold: 7,
  highDaysRemainingThreshold: 15,
  mediumDaysRemainingThreshold: 30,
  opportunityGrowthThresholdPct: 0.5,
  opportunityDemandVvd: 1,
  deadStockCapitalThreshold: 5000,
  capitalOptimizationThreshold: 10000,
  ruptureCapitalThreshold: 5000,
  liquidationDiscount: 0.3,
  costFactor: 0.8,
  liquidationExcessCapitalThreshold: 2000,
  fineExcessCapitalMax: 5000,
};

export function ProductSettingsForm({ settings, blingProductId }: ProductSettingsFormProps) {
  const initial: SaveProductSettingsInput = settings
    ? {
        blingProductId,
        leadTimeDays: settings.leadTimeDays,
        safetyDays: settings.safetyDays,
        criticalDaysRemainingThreshold: settings.criticalDaysRemainingThreshold,
        highDaysRemainingThreshold: settings.highDaysRemainingThreshold,
        mediumDaysRemainingThreshold: settings.mediumDaysRemainingThreshold,
        opportunityGrowthThresholdPct: settings.opportunityGrowthThresholdPct,
        opportunityDemandVvd: settings.opportunityDemandVvd,
        deadStockCapitalThreshold: settings.deadStockCapitalThreshold,
        capitalOptimizationThreshold: settings.capitalOptimizationThreshold,
        ruptureCapitalThreshold: settings.ruptureCapitalThreshold,
        liquidationDiscount: settings.liquidationDiscount,
        costFactor: settings.costFactor,
        liquidationExcessCapitalThreshold: settings.liquidationExcessCapitalThreshold,
        fineExcessCapitalMax: settings.fineExcessCapitalMax,
      }
    : { ...DEFAULT_SETTINGS, blingProductId };
  const [formSettings, setSettings] = useState<SaveProductSettingsInput>(initial);
  const [submitting, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleSave = async () => {
    setError(null);
    const parsed = SaveProductSettingsSchema.safeParse({ ...formSettings, blingProductId });
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? 'Verifique os campos informados.');
      return;
    }
    startTransition(async () => {
      try {
        await saveProductSettingsAction(parsed.data);
        notifications.show({
          title: 'Configurações salvas',
          message: 'As configurações do produto foram salvas com sucesso.',
          color: 'green',
        });
      } catch (e) {
        console.error('Error saving product settings:', e);
        setError('Falha ao salvar configurações.');
      }
    });
  };

  return (
    <Card padding="lg" radius="md" withBorder shadow="sm">
      <Title order={5} mb="md">
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
            value={formSettings.leadTimeDays}
            onChange={(val) => setSettings((prev) => ({ ...prev, leadTimeDays: Number(val) }))}
            min={1}
            max={90}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <NumberInput
            label="Dias de Segurança"
            description="Margem de segurança para variações"
            value={formSettings.safetyDays}
            onChange={(val) => setSettings((prev) => ({ ...prev, safetyDays: Number(val) }))}
            min={0}
            max={30}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <NumberInput
            label="Fator de Custo"
            description="Multiplicador para cálculos financeiros"
            value={formSettings.costFactor}
            onChange={(val) => setSettings((prev) => ({ ...prev, costFactor: Number(val) }))}
            min={0.1}
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
            value={formSettings.criticalDaysRemainingThreshold}
            onChange={(val) =>
              setSettings((prev) => ({ ...prev, criticalDaysRemainingThreshold: Number(val) }))
            }
            min={1}
            max={30}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <NumberInput
            label="Alto (dias)"
            description="Dias restantes para risco alto"
            value={formSettings.highDaysRemainingThreshold}
            onChange={(val) =>
              setSettings((prev) => ({ ...prev, highDaysRemainingThreshold: Number(val) }))
            }
            min={1}
            max={30}
          />
        </Grid.Col>

        <Grid.Col span={{ base: 12, sm: 6, md: 4 }}>
          <NumberInput
            label="Médio (dias)"
            description="Dias restantes para risco médio"
            value={formSettings.mediumDaysRemainingThreshold}
            onChange={(val) =>
              setSettings((prev) => ({ ...prev, mediumDaysRemainingThreshold: Number(val) }))
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
            value={formSettings.opportunityGrowthThresholdPct}
            onChange={(val) =>
              setSettings((prev) => ({ ...prev, opportunityGrowthThresholdPct: Number(val) }))
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
            value={formSettings.opportunityDemandVvd}
            onChange={(val) =>
              setSettings((prev) => ({ ...prev, opportunityDemandVvd: Number(val) }))
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
            value={formSettings.liquidationDiscount}
            onChange={(val) =>
              setSettings((prev) => ({ ...prev, liquidationDiscount: Number(val) }))
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
            value={formSettings.deadStockCapitalThreshold}
            onChange={(val) =>
              setSettings((prev) => ({ ...prev, deadStockCapitalThreshold: Number(val) }))
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
            value={formSettings.liquidationExcessCapitalThreshold}
            onChange={(val) =>
              setSettings((prev) => ({ ...prev, liquidationExcessCapitalThreshold: Number(val) }))
            }
            min={1000}
            max={50000}
            step={500}
            prefix="R$ "
          />
        </Grid.Col>
      </Grid>

      {error ? (
        <Text c="red" size="sm" mt="md">
          {error}
        </Text>
      ) : null}

      <Group justify="flex-end" mt="xl">
        <Button color="brand" onClick={handleSave} loading={submitting} disabled={submitting}>
          Salvar Configurações
        </Button>
      </Group>
    </Card>
  );
}
