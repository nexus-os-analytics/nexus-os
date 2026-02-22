/**
 * Campaign Review Component
 *
 * Step 5: Generate AI content, review variations, and publish campaign
 */

'use client';

import { useState, useEffect } from 'react';
import {
  Stack,
  Title,
  Text,
  Button,
  Group,
  Paper,
  Badge,
  Radio,
  Alert,
  Loader,
  Center,
  ActionIcon,
  CopyButton,
  Tooltip,
} from '@mantine/core';
import {
  IconArrowLeft,
  IconCheck,
  IconAlertCircle,
  IconCopy,
  IconRocket,
  IconRefresh,
} from '@tabler/icons-react';
import { notifications } from '@mantine/notifications';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import type { CampaignType, BlingProduct, BlingAlert } from '@prisma/client';
import type {
  ToneOfVoice,
  AdVariation,
  CampaignGenerationOutput,
} from '@/features/campaigns/types';
import { formatCurrency } from '@/lib/utils';

interface CampaignReviewProps {
  type: CampaignType;
  productId: string;
  percentage: number;
  tone: ToneOfVoice;
  onBack: () => void;
  onSuccess: (campaignId: string) => void;
}

type ProductWithAlert = BlingProduct & { alert: BlingAlert | null };

export function CampaignReview({
  type,
  productId,
  percentage,
  tone,
  onBack,
  onSuccess,
}: CampaignReviewProps) {
  const queryClient = useQueryClient();
  const [selectedVariationId, setSelectedVariationId] = useState<string | null>(null);
  const [generatedCampaign, setGeneratedCampaign] = useState<CampaignGenerationOutput | null>(null);

  // Fetch product details
  const { data: product } = useQuery<ProductWithAlert>({
    queryKey: ['product', productId],
    queryFn: async () => {
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) throw new Error('Failed to fetch product');
      return response.json();
    },
  });

  // Generate campaign mutation
  const generateMutation = useMutation({
    mutationFn: async () => {
      const response = await fetch('/api/campaigns/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          blingProductId: productId,
          discountPercentage: type === 'LIQUIDATION' ? percentage : undefined,
          increasePercentage: type === 'OPPORTUNITY' ? percentage : undefined,
          toneOfVoice: tone,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao gerar campanha');
      }

      return response.json() as Promise<CampaignGenerationOutput>;
    },
    onSuccess: (data) => {
      setGeneratedCampaign(data);
      setSelectedVariationId(data.variations[0]?.id || null);
      notifications.show({
        title: 'Campanha gerada!',
        message: 'A IA criou 3 variações para você escolher',
        color: 'green',
        icon: <IconCheck />,
      });
    },
    onError: (error: Error) => {
      notifications.show({
        title: 'Erro ao gerar campanha',
        message: error.message,
        color: 'red',
        icon: <IconAlertCircle />,
      });
    },
  });

  // Activate campaign mutation
  const activateMutation = useMutation({
    mutationFn: async () => {
      if (!generatedCampaign || !selectedVariationId) {
        throw new Error('Nenhuma variação selecionada');
      }

      const response = await fetch(`/api/campaigns/${generatedCampaign.campaignId}/activate`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ selectedVariationId }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Erro ao ativar campanha');
      }

      return response.json();
    },
    onSuccess: () => {
      notifications.show({
        title: 'Campanha publicada!',
        message: 'Sua campanha está ativa e pronta para uso',
        color: 'green',
        icon: <IconRocket />,
      });
      queryClient.invalidateQueries({ queryKey: ['campaigns'] });
      if (generatedCampaign) {
        onSuccess(generatedCampaign.campaignId);
      }
    },
    onError: (error: Error) => {
      notifications.show({
        title: 'Erro ao publicar campanha',
        message: error.message,
        color: 'red',
        icon: <IconAlertCircle />,
      });
    },
  });

  // Auto-generate on mount
  useEffect(() => {
    if (!generatedCampaign && !generateMutation.isPending) {
      generateMutation.mutate();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const isLiquidation = type === 'LIQUIDATION';
  const finalPrice = product
    ? isLiquidation
      ? product.salePrice * (1 - percentage / 100)
      : product.salePrice * (1 + percentage / 100)
    : 0;

  return (
    <Stack gap="xl">
      <Stack gap="xs">
        <Title order={2}>Revisar Campanha</Title>
        <Text c="dimmed">A IA está gerando o conteúdo da sua campanha...</Text>
      </Stack>

      {/* Campaign summary */}
      {product && (
        <Paper withBorder p="md" radius="md" bg="gray.0">
          <Stack gap="xs">
            <Group justify="space-between">
              <div>
                <Text size="xs" c="dimmed" tt="uppercase">
                  Produto
                </Text>
                <Text fw={500}>{product.name}</Text>
              </div>
              <Badge variant="light" color={isLiquidation ? 'blue' : 'green'}>
                {isLiquidation ? 'Liquidação' : 'Oportunidade'}
              </Badge>
            </Group>

            <Group gap="xl">
              <div>
                <Text size="xs" c="dimmed">
                  {isLiquidation ? 'Desconto' : 'Aumento'}
                </Text>
                <Text size="lg" fw={700}>
                  {percentage}%
                </Text>
              </div>
              <div>
                <Text size="xs" c="dimmed">
                  Preço Final
                </Text>
                <Text size="lg" fw={700} c={isLiquidation ? 'red' : 'green'}>
                  {formatCurrency(finalPrice)}
                </Text>
              </div>
              <div>
                <Text size="xs" c="dimmed">
                  Tom de Voz
                </Text>
                <Text size="sm" fw={500} tt="capitalize">
                  {tone}
                </Text>
              </div>
            </Group>
          </Stack>
        </Paper>
      )}

      {/* Loading state */}
      {generateMutation.isPending && (
        <Paper withBorder p="xl" radius="md">
          <Center>
            <Stack align="center" gap="md">
              <Loader size="lg" />
              <Stack gap={4} align="center">
                <Text fw={500}>⚡ A IA está trabalhando...</Text>
                <Text size="sm" c="dimmed">
                  Analisando produto, calculando estratégia e criando textos persuasivos...
                </Text>
              </Stack>
            </Stack>
          </Center>
        </Paper>
      )}

      {/* Error state */}
      {generateMutation.isError && (
        <Alert icon={<IconAlertCircle />} title="Erro ao gerar campanha" color="red">
          <Stack gap="sm">
            <Text size="sm">{generateMutation.error.message}</Text>
            <Button
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
              leftSection={<IconRefresh size={16} />}
              size="sm"
              onClick={() => generateMutation.mutate()}
            >
              Tentar Novamente
            </Button>
          </Stack>
        </Alert>
      )}

      {/* Generated variations */}
      {generatedCampaign && (
        <Stack gap="md">
          <Group justify="space-between">
            <Text fw={600}>Escolha uma variação para publicar:</Text>
            <Button
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
              size="sm"
              leftSection={<IconRefresh size={16} />}
              onClick={() => generateMutation.mutate()}
              loading={generateMutation.isPending}
            >
              Gerar Novamente
            </Button>
          </Group>

          <Radio.Group value={selectedVariationId || ''} onChange={setSelectedVariationId}>
            <Stack gap="md">
              {generatedCampaign.variations.map((variation, index) => (
                <Paper
                  key={variation.id}
                  withBorder
                  p="lg"
                  radius="md"
                  style={{
                    cursor: 'pointer',
                    backgroundColor:
                      selectedVariationId === variation.id
                        ? 'var(--mantine-color-blue-0)'
                        : undefined,
                    borderColor:
                      selectedVariationId === variation.id
                        ? 'var(--mantine-color-blue-5)'
                        : undefined,
                    borderWidth: selectedVariationId === variation.id ? 2 : 1,
                  }}
                  onClick={() => setSelectedVariationId(variation.id)}
                >
                  <Stack gap="md">
                    <Group justify="space-between" align="flex-start">
                      <Group gap="xs">
                        <Radio value={variation.id} />
                        <Badge variant="light" size="sm">
                          Variação {index + 1}
                        </Badge>
                        {index === 0 && (
                          <Badge variant="light" color="blue" size="sm">
                            Recomendada
                          </Badge>
                        )}
                      </Group>

                      <CopyButton
                        value={`${variation.title}\n\n${variation.body}\n\n${variation.cta}`}
                      >
                        {({ copied, copy }) => (
                          <Tooltip label={copied ? 'Copiado!' : 'Copiar texto'}>
                            <ActionIcon
                              variant="subtle"
                              color={copied ? 'green' : 'gray'}
                              onClick={(e) => {
                                e.stopPropagation();
                                copy();
                              }}
                            >
                              {copied ? <IconCheck size={18} /> : <IconCopy size={18} />}
                            </ActionIcon>
                          </Tooltip>
                        )}
                      </CopyButton>
                    </Group>

                    <Stack gap="sm">
                      <div>
                        <Text size="xs" c="dimmed" tt="uppercase" mb={4}>
                          Título
                        </Text>
                        <Text fw={600} size="md">
                          {variation.title}
                        </Text>
                      </div>

                      <div>
                        <Text size="xs" c="dimmed" tt="uppercase" mb={4}>
                          Texto do Anúncio
                        </Text>
                        <Text size="sm" style={{ whiteSpace: 'pre-line' }}>
                          {variation.body}
                        </Text>
                      </div>

                      <div>
                        <Text size="xs" c="dimmed" tt="uppercase" mb={4}>
                          Call-to-Action (CTA)
                        </Text>
                        <Badge size="lg" variant="filled" color={isLiquidation ? 'blue' : 'green'}>
                          {variation.cta}
                        </Badge>
                      </div>
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          </Radio.Group>
        </Stack>
      )}

      {/* Navigation buttons */}
      <Group justify="space-between">
        <Button
          variant="default"
          leftSection={<IconArrowLeft size={16} />}
          onClick={onBack}
          disabled={generateMutation.isPending || activateMutation.isPending}
        >
          Voltar
        </Button>
        {/* <Button
          variant="gradient"
          gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
          leftSection={<IconRocket size={16} />}
          size="lg"
          disabled={!selectedVariationId || generateMutation.isPending}
          loading={activateMutation.isPending}
          onClick={() => activateMutation.mutate()}
        >
          Publicar Campanha
        </Button> */}
      </Group>
    </Stack>
  );
}
