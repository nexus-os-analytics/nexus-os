'use client';

import {
  Button,
  Group,
  Modal,
  Stack,
  Stepper,
  Text,
  Title,
} from '@mantine/core';
import { IconArrowRight, IconCheck } from '@tabler/icons-react';

const ONBOARDING_STORAGE_KEY = 'nexus-dashboard-onboarding-v1';

export function getOnboardingCompleted(): boolean {
  if (typeof window === 'undefined') return true;
  return window.localStorage.getItem(ONBOARDING_STORAGE_KEY) === 'true';
}

export function setOnboardingCompleted(): void {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem(ONBOARDING_STORAGE_KEY, 'true');
}

interface DashboardOnboardingProps {
  opened: boolean;
  step: number;
  onStepChange: (step: number) => void;
  onComplete: () => void;
  onClose: () => void;
}

export function DashboardOnboarding({
  opened,
  step,
  onStepChange,
  onComplete,
  onClose,
}: DashboardOnboardingProps) {
  const handleNext = () => {
    if (step < 3) {
      onStepChange(step + 1);
    } else {
      setOnboardingCompleted();
      onComplete();
      onClose();
    }
  };

  return (
    <Modal
      opened={opened}
      onClose={onClose}
      title="Tour do Painel"
      size="md"
      centered
      withCloseButton
      closeOnClickOutside={false}
    >
      <Stepper active={step - 1} size="sm" allowNextStepsSelect={false}>
        <Stepper.Step label="Boas-vindas" />
        <Stepper.Step label="Indicadores" />
        <Stepper.Step label="Filtros" />
      </Stepper>

      <Stack gap="lg" mt="xl">
        {step === 1 && (
          <>
            <Title order={3}>Bem-vindo ao Painel</Title>
            <Text c="dimmed" size="sm">
              Aqui você acompanha os alertas dos seus produtos e toma decisões com base em
              indicadores de capital parado, risco de ruptura e oportunidades. Use este tour para
              conhecer as principais áreas.
            </Text>
          </>
        )}

        {step === 2 && (
          <>
            <Title order={3}>Cards de indicadores</Title>
            <Text c="dimmed" size="sm">
              No topo do painel você vê três indicadores: <strong>Capital Parado</strong> (valor
              parado em estoque), <strong>Produtos em Risco</strong> (ruptura) e{' '}
              <strong>Oportunidades</strong> (produtos com alta demanda). Eles ajudam a priorizar
              ações.
            </Text>
          </>
        )}

        {step === 3 && (
          <>
            <Title order={3}>Filtros e ações</Title>
            <Text c="dimmed" size="sm">
              Use a <strong>busca</strong> por nome ou SKU e os filtros de <strong>tipo de
              alerta</strong> e <strong>risco</strong> para encontrar os produtos que deseja. Aqui
              você também acessa a Visão Geral, atualização de dados, exportação em CSV e o gerador
              de campanhas.
            </Text>
          </>
        )}

        <Group justify="flex-end">
          <Button
            variant="gradient"
            gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
            rightSection={step === 3 ? <IconCheck size={16} /> : <IconArrowRight size={16} />}
            onClick={handleNext}
          >
            {step === 3 ? 'Concluir' : 'Próximo'}
          </Button>
        </Group>
      </Stack>
    </Modal>
  );
}
