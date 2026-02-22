/**
 * Discount/Increase Selector Component
 *
 * Step 3: Choose discount percentage (10-40%) or increase (10-20%)
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
  Slider,
  SimpleGrid,
  Alert,
  Skeleton,
} from '@mantine/core';
import {
  IconAlertCircle,
  IconArrowLeft,
  IconArrowRight,
  IconSparkles,
  IconCheck,
} from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import type { CampaignType, BlingProduct, BlingAlert } from '@prisma/client';
import {
  getRecommendedDiscount,
  getRecommendedIncrease,
  calculateDiscountedPrice,
  calculateIncreasedPrice,
  getUrgencyColor,
  getStrategyColor,
} from '@/features/campaigns/utils/recommendations';
import { formatCurrency } from '@/lib/utils';

interface DiscountSelectorProps {
  type: CampaignType;
  productId: string;
  onContinue: (percentage: string) => void;
  onBack: () => void;
}

type ProductWithAlert = BlingProduct & { alert: BlingAlert | null };

export function DiscountSelector({ type, productId, onContinue, onBack }: DiscountSelectorProps) {
  // Fetch product details
  const { data: product, isLoading } = useQuery<ProductWithAlert>({
    queryKey: ['product', productId],
    queryFn: async () => {
      const response = await fetch(`/api/products/${productId}`);
      if (!response.ok) throw new Error('Failed to fetch product');
      return response.json();
    },
  });

  const isLiquidation = type === 'LIQUIDATION';
  const minPercentage = 10;
  const maxPercentage = isLiquidation ? 40 : 20;

  // Get recommendation
  const recommendation =
    product?.alert && product
      ? isLiquidation
        ? getRecommendedDiscount(product.alert, product.salePrice)
        : getRecommendedIncrease(product.alert, product.salePrice)
      : null;

  const [selectedPercentage, setSelectedPercentage] = useState<number>(
    recommendation?.percentage || minPercentage
  );

  // Update when recommendation loads
  useEffect(() => {
    if (recommendation && !selectedPercentage) {
      setSelectedPercentage(recommendation.percentage);
    }
  }, [recommendation, selectedPercentage]);

  // Calculate final price
  const finalPrice = product
    ? isLiquidation
      ? calculateDiscountedPrice(product.salePrice, selectedPercentage)
      : calculateIncreasedPrice(product.salePrice, selectedPercentage)
    : 0;

  const savings = product ? Math.abs(finalPrice - product.salePrice) : 0;

  // Preset options
  const presets = isLiquidation ? [30, 35, 40] : [10, 15, 20];
  const presetLabels = isLiquidation
    ? ['Conservador', 'Moderado', 'Agressivo']
    : ['Conservador', 'Moderado', 'Agressivo'];

  return (
    <Stack gap="xl">
      <Stack gap="xs">
        <Title order={2}>
          {isLiquidation ? 'Definir Desconto' : 'Definir Aumento'} - {product?.name}
        </Title>
        <Text c="dimmed">
          Escolha o {isLiquidation ? 'desconto' : 'aumento'} que deseja aplicar a este produto
        </Text>
      </Stack>

      {isLoading ? (
        <Skeleton height={300} radius="md" />
      ) : !product ? (
        <Alert icon={<IconAlertCircle />} title="Produto não encontrado" color="red">
          Não foi possível carregar os dados do produto.
        </Alert>
      ) : (
        <>
          {/* Product summary */}
          <Paper withBorder p="md" radius="md">
            <Stack gap="md">
              <Group justify="space-between">
                <div>
                  <Text fw={500}>{product.name}</Text>
                  <Text size="xs" c="dimmed">
                    SKU: {product.sku}
                  </Text>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <Text size="xs" c="dimmed">
                    Preço atual
                  </Text>
                  <Text size="lg" fw={700}>
                    {formatCurrency(product.salePrice)}
                  </Text>
                </div>
              </Group>

              {product.alert && (
                <Group gap="xs">
                  {isLiquidation ? (
                    <>
                      <Badge variant="light" color="red">
                        {product.alert.type === 'DEAD_STOCK' ? 'Capital Parado' : 'Excesso'}
                      </Badge>
                      {product.alert.type === 'DEAD_STOCK' && (
                        <Text size="xs" c="dimmed">
                          {product.alert.daysSinceLastSale} dias sem venda
                        </Text>
                      )}
                      {product.alert.type === 'LIQUIDATION' && (
                        <Text size="xs" c="dimmed">
                          {product.alert.excessPercentage?.toFixed(0)}% de excesso
                        </Text>
                      )}
                    </>
                  ) : (
                    <>
                      <Badge variant="light" color="green">
                        Oportunidade
                      </Badge>
                      <Text size="xs" c="dimmed">
                        Crescimento: {product.alert.growthTrend?.toFixed(0)}%
                      </Text>
                    </>
                  )}
                </Group>
              )}
            </Stack>
          </Paper>

          {/* Nexus Recommendation */}
          {recommendation && (
            <Paper withBorder p="md" radius="md" bg="blue.0">
              <Stack gap="xs">
                <Group gap="xs">
                  <IconSparkles size={20} />
                  <Text fw={600}>Recomendação do Nexus</Text>
                  <Badge
                    variant="light"
                    color={
                      isLiquidation && 'urgency' in recommendation
                        ? getUrgencyColor(recommendation.urgency)
                        : !isLiquidation && 'strategy' in recommendation
                          ? getStrategyColor(recommendation.strategy)
                          : 'blue'
                    }
                  >
                    {isLiquidation && 'urgency' in recommendation
                      ? recommendation.urgency
                      : !isLiquidation && 'strategy' in recommendation
                        ? recommendation.strategy
                        : ''}
                  </Badge>
                </Group>
                <Text size="lg" fw={700} c="blue">
                  {recommendation.percentage}% {isLiquidation ? 'de desconto' : 'de aumento'}
                </Text>
                <Text size="sm" c="dimmed">
                  {recommendation.reason}
                </Text>
                <Text size="sm" fw={500}>
                  Preço sugerido: {formatCurrency(recommendation.finalPrice)}
                </Text>
              </Stack>
            </Paper>
          )}

          {/* Preset buttons */}
          <Stack gap="sm">
            <Text size="sm" fw={500}>
              Escolha rápida:
            </Text>
            <SimpleGrid cols={3}>
              {presets.map((preset, index) => {
                const isRecommended = preset === recommendation?.percentage;
                const price = isLiquidation
                  ? calculateDiscountedPrice(product.salePrice, preset)
                  : calculateIncreasedPrice(product.salePrice, preset);

                return (
                  <Paper
                    key={preset}
                    withBorder
                    p="md"
                    radius="md"
                    style={{
                      cursor: 'pointer',
                      backgroundColor:
                        selectedPercentage === preset ? 'var(--mantine-color-blue-0)' : undefined,
                      borderColor:
                        selectedPercentage === preset ? 'var(--mantine-color-blue-5)' : undefined,
                    }}
                    onClick={() => setSelectedPercentage(preset)}
                  >
                    <Stack gap="xs" align="center">
                      {selectedPercentage === preset && (
                        <IconCheck size={20} color="var(--mantine-color-blue-6)" />
                      )}
                      <Text size="xl" fw={700}>
                        {preset}%
                      </Text>
                      <Text size="xs" c="dimmed">
                        {presetLabels[index]}
                      </Text>
                      <Text size="sm" fw={500}>
                        {formatCurrency(price)}
                      </Text>
                      {isRecommended && (
                        <Badge size="xs" variant="light" color="blue">
                          Recomendado
                        </Badge>
                      )}
                    </Stack>
                  </Paper>
                );
              })}
            </SimpleGrid>
          </Stack>

          {/* Custom slider */}
          <Paper withBorder p="md" radius="md">
            <Stack gap="md">
              <Text size="sm" fw={500}>
                Ou escolha manualmente:
              </Text>
              <Slider
                value={selectedPercentage}
                onChange={setSelectedPercentage}
                min={minPercentage}
                max={maxPercentage}
                step={1}
                marks={[
                  { value: minPercentage, label: `${minPercentage}%` },
                  { value: maxPercentage, label: `${maxPercentage}%` },
                ]}
                label={(value) => `${value}%`}
                size="lg"
              />
            </Stack>
          </Paper>

          {/* Final price preview */}
          <Paper withBorder p="lg" radius="md" bg="gray.0">
            <Stack gap="md">
              <Group justify="space-between">
                <Stack gap={4}>
                  <Text size="xs" c="dimmed" tt="uppercase">
                    {isLiquidation ? 'Desconto' : 'Aumento'} selecionado
                  </Text>
                  <Text size="xl" fw={700}>
                    {selectedPercentage}%
                  </Text>
                </Stack>
                <Stack gap={4} align="flex-end">
                  <Text size="xs" c="dimmed" tt="uppercase">
                    Preço final
                  </Text>
                  <Text size="2xl" fw={700} c={isLiquidation ? 'red' : 'green'}>
                    {formatCurrency(finalPrice)}
                  </Text>
                </Stack>
              </Group>

              <Group justify="space-between">
                <Text size="sm" c="dimmed">
                  {isLiquidation ? 'Economia' : 'Aumento'}: {formatCurrency(savings)}
                </Text>
                <Text size="sm" c="dimmed">
                  Margem: {(((finalPrice - product.costPrice) / finalPrice) * 100).toFixed(1)}%
                </Text>
              </Group>
            </Stack>
          </Paper>
        </>
      )}

      {/* Navigation buttons */}
      <Group justify="space-between">
        <Button variant="default" leftSection={<IconArrowLeft size={16} />} onClick={onBack}>
          Voltar
        </Button>
        <Button
          variant="gradient"
          gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
          rightSection={<IconArrowRight size={16} />}
          disabled={!product}
          onClick={() => onContinue(selectedPercentage.toString())}
        >
          Continuar
        </Button>
      </Group>
    </Stack>
  );
}
