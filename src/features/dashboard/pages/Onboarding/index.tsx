'use client';
import {
  Box,
  Button,
  Card,
  Container,
  Group,
  NumberInput,
  Paper,
  Progress,
  Stack,
  Stepper,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import {
  ArrowLeft,
  ArrowRight,
  CheckCircle,
  DollarSign,
  Info,
  Package,
  Sparkles,
  Target,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState, useTransition } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { saveUserSettings } from '@/features/bling/actions';
import type { UserSettings } from '@/types';

export function Onboarding() {
  const [active, setActive] = useState(0);
  const [settings, setSettings] = useState<UserSettings>({
    financial: {
      capitalCost: 3,
      storageCost: 0.5,
    },
    operational: {
      defaultReplenishmentTime: 15,
      safetyDays: 5,
    },
    goals: {
      recoveryTarget: 80,
      maxLiquidationDays: 30,
    },
  });
  const [isPending, startTransition] = useTransition();
  const { user } = useAuth();
  const router = useRouter();

  const steps = [
    { label: 'Financeiro', icon: DollarSign },
    { label: 'Operacional', icon: Package },
    { label: 'Metas', icon: Target },
  ];

  const handleSave = () => {
    startTransition(async () => {
      await saveUserSettings(settings);
      router.replace('/bling');
    });
  };

  const handleNext = () => {
    if (active < steps.length - 1) {
      setActive(active + 1);
    } else {
      handleComplete();
    }
  };

  const handleBack = () => {
    if (active > 0) {
      setActive(active - 1);
    }
  };

  const handleSkip = () => {
    notifications.show({
      title: 'Configurações Padrão Aplicadas',
      message: 'Você pode ajustar esses valores depois nas Configurações.',
      color: 'blue',
    });
    handleSave();
  };

  const handleComplete = () => {
    notifications.show({
      title: 'Configuração Concluída! 🎉',
      message: 'Agora vamos conectar sua conta Bling.',
      color: 'green',
    });
    handleSave();
  };

  const progress = ((active + 1) / steps.length) * 100;

  useEffect(() => {
    if (user?.onboardingCompleted) {
      router.replace('/bling');
    }
  }, [user]);

  return (
    <Box
      style={{
        minHeight: '100vh',
        paddingTop: '3rem',
        paddingBottom: '4rem',
      }}
    >
      <Container size="md">
        <Stack gap="xl">
          {/* Header */}
          <Box style={{ textAlign: 'center' }}>
            <ThemeIcon size={80} radius="xl" color="gold" variant="light" mx="auto" mb="md">
              <Sparkles size={40} />
            </ThemeIcon>
            <Title order={1} mb="xs">
              Bem-vindo ao Nexus OS! 👋
            </Title>
            <Text size="lg" maw={600} mx="auto" mb="md">
              Antes de começar, vamos configurar alguns parâmetros para personalizar as análises do
              seu estoque.
            </Text>
            <Text size="sm">Não se preocupe, você pode alterar tudo isso depois! 😊</Text>
          </Box>

          {/* Progress Bar */}
          <Box>
            <Group justify="space-between" mb="xs">
              <Text size="sm">
                Passo {active + 1} de {steps.length}
              </Text>
              <Text size="sm" style={{ color: '#C7A446' }}>
                {Math.round(progress)}% completo
              </Text>
            </Group>
            <Progress value={progress} color="gold" size="sm" radius="xl" />
          </Box>

          {/* Stepper */}
          <Stepper active={active} color="gold" size="sm">
            {steps.map((step, index) => {
              const StepIcon = step.icon;
              return (
                <Stepper.Step
                  key={index}
                  label={step.label}
                  icon={<StepIcon size={16} />}
                  completedIcon={<CheckCircle size={16} />}
                />
              );
            })}
          </Stepper>

          {/* Step Content */}
          <Card padding="xl" radius="md" withBorder shadow="lg">
            {/* Step 1: Financeiro */}
            {active === 0 && (
              <Stack gap="lg">
                <Box>
                  <Group mb="md">
                    <ThemeIcon size={48} radius="md" color="orange" variant="light">
                      <DollarSign size={24} />
                    </ThemeIcon>
                    <Box>
                      <Title order={3}>Parâmetros Financeiros</Title>
                      <Text size="sm">Custos que afetam a precificação inteligente</Text>
                    </Box>
                  </Group>

                  <Paper
                    p="md"
                    radius="md"
                    mb="lg"
                    style={{ backgroundColor: 'rgba(199, 164, 70, 0.08)' }}
                  >
                    <Group gap="xs" mb="xs">
                      <Info size={16} color="#C7A446" />
                      <Text size="sm">Por que isso importa?</Text>
                    </Group>
                    <Text size="sm">
                      Esses custos são usados pelo nosso{' '}
                      <strong>Motor de Precificação Inteligente</strong> para calcular o preço ideal
                      de liquidação. Quanto maiores os custos, mais agressivas serão as
                      recomendações.
                    </Text>
                  </Paper>
                </Box>

                <NumberInput
                  label="Custo do Capital (% ao mês)"
                  description="Quanto custa manter dinheiro parado no estoque"
                  placeholder="Ex: 3.0"
                  value={settings.financial.capitalCost}
                  onChange={(value) =>
                    setSettings({
                      ...settings,
                      financial: { ...settings.financial, capitalCost: Number(value) },
                    })
                  }
                  min={0}
                  max={20}
                  step={0.5}
                  decimalScale={1}
                  suffix="%"
                  size="md"
                  styles={{
                    label: { color: '#2E2E2E', fontWeight: 500 },
                  }}
                />

                <NumberInput
                  label="Custo de Armazenamento (% ao mês)"
                  description="Custo mensal para guardar produtos (aluguel, energia, seguro)"
                  placeholder="Ex: 0.5"
                  value={settings.financial.storageCost}
                  onChange={(value) =>
                    setSettings({
                      ...settings,
                      financial: { ...settings.financial, storageCost: Number(value) },
                    })
                  }
                  min={0}
                  max={10}
                  step={0.1}
                  decimalScale={1}
                  suffix="%"
                  size="md"
                  styles={{
                    label: { color: '#2E2E2E', fontWeight: 500 },
                  }}
                />

                <Paper p="md" radius="md">
                  <Text size="sm">
                    💡 <strong>Exemplo prático:</strong> Se você tem R$ 10.000 parados em estoque
                    com custo de capital de 3%, você perde R$ 300/mês apenas mantendo esse dinheiro
                    parado.
                  </Text>
                </Paper>
              </Stack>
            )}

            {/* Step 2: Operacional */}
            {active === 1 && (
              <Stack gap="lg">
                <Box>
                  <Group mb="md">
                    <ThemeIcon size={48} radius="md" color="blue" variant="light">
                      <Package size={24} />
                    </ThemeIcon>
                    <Box>
                      <Title order={3}>Parâmetros Operacionais</Title>
                      <Text size="sm">Tempos de reposição e segurança</Text>
                    </Box>
                  </Group>

                  <Paper
                    p="md"
                    radius="md"
                    mb="lg"
                    style={{ backgroundColor: 'rgba(30, 144, 255, 0.08)' }}
                  >
                    <Group gap="xs" mb="xs">
                      <Info size={16} color="#1E90FF" />
                      <Text size="sm">Por que isso importa?</Text>
                    </Group>
                    <Text size="sm">
                      Esses valores definem o <strong>Ponto de Pedido</strong> dos seus produtos. O
                      sistema vai alertar quando o estoque atingir esse nível para evitar rupturas.
                    </Text>
                  </Paper>
                </Box>

                <NumberInput
                  label="Tempo de Reposição Padrão (dias)"
                  description="Quantos dias leva para receber um pedido do fornecedor"
                  placeholder="Ex: 15"
                  value={settings.operational.defaultReplenishmentTime}
                  onChange={(value) =>
                    setSettings({
                      ...settings,
                      operational: {
                        ...settings.operational,
                        defaultReplenishmentTime: Number(value),
                      },
                    })
                  }
                  min={1}
                  max={90}
                  step={1}
                  suffix=" dias"
                  size="md"
                  styles={{
                    label: { color: '#2E2E2E', fontWeight: 500 },
                  }}
                />

                <NumberInput
                  label="Dias de Segurança"
                  description="Buffer adicional para variações na demanda e possíveis atrasos"
                  placeholder="Ex: 5"
                  value={settings.operational.safetyDays}
                  onChange={(value) =>
                    setSettings({
                      ...settings,
                      operational: { ...settings.operational, safetyDays: Number(value) },
                    })
                  }
                  min={0}
                  max={30}
                  step={1}
                  suffix=" dias"
                  size="md"
                  styles={{
                    label: { color: '#2E2E2E', fontWeight: 500 },
                  }}
                />

                <Paper p="md" radius="md">
                  <Text size="sm" mb="xs">
                    📊 <strong>Cálculo do Ponto de Pedido:</strong>
                  </Text>
                  <Text size="sm" style={{ fontFamily: 'monospace' }}>
                    Ponto de Pedido = VVD × (
                    <strong style={{ color: '#C7A446' }}>
                      {settings.operational.defaultReplenishmentTime}
                    </strong>{' '}
                    +{' '}
                    <strong style={{ color: '#C7A446' }}>{settings.operational.safetyDays}</strong>)
                  </Text>
                  <Text size="xs" mt="xs">
                    Com suas configurações, se um produto vende 2 unidades/dia, o sistema vai
                    alertar quando restar{' '}
                    {2 *
                      (settings.operational.defaultReplenishmentTime +
                        settings.operational.safetyDays)}{' '}
                    unidades.
                  </Text>
                </Paper>
              </Stack>
            )}

            {/* Step 3: Metas */}
            {active === 2 && (
              <Stack gap="lg">
                <Box>
                  <Group mb="md">
                    <ThemeIcon size={48} radius="md" color="teal" variant="light">
                      <Target size={24} />
                    </ThemeIcon>
                    <Box>
                      <Title order={3}>Metas e Objetivos</Title>
                      <Text size="sm">Defina suas expectativas de recuperação</Text>
                    </Box>
                  </Group>

                  <Paper
                    p="md"
                    radius="md"
                    mb="lg"
                    style={{ backgroundColor: 'rgba(18, 184, 134, 0.08)' }}
                  >
                    <Group gap="xs" mb="xs">
                      <Info size={16} color="#12B886" />
                      <Text size="sm">Por que isso importa?</Text>
                    </Group>
                    <Text size="sm">
                      Essas metas definem o{' '}
                      <strong>equilíbrio entre recuperação e velocidade</strong> nas recomendações
                      de liquidação. Metas mais altas = prazos mais longos.
                    </Text>
                  </Paper>
                </Box>

                <NumberInput
                  label="Meta de Recuperação (%)"
                  description="Percentual mínimo que você deseja recuperar ao liquidar produtos"
                  placeholder="Ex: 80"
                  value={settings.goals.recoveryTarget}
                  onChange={(value) =>
                    setSettings({
                      ...settings,
                      goals: { ...settings.goals, recoveryTarget: Number(value) },
                    })
                  }
                  min={0}
                  max={100}
                  step={5}
                  suffix="%"
                  size="md"
                  styles={{
                    label: { color: '#2E2E2E', fontWeight: 500 },
                  }}
                />

                <NumberInput
                  label="Prazo Máximo de Liquidação (dias)"
                  description="Tempo máximo que você aceita para liquidar um produto encalhado"
                  placeholder="Ex: 30"
                  value={settings.goals.maxLiquidationDays}
                  onChange={(value) =>
                    setSettings({
                      ...settings,
                      goals: { ...settings.goals, maxLiquidationDays: Number(value) },
                    })
                  }
                  min={7}
                  max={90}
                  step={5}
                  suffix=" dias"
                  size="md"
                  styles={{
                    label: { color: '#2E2E2E', fontWeight: 500 },
                  }}
                />

                <Paper p="md" radius="md">
                  <Text size="sm">
                    💡 <strong>Dica:</strong> Com meta de{' '}
                    <strong style={{ color: '#C7A446' }}>{settings.goals.recoveryTarget}%</strong>{' '}
                    em até{' '}
                    <strong style={{ color: '#C7A446' }}>
                      {settings.goals.maxLiquidationDays} dias
                    </strong>
                    , o sistema vai priorizar recomendações que atendam esses critérios. Você sempre
                    pode ver cenários alternativos.
                  </Text>
                </Paper>

                {/* Summary */}
                <Paper
                  p="xl"
                  radius="md"
                  mt="md"
                  style={{
                    background:
                      'linear-gradient(135deg, rgba(199, 164, 70, 0.1) 0%, rgba(168, 135, 42, 0.1) 100%)',
                    border: '2px solid #C7A446',
                  }}
                >
                  <Group gap="xs" mb="md">
                    <CheckCircle size={20} color="#C7A446" />
                    <Text>Tudo pronto para começar!</Text>
                  </Group>
                  <Text size="sm">Com essas configurações, o Nexus OS vai:</Text>
                  <Stack gap="xs" mt="sm">
                    <Text size="sm">
                      ✅ Calcular preços ideais considerando custos de{' '}
                      <strong>
                        {settings.financial.capitalCost}% + {settings.financial.storageCost}%
                      </strong>
                    </Text>
                    <Text size="sm">
                      ✅ Alertar rupturas com{' '}
                      <strong>
                        {settings.operational.defaultReplenishmentTime +
                          settings.operational.safetyDays}{' '}
                        dias
                      </strong>{' '}
                      de antecedência
                    </Text>
                    <Text size="sm">
                      ✅ Priorizar liquidações que recuperem{' '}
                      <strong>{settings.goals.recoveryTarget}%</strong> em até{' '}
                      <strong>{settings.goals.maxLiquidationDays} dias</strong>
                    </Text>
                  </Stack>
                </Paper>
              </Stack>
            )}
          </Card>

          {/* Navigation Buttons */}
          <Group justify="space-between">
            <Button
              variant="subtle"
              color="gray"
              leftSection={<ArrowLeft size={16} />}
              onClick={handleBack}
              disabled={active === 0}
              loading={isPending}
            >
              Voltar
            </Button>

            <Button variant="subtle" color="gray" onClick={handleSkip} loading={isPending}>
              Pular (usar padrões)
            </Button>

            <Button
              rightSection={
                active === steps.length - 1 ? <CheckCircle size={16} /> : <ArrowRight size={16} />
              }
              onClick={handleNext}
              style={{
                background: '#C7A446',
              }}
              styles={{
                root: {
                  '&:hover': {
                    background: '#A8872A',
                  },
                },
              }}
              loading={isPending}
            >
              {active === steps.length - 1 ? 'Finalizar' : 'Próximo'}
            </Button>
          </Group>

          {/* Help Text */}
          <Text size="xs" style={{ textAlign: 'center' }}>
            💡 Não sabe qual valor usar? Os valores padrão são baseados em médias do mercado
            brasileiro.
          </Text>
        </Stack>
      </Container>
    </Box>
  );
}
