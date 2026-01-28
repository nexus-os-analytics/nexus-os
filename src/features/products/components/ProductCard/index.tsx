'use client';
import type { MantineTheme } from '@mantine/core';
import {
  Alert,
  AspectRatio,
  alpha,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Flex,
  Group,
  Image,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';

type ThemeWithScheme = MantineTheme & { colorScheme?: 'dark' | 'light' };
const BORDER_SHADE = 6 as const;
const BG_SHADE_LIGHT = 0 as const;
const BG_SHADE_DARK = 9 as const;
const BG_ALPHA_LIGHT = 0.12 as const;
const BG_ALPHA_DARK = 0.06 as const;

import {
  AlertTriangle,
  DollarSign,
  Info,
  Package as PackageIcon,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { BlingProductType } from '@/lib/bling';
import { formatCurrency } from '@/lib/utils';

// rupture risk badge removed from ProductCard

interface ProductCardProps {
  product: BlingProductType;
}

export function ProductCard({ product }: ProductCardProps) {
  const { alert } = product;
  const router = useRouter();

  if (!alert) {
    throw new Error('Alert data is required for ProductCard component.');
  }

  const getCardStyle = () => {
    switch (alert.type) {
      case 'RUPTURE':
        return {
          color: 'red',
          icon: AlertTriangle,
          badge: 'Risco de Ruptura do Estoque',
        };
      case 'DEAD_STOCK':
        return {
          color: 'brand',
          icon: DollarSign,
          badge: 'Dinheiro Parado',
        };
      case 'OPPORTUNITY':
        return {
          color: 'green',
          icon: TrendingUp,
          badge: 'Oportunidade',
        };
      case 'FINE':
        return {
          color: 'blue',
          icon: Info,
          badge: 'Observar',
        };
      case 'LIQUIDATION':
        return {
          color: 'orange',
          icon: PackageIcon,
          badge: 'Liquidação',
        };
      default:
        return { color: 'gray', icon: PackageIcon, badge: 'Produto' };
    }
  };

  const style = getCardStyle();
  const Icon = style?.icon;
  const showDualCtas = alert.type === 'DEAD_STOCK' || alert.type === 'LIQUIDATION';

  return (
    <Card
      padding="lg"
      radius="md"
      withBorder
      shadow="sm"
      style={{ height: '100%' }}
      styles={(theme: ThemeWithScheme) => {
        const palette =
          (theme.colors as Record<string, readonly string[]>)[style.color] ?? theme.colors.gray;
        const BG_SHADE = theme.colorScheme === 'dark' ? BG_SHADE_DARK : BG_SHADE_LIGHT;
        const BG_ALPHA = theme.colorScheme === 'dark' ? BG_ALPHA_DARK : BG_ALPHA_LIGHT;
        return {
          root: {
            borderColor: palette[BORDER_SHADE],
            backgroundColor: alpha(palette[BG_SHADE], BG_ALPHA),
          },
        };
      }}
    >
      <Stack gap="md" style={{ height: '100%' }}>
        {/* Header + Status */}
        <Group justify="space-between" align="center">
          <Group gap="sm">
            <ThemeIcon size={36} radius="md" color={style.color} variant="light">
              <Icon size={20} />
            </ThemeIcon>
            <Badge color={style.color} variant="light" size="md">
              {style.badge}
            </Badge>
          </Group>
          {/* Rupture risk badge removed as requested */}
        </Group>

        {/* Product Media + Summary */}
        <Flex gap="md" align="stretch" wrap="wrap">
          <Box style={{ flex: '0 0 120px' }}>
            <AspectRatio ratio={1} style={{ width: '100%' }}>
              <Image
                src={product.image || undefined}
                alt={product.name}
                radius="md"
                fit="contain"
                height="100%"
              />
            </AspectRatio>
          </Box>
          <Stack gap={6} style={{ flex: 1 }}>
            <Title order={5} style={{ lineHeight: 1.2 }}>
              {product.name}
            </Title>
            <Group gap="xs" c="dimmed">
              <Text size="xs">SKU: {product.sku}</Text>
              <Text size="xs">•</Text>
              <Text size="xs">Categoria: {product.category?.name ?? '—'}</Text>
            </Group>
            <Group justify="space-between" align="center" mt="xs">
              <Title order={4}>{formatCurrency(product.salePrice || 0)}</Title>
              <Group gap="xs">
                <Badge color="gray" variant="light" size="md">
                  Estoque: {product.currentStock}
                </Badge>
                {typeof alert.idealStock === 'number' && (
                  <Badge color="gray" variant="outline" size="md">
                    Ideal: {alert.idealStock}
                  </Badge>
                )}
              </Group>
            </Group>
          </Stack>
        </Flex>

        {/* Content by Type */}
        <Box style={{ flex: 1 }}>
          {alert.type === 'RUPTURE' && (
            <Paper p="md" radius="md" withBorder>
              {/* Risk Message */}
              <Alert
                variant="light"
                color="red"
                title="Ação Recomendadas"
                icon={<AlertTriangle size={16} />}
                mb="md"
              >
                {alert.message ?? 'Atenção: risco de ruptura de estoque identificado.'}
              </Alert>

              <Title order={6} mb="xs">
                Estoque e Consumo
              </Title>
              <Stack gap={6}>
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    Estoque atual
                  </Text>
                  <Text size="sm" fw={600}>
                    {product.currentStock} unid.
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    VVD real
                  </Text>
                  <Text size="sm" fw={600}>
                    {alert.vvdReal?.toFixed(2)} unid./dia
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    Ponto de pedido
                  </Text>
                  <Text size="sm" fw={600}>
                    {alert.reorderPoint?.toFixed(0)} unid.
                  </Text>
                </Group>
                {typeof alert.daysRemaining === 'number' && (
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Dias restantes
                    </Text>
                    <Text size="sm" fw={600}>
                      {alert.daysRemaining} dias
                    </Text>
                  </Group>
                )}
              </Stack>

              <Divider my="xs" />

              <Title order={6} mb="xs">
                Reposição
              </Title>
              <Text size="sm">
                {product.settings?.leadTimeDays ?? 0} dias de lead time +{' '}
                {product.settings?.safetyDays ?? 0} dias de segurança
              </Text>
              <Text size="sm" c="dimmed" mt={4}>
                Lead time: tempo entre o pedido e a entrega do fornecedor.
              </Text>
              {alert.daysOutOfStock && alert.daysOutOfStock > 0 && (
                <Paper p="xs" radius="sm" mt="xs" withBorder>
                  <Group gap="xs">
                    <Info size={12} />
                    <Text size="sm" style={{ flex: 1 }}>
                      ⚠️ Produto ficou {alert.daysOutOfStock} dias sem estoque no período analisado.
                    </Text>
                  </Group>
                </Paper>
              )}
            </Paper>
          )}

          {alert.type === 'DEAD_STOCK' && (
            <Paper p="md" radius="md" withBorder>
              <Title order={6} mb="xs">
                Capital parado
              </Title>
              <Title order={5}>{formatCurrency(alert.capitalStuck || 0)}</Title>
              <Text size="sm" c="dimmed" mb="sm">
                Sem vendas há {alert.daysSinceLastSale ?? 0} dias
              </Text>

              <Stack gap={6}>
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    Estoque
                  </Text>
                  <Text size="sm" fw={600}>
                    {product.currentStock} unid.
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    Custo
                  </Text>
                  <Text size="sm" fw={600}>
                    {formatCurrency(product.costPrice || 0)}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    Preço de venda
                  </Text>
                  <Text size="sm" fw={600}>
                    {formatCurrency(product.salePrice || 0)}
                  </Text>
                </Group>
              </Stack>
            </Paper>
          )}

          {alert.type === 'OPPORTUNITY' && (
            <Paper p="md" radius="md" withBorder>
              <Title order={6} mb="xs">
                Oportunidade
              </Title>
              <Title order={5}>{(alert.growthTrend ?? 0).toFixed(1)}%</Title>

              <Stack gap={6} mt="xs">
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    VVD últimos 7 dias
                  </Text>
                  <Text size="sm" fw={600}>
                    {alert.vvd7?.toFixed(1)} unid./dia
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    VVD últimos 30 dias
                  </Text>
                  <Text size="sm" fw={600}>
                    {alert.vvd30?.toFixed(1)} unid./dia
                  </Text>
                </Group>
                {typeof alert.daysRemaining === 'number' && (
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Dias de estoque restante
                    </Text>
                    <Text size="sm" fw={600}>
                      {alert.daysRemaining} dias
                    </Text>
                  </Group>
                )}
              </Stack>
              <Divider my="xs" />
              <Group gap="xs">
                <PackageIcon size={14} />
                <Text size="sm">Estoque atual: {product.currentStock} unidades</Text>
              </Group>
            </Paper>
          )}

          {alert.type === 'FINE' && (
            <Paper p="md" radius="md" withBorder>
              {alert.message ? (
                <Alert
                  variant="light"
                  color="yellow"
                  title="Ação Recomendadas"
                  icon={<AlertTriangle size={16} />}
                  mb="md"
                >
                  {alert.message ?? 'Atenção: recomenda-se observar este produto.'}
                </Alert>
              ) : null}
              <Title order={6} mb="xs">
                Resumo
              </Title>
              <Stack gap={6}>
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    Estoque atual
                  </Text>
                  <Text size="sm" fw={600}>
                    {product.currentStock} unid.
                  </Text>
                </Group>

                {typeof alert.idealStock === 'number' && (
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Estoque ideal
                    </Text>
                    <Text size="sm" fw={600}>
                      {alert.idealStock}
                    </Text>
                  </Group>
                )}

                {(typeof alert.excessUnits === 'number' ||
                  typeof alert.excessPercentage === 'number') &&
                  (() => {
                    let label = '';
                    const hasUnits = typeof alert.excessUnits === 'number';
                    const hasPct = typeof alert.excessPercentage === 'number';
                    if (hasUnits && hasPct) {
                      label = `Excesso: ${Number(alert.excessUnits).toFixed(0)} unid. (${Number(alert.excessPercentage).toFixed(1)}%)`;
                    } else if (hasUnits) {
                      label = `Excesso: ${Number(alert.excessUnits).toFixed(0)} unid.`;
                    } else if (hasPct) {
                      label = `Excesso: ${Number(alert.excessPercentage).toFixed(1)}%`;
                    }
                    return (
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Excesso
                        </Text>
                        <Text size="sm" fw={600}>
                          {label}
                        </Text>
                      </Group>
                    );
                  })()}

                {typeof alert.excessCapital === 'number' && (
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Capital em excesso
                    </Text>
                    <Text size="sm" fw={600}>
                      {formatCurrency(alert.excessCapital)}
                    </Text>
                  </Group>
                )}

                {typeof alert.estimatedDeadline === 'number' && alert.estimatedDeadline > 0 && (
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Prazo estimado
                    </Text>
                    <Text size="sm" fw={600}>
                      {alert.estimatedDeadline} dias
                    </Text>
                  </Group>
                )}

                {typeof alert.recoverableAmount === 'number' && (
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Valor recuperável
                    </Text>
                    <Text size="sm" fw={600}>
                      {formatCurrency(alert.recoverableAmount)}
                    </Text>
                  </Group>
                )}

                {typeof alert.suggestedPrice === 'number' && alert.suggestedPrice > 0 && (
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Preço sugerido
                    </Text>
                    <Text size="sm" fw={600}>
                      {formatCurrency(alert.suggestedPrice)}
                    </Text>
                  </Group>
                )}

                {(typeof alert.vvd7 === 'number' || typeof alert.vvd30 === 'number') && (
                  <>
                    <Divider my="xs" />
                    {typeof alert.vvdReal === 'number' && (
                      <Text size="sm" mb="xs">
                        VVD Real: {alert.vvdReal.toFixed(1)} unid./dia
                      </Text>
                    )}
                    {typeof alert.vvd7 === 'number' && (
                      <Text size="sm" mb="xs">
                        VVD 7d: {alert.vvd7.toFixed(1)} unid./dia
                      </Text>
                    )}
                    {typeof alert.vvd30 === 'number' && (
                      <Text size="sm">VVD 30d: {alert.vvd30.toFixed(1)} unid./dia</Text>
                    )}
                  </>
                )}

                {alert.recommendations &&
                  (() => {
                    try {
                      const recs = Array.isArray(alert.recommendations)
                        ? alert.recommendations
                        : JSON.parse(alert.recommendations as unknown as string);
                      return Array.isArray(recs) && recs.length > 0 ? (
                        <>
                          <Divider my="xs" />
                          <Text size="sm" mb="xs">
                            Ações recomendadas:
                          </Text>
                          <Stack gap={4}>
                            {recs.map((r: string, i: number) => (
                              <Text key={i} size="sm">
                                - {r}
                              </Text>
                            ))}
                          </Stack>
                        </>
                      ) : null;
                    } catch {
                      return null;
                    }
                  })()}
              </Stack>
            </Paper>
          )}

          {alert.type === 'LIQUIDATION' && (
            <Paper p="md" radius="md" withBorder>
              <Title order={6} mb="xs">
                Liquidação
              </Title>
              <Stack gap={6}>
                <Group justify="space-between">
                  <Text size="sm" c="dimmed">
                    Estoque atual
                  </Text>
                  <Text size="sm" fw={600}>
                    {product.currentStock} unid.
                  </Text>
                </Group>

                {typeof alert.idealStock === 'number' && (
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Estoque ideal
                    </Text>
                    <Text size="sm" fw={600}>
                      {alert.idealStock}
                    </Text>
                  </Group>
                )}

                {(typeof alert.excessUnits === 'number' ||
                  typeof alert.excessPercentage === 'number') &&
                  (() => {
                    let label = '';
                    const hasUnits = typeof alert.excessUnits === 'number';
                    const hasPct = typeof alert.excessPercentage === 'number';
                    if (hasUnits && hasPct) {
                      label = `Excesso: ${Number(alert.excessUnits).toFixed(0)} unid. (${Number(alert.excessPercentage).toFixed(1)}%)`;
                    } else if (hasUnits) {
                      label = `Excesso: ${Number(alert.excessUnits).toFixed(0)} unid.`;
                    } else if (hasPct) {
                      label = `Excesso: ${Number(alert.excessPercentage).toFixed(1)}%`;
                    }
                    return (
                      <Group justify="space-between">
                        <Text size="sm" c="dimmed">
                          Excesso
                        </Text>
                        <Text size="sm" fw={600}>
                          {label}
                        </Text>
                      </Group>
                    );
                  })()}

                {typeof alert.excessCapital === 'number' && (
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Capital em excesso
                    </Text>
                    <Text size="sm" fw={600}>
                      {formatCurrency(alert.excessCapital)}
                    </Text>
                  </Group>
                )}

                {typeof alert.capitalStuck === 'number' && alert.capitalStuck > 0 && (
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Capital parado
                    </Text>
                    <Text size="sm" fw={600}>
                      {formatCurrency(alert.capitalStuck)}
                    </Text>
                  </Group>
                )}

                {typeof alert.suggestedPrice === 'number' && alert.suggestedPrice > 0 ? (
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Preço sugerido
                    </Text>
                    <Text size="sm" fw={600}>
                      {formatCurrency(alert.suggestedPrice)}
                    </Text>
                  </Group>
                ) : (
                  <>
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Preço atual
                      </Text>
                      <Text size="sm" fw={600}>
                        {formatCurrency(product.salePrice || 0)}
                      </Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="sm" c="dimmed">
                        Custo
                      </Text>
                      <Text size="sm" fw={600}>
                        {formatCurrency(product.costPrice || 0)}
                      </Text>
                    </Group>
                  </>
                )}

                {typeof alert.daysSinceLastSale === 'number' && alert.daysSinceLastSale > 0 && (
                  <Group justify="space-between">
                    <Text size="sm" c="dimmed">
                      Dias desde última venda
                    </Text>
                    <Text size="sm" fw={600}>
                      {alert.daysSinceLastSale}
                    </Text>
                  </Group>
                )}

                {(typeof alert.vvd7 === 'number' ||
                  typeof alert.vvd30 === 'number' ||
                  typeof alert.daysRemaining === 'number') && (
                  <>
                    <Divider my="xs" />
                    {typeof alert.vvdReal === 'number' && (
                      <Text size="sm" mb="xs">
                        VVD Real: {alert.vvdReal.toFixed(1)} unid./dia
                      </Text>
                    )}
                    {typeof alert.vvd7 === 'number' && (
                      <Text size="sm" mb="xs">
                        VVD 7d: {alert.vvd7.toFixed(1)} unid./dia
                      </Text>
                    )}
                    {typeof alert.vvd30 === 'number' && (
                      <Text size="sm" mb="xs">
                        VVD 30d: {alert.vvd30.toFixed(1)} unid./dia
                      </Text>
                    )}
                    {typeof alert.daysRemaining === 'number' && (
                      <Text size="sm">Dias de estoque restante: {alert.daysRemaining} dias</Text>
                    )}
                  </>
                )}

                {alert.recommendations &&
                  (() => {
                    try {
                      const recs = Array.isArray(alert.recommendations)
                        ? alert.recommendations
                        : JSON.parse(alert.recommendations as unknown as string);
                      return Array.isArray(recs) && recs.length > 0 ? (
                        <>
                          <Divider my="xs" />
                          <Text size="sm" mb="xs">
                            Recomendações:
                          </Text>
                          <Stack gap={4}>
                            {recs.map((r: string, i: number) => (
                              <Text key={i} size="sm">
                                - {r}
                              </Text>
                            ))}
                          </Stack>
                        </>
                      ) : null;
                    } catch {
                      return null;
                    }
                  })()}
              </Stack>
            </Paper>
          )}
        </Box>

        {/* CTAs */}
        {showDualCtas ? (
          <Stack mt="sm">
            <Button
              type="button"
              onClick={() => {
                router.push(`/produto/${product.blingProductId}`);
              }}
              variant="light"
              color={style.color}
            >
              Ver detalhes
            </Button>
            <Button
              type="button"
              onClick={() => {
                router.push(`/produto/${product.blingProductId}?tab=campaign`);
              }}
              variant="filled"
              color={style.color}
              leftSection={<Sparkles size={16} />}
            >
              Gerar campanha com IA
            </Button>
          </Stack>
        ) : (
          <Group justify="flex-end" mt="sm">
            <Button
              type="button"
              onClick={() => {
                router.push(`/produto/${product.blingProductId}`);
              }}
              variant="filled"
              color={style.color}
              fullWidth
            >
              Ver detalhes
            </Button>
          </Group>
        )}
      </Stack>
    </Card>
  );
}
