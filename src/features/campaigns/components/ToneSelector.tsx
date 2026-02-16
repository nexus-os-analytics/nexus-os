/**
 * Tone of Voice Selector Component
 *
 * Step 4: Choose tone of voice for AI-generated campaign
 */

'use client';

import { useState } from 'react';
import {
  Stack,
  Title,
  Text,
  Button,
  Group,
  Paper,
  Badge,
  SimpleGrid,
  ThemeIcon,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconArrowRight,
  IconAlertTriangle,
  IconMoodSmile,
  IconBriefcase,
  IconSparkles,
  IconCheck,
} from '@tabler/icons-react';
import type { ToneOfVoice } from '@/features/campaigns/types';

interface ToneSelectorProps {
  onSelect: (tone: ToneOfVoice) => void;
  onBack: () => void;
}

const toneOptions: Array<{
  value: ToneOfVoice;
  label: string;
  description: string;
  example: string;
  icon: typeof IconAlertTriangle;
  color: string;
  recommended?: boolean;
}> = [
  {
    value: 'urgent',
    label: 'Urgente',
    description: 'Cria senso de urgência e escassez',
    example: '"ÚLTIMA CHANCE! Acabando HOJE!"',
    icon: IconAlertTriangle,
    color: 'red',
  },
  {
    value: 'promotional',
    label: 'Promocional',
    description: 'Destaca o benefício e economia',
    example: '"SUPER OFERTA! Não perca essa oportunidade"',
    icon: IconSparkles,
    color: 'blue',
    recommended: true,
  },
  {
    value: 'professional',
    label: 'Profissional',
    description: 'Tom sério e confiável',
    example: '"Condições especiais por tempo limitado"',
    icon: IconBriefcase,
    color: 'dark',
  },
  {
    value: 'friendly',
    label: 'Amigável',
    description: 'Tom casual e próximo',
    example: '"Olha essa oportunidade incrível pra você!"',
    icon: IconMoodSmile,
    color: 'teal',
  },
];

export function ToneSelector({ onSelect, onBack }: ToneSelectorProps) {
  const [selectedTone, setSelectedTone] = useState<ToneOfVoice>('promotional');

  return (
    <Stack gap="xl">
      <Stack gap="xs">
        <Title order={2}>Escolher Tom de Voz</Title>
        <Text c="dimmed">Como você quer que a IA escreva sua campanha?</Text>
      </Stack>

      <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="md">
        {toneOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = selectedTone === option.value;

          return (
            <Paper
              key={option.value}
              withBorder
              p="lg"
              radius="md"
              style={{
                cursor: 'pointer',
                backgroundColor: isSelected ? 'var(--mantine-color-blue-0)' : undefined,
                borderColor: isSelected ? 'var(--mantine-color-blue-5)' : undefined,
                borderWidth: isSelected ? 2 : 1,
                position: 'relative',
              }}
              onClick={() => setSelectedTone(option.value)}
            >
              <Stack gap="md">
                <Group justify="space-between" align="flex-start">
                  <ThemeIcon size={50} radius="md" variant="light" color={option.color}>
                    <Icon size={28} />
                  </ThemeIcon>

                  <Group gap="xs">
                    {option.recommended && (
                      <Badge size="sm" variant="light" color="blue">
                        Recomendado
                      </Badge>
                    )}
                    {isSelected && (
                      <ThemeIcon size={24} radius="xl" color="blue" variant="filled">
                        <IconCheck size={16} />
                      </ThemeIcon>
                    )}
                  </Group>
                </Group>

                <Stack gap="xs">
                  <Text fw={600} size="lg">
                    {option.label}
                  </Text>
                  <Text size="sm" c="dimmed">
                    {option.description}
                  </Text>
                </Stack>

                <Paper withBorder p="sm" radius="sm" bg="gray.0">
                  <Text size="xs" c="dimmed" mb={4}>
                    Exemplo:
                  </Text>
                  <Text size="sm" fw={500} style={{ fontStyle: 'italic' }}>
                    {option.example}
                  </Text>
                </Paper>
              </Stack>
            </Paper>
          );
        })}
      </SimpleGrid>

      {/* Selected tone summary */}
      <Paper withBorder p="md" radius="md" bg="blue.0">
        <Group gap="xs">
          <IconSparkles size={20} />
          <Text size="sm" fw={500}>
            Tom selecionado: {toneOptions.find((t) => t.value === selectedTone)?.label}
          </Text>
        </Group>
      </Paper>

      {/* Navigation buttons */}
      <Group justify="space-between">
        <Button variant="default" leftSection={<IconArrowLeft size={16} />} onClick={onBack}>
          Voltar
        </Button>
        <Button rightSection={<IconArrowRight size={16} />} onClick={() => onSelect(selectedTone)}>
          Gerar Campanha
        </Button>
      </Group>
    </Stack>
  );
}
