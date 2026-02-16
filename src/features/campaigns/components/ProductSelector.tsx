/**
 * Product Selector Component
 *
 * Step 2: Select which product to create campaign for
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
  Image,
  Radio,
  Alert,
  Skeleton,
} from '@mantine/core';
import { IconAlertCircle, IconArrowLeft, IconArrowRight, IconSparkles } from '@tabler/icons-react';
import { useQuery } from '@tanstack/react-query';
import type { CampaignType } from '@prisma/client';
import type { CampaignOpportunities } from '@/features/campaigns/types';
import {
  getRecommendedDiscount,
  getRecommendedIncrease,
} from '@/features/campaigns/utils/recommendations';
import { formatCurrency } from '@/lib/utils';

interface ProductSelectorProps {
  type: CampaignType;
  initialProductId?: string | null; // Add initial value support
  onSelect: (productId: string) => void;
  onBack: () => void;
}

export function ProductSelector({
  type,
  initialProductId,
  onSelect,
  onBack,
}: ProductSelectorProps) {
  const [selectedProductId, setSelectedProductId] = useState<string | null>(
    initialProductId || null
  );

  // Fetch opportunities
  const { data, isLoading } = useQuery<CampaignOpportunities>({
    queryKey: ['campaign-opportunities'],
    queryFn: async () => {
      const response = await fetch('/api/campaigns/opportunities');
      if (!response.ok) throw new Error('Failed to fetch opportunities');
      return response.json();
    },
  });

  const products = type === 'LIQUIDATION' ? data?.liquidation.products : data?.opportunity.products;
  const selectedProduct = products?.find((p) => p.blingProductId === selectedProductId);

  // Get recommendation for selected product
  const recommendation = selectedProduct?.alert
    ? type === 'LIQUIDATION'
      ? getRecommendedDiscount(selectedProduct.alert, selectedProduct.salePrice)
      : getRecommendedIncrease(selectedProduct.alert, selectedProduct.salePrice)
    : null;

  return (
    <Stack gap="xl">
      <Stack gap="xs">
        <Title order={2}>
          {type === 'LIQUIDATION' ? 'Campanha de Liquidação' : 'Campanha de Oportunidade'} -
          Selecionar Produto
        </Title>
        <Text c="dimmed">Escolha qual produto você deseja incluir nesta campanha</Text>
      </Stack>

      {isLoading ? (
        <Stack gap="md">
          {[1, 2, 3].map((i) => (
            <Skeleton key={i} height={120} radius="md" />
          ))}
        </Stack>
      ) : !products || products.length === 0 ? (
        <Alert icon={<IconAlertCircle />} title="Nenhum produto disponível" color="yellow">
          Não há produtos elegíveis para este tipo de campanha no momento.
        </Alert>
      ) : (
        <Radio.Group value={selectedProductId || ''} onChange={setSelectedProductId}>
          <Stack gap="md">
            {products.map((product) => {
              const alert = product.alert;
              const rec = alert
                ? type === 'LIQUIDATION'
                  ? getRecommendedDiscount(alert, product.salePrice)
                  : getRecommendedIncrease(alert, product.salePrice)
                : null;

              return (
                <Paper
                  key={product.blingProductId}
                  withBorder
                  p="md"
                  radius="md"
                  style={{
                    cursor: 'pointer',
                    backgroundColor:
                      selectedProductId === product.blingProductId
                        ? 'var(--mantine-color-blue-0)'
                        : undefined,
                    borderColor:
                      selectedProductId === product.blingProductId
                        ? 'var(--mantine-color-blue-5)'
                        : undefined,
                  }}
                  onClick={() => setSelectedProductId(product.blingProductId)}
                >
                  <Group align="flex-start" wrap="nowrap">
                    <Radio value={product.blingProductId} />

                    <Group flex={1} align="flex-start" gap="md">
                      {product.image && (
                        <Image
                          src={product.image}
                          alt={product.name}
                          w={80}
                          h={80}
                          fit="contain"
                          radius="sm"
                        />
                      )}

                      <Stack gap="xs" flex={1}>
                        <div>
                          <Text fw={500} size="md">
                            {product.name}
                          </Text>
                          <Text size="xs" c="dimmed">
                            SKU: {product.sku}
                          </Text>
                        </div>

                        <Group gap="xs">
                          {type === 'LIQUIDATION' && alert && (
                            <>
                              <Badge size="sm" variant="light" color="red">
                                {alert.type === 'DEAD_STOCK'
                                  ? 'Capital Parado'
                                  : 'Excesso de Estoque'}
                              </Badge>
                              {alert.type === 'DEAD_STOCK' && (
                                <Text size="xs" c="dimmed">
                                  {alert.daysSinceLastSale} dias sem venda
                                </Text>
                              )}
                              {alert.type === 'LIQUIDATION' && alert.excessPercentage && (
                                <Text size="xs" c="dimmed">
                                  {alert.excessPercentage.toFixed(0)}% de excesso
                                </Text>
                              )}
                            </>
                          )}
                          {type === 'OPPORTUNITY' && alert && (
                            <>
                              <Badge size="sm" variant="light" color="green">
                                Alta Demanda
                              </Badge>
                              <Text size="xs" c="dimmed">
                                Crescimento: {alert.growthTrend?.toFixed(0)}%
                              </Text>
                            </>
                          )}
                        </Group>

                        <Group gap="md">
                          <div>
                            <Text size="xs" c="dimmed">
                              Estoque
                            </Text>
                            <Text size="sm" fw={500}>
                              {product.currentStock} un.
                            </Text>
                          </div>
                          <div>
                            <Text size="xs" c="dimmed">
                              Preço atual
                            </Text>
                            <Text size="sm" fw={500}>
                              {formatCurrency(product.salePrice)}
                            </Text>
                          </div>
                          {type === 'LIQUIDATION' && alert && (
                            <div>
                              <Text size="xs" c="dimmed">
                                Capital em risco
                              </Text>
                              <Text size="sm" fw={500} c="red">
                                {formatCurrency(alert.capitalStuck + (alert.excessCapital || 0))}
                              </Text>
                            </div>
                          )}
                        </Group>

                        {rec && (
                          <Paper withBorder p="xs" radius="sm" bg="blue.0">
                            <Group gap="xs" wrap="nowrap">
                              <IconSparkles size={16} />
                              <Stack gap={2} flex={1}>
                                <Text size="xs" fw={500}>
                                  Recomendação Nexus: {rec.percentage}%{' '}
                                  {type === 'LIQUIDATION' ? 'de desconto' : 'de aumento'}
                                </Text>
                                <Text size="xs" c="dimmed">
                                  {rec.reason}
                                </Text>
                                <Text size="xs" fw={500} c="blue">
                                  Preço sugerido: {formatCurrency(rec.finalPrice)}
                                </Text>
                              </Stack>
                            </Group>
                          </Paper>
                        )}
                      </Stack>
                    </Group>
                  </Group>
                </Paper>
              );
            })}
          </Stack>
        </Radio.Group>
      )}

      {/* Selected product summary */}
      {selectedProduct && recommendation && (
        <Paper withBorder p="md" radius="md" bg="blue.0">
          <Stack gap="xs">
            <Text size="sm" fw={500}>
              📦 Produto selecionado: {selectedProduct.name}
            </Text>
            <Text size="sm">
              💡 Recomendação: {recommendation.percentage}%{' '}
              {type === 'LIQUIDATION' ? 'de desconto' : 'de aumento'} (
              {formatCurrency(recommendation.finalPrice)})
            </Text>
          </Stack>
        </Paper>
      )}

      {/* Navigation buttons */}
      <Group justify="space-between">
        <Button variant="default" leftSection={<IconArrowLeft size={16} />} onClick={onBack}>
          Voltar
        </Button>
        <Button
          rightSection={<IconArrowRight size={16} />}
          disabled={!selectedProductId}
          onClick={() => selectedProductId && onSelect(selectedProductId)}
        >
          Continuar
        </Button>
      </Group>
    </Stack>
  );
}
