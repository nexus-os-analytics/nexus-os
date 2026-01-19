'use client';
import {
  Alert,
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
import { AlertTriangle, DollarSign, Info, Package as PackageIcon, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { BlingProductType } from '@/lib/bling';
import { formatCurrency } from '@/lib/utils';
import { ruptureRiskLabel } from '../../constants';

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

  return (
    <Card padding="lg" radius="md" withBorder shadow="sm" style={{ height: '100%' }}>
      <Stack gap="md" style={{ height: '100%' }}>
        {/* Header + Status */}
        <Group justify="space-between" align="center">
          <Group gap="sm">
            <ThemeIcon size={40} radius="md" color={style.color} variant="light">
              <Icon size={20} />
            </ThemeIcon>
            <Badge color={style.color} variant="light" size="xl">
              {style.badge}
            </Badge>
          </Group>
          {alert.risk && (
            <Badge
              color={
                alert.risk === 'CRITICAL'
                  ? 'red'
                  : alert.risk === 'HIGH'
                    ? 'orange'
                    : alert.risk === 'MEDIUM'
                      ? 'yellow'
                      : 'green'
              }
              size="lg"
              variant="filled"
            >
              {ruptureRiskLabel[alert.risk]}
            </Badge>
          )}
        </Group>

        {/* Product Media + Summary */}
        <Flex gap="md" align="stretch" wrap="wrap">
          <Box style={{ flex: '0 0 180px' }}>
            <Image
              src={product.image || undefined}
              alt={product.name}
              radius="md"
              fit="cover"
              height={180}
            />
          </Box>
          <Stack gap={6} style={{ flex: 1 }}>
            <Title order={4} style={{ lineHeight: 1.2 }}>
              {product.name}
            </Title>
            <Group gap="xs" c="dimmed">
              <Text size="sm">SKU: {product.sku}</Text>
              <Text size="sm">•</Text>
              <Text size="sm">Categoria: {product.category?.name ?? '—'}</Text>
            </Group>
            <Group justify="space-between" align="center" mt="xs">
              <Title order={3}>{formatCurrency(product.salePrice || 0)}</Title>
              <Group gap="xs">
                <Badge color="gray" variant="light" size="lg">
                  Estoque: {product.currentStock}
                </Badge>
                {typeof alert.idealStock === 'number' && (
                  <Badge color="gray" variant="outline" size="lg">
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

              <Title order={5} mb="xs">
                Estoque e Consumo
              </Title>
              <Stack gap={6}>
                <Group justify="space-between">
                  <Text size="md" c="dimmed">
                    Estoque atual
                  </Text>
                  <Text size="md" fw={600}>
                    {product.currentStock} unid.
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="md" c="dimmed">
                    VVD real
                  </Text>
                  <Text size="md" fw={600}>
                    {alert.vvdReal?.toFixed(2)} unid./dia
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="md" c="dimmed">
                    Ponto de pedido
                  </Text>
                  <Text size="md" fw={600}>
                    {alert.reorderPoint?.toFixed(0)} unid.
                  </Text>
                </Group>
                {typeof alert.daysRemaining === 'number' && (
                  <Group justify="space-between">
                    <Text size="md" c="dimmed">
                      Dias restantes
                    </Text>
                    <Text size="md" fw={600}>
                      {alert.daysRemaining} dias
                    </Text>
                  </Group>
                )}
              </Stack>

              <Divider my="xs" />

              <Title order={6} mb="xs">
                Reposição
              </Title>
              <Text size="md">
                {product.settings?.leadTimeDays ?? 0} dias de lead time +{' '}
                {product.settings?.safetyDays ?? 0} dias de segurança
              </Text>
              <Text size="md" c="dimmed" mt={4}>
                Lead time: tempo entre o pedido e a entrega do fornecedor.
              </Text>
              {alert.daysOutOfStock && alert.daysOutOfStock > 0 && (
                <Paper p="xs" radius="sm" mt="xs" withBorder>
                  <Group gap="xs">
                    <Info size={12} />
                    <Text size="md" style={{ flex: 1 }}>
                      ⚠️ Produto ficou {alert.daysOutOfStock} dias sem estoque no período analisado.
                    </Text>
                  </Group>
                </Paper>
              )}
            </Paper>
          )}

          {alert.type === 'DEAD_STOCK' && (
            <Paper p="md" radius="md" withBorder>
              <Title order={5} mb="xs">
                Capital parado
              </Title>
              <Title order={4}>{formatCurrency(alert.capitalStuck || 0)}</Title>
              <Text size="md" c="dimmed" mb="sm">
                Sem vendas há {alert.daysSinceLastSale ?? 0} dias
              </Text>

              <Stack gap={6}>
                <Group justify="space-between">
                  <Text size="md" c="dimmed">
                    Estoque
                  </Text>
                  <Text size="md" fw={600}>
                    {product.currentStock} unid.
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="md" c="dimmed">
                    Custo
                  </Text>
                  <Text size="md" fw={600}>
                    {formatCurrency(product.costPrice || 0)}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="md" c="dimmed">
                    Preço de venda
                  </Text>
                  <Text size="md" fw={600}>
                    {formatCurrency(product.salePrice || 0)}
                  </Text>
                </Group>
              </Stack>
            </Paper>
          )}

          {alert.type === 'OPPORTUNITY' && (
            <Paper p="md" radius="md" withBorder>
              <Title order={5} mb="xs">
                Oportunidade
              </Title>
              <Title order={4}>{(alert.growthTrend ?? 0).toFixed(1)}%</Title>

              <Stack gap={6} mt="xs">
                <Group justify="space-between">
                  <Text size="md" c="dimmed">
                    VVD últimos 7 dias
                  </Text>
                  <Text size="md" fw={600}>
                    {alert.vvd7?.toFixed(1)} unid./dia
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="md" c="dimmed">
                    VVD últimos 30 dias
                  </Text>
                  <Text size="md" fw={600}>
                    {alert.vvd30?.toFixed(1)} unid./dia
                  </Text>
                </Group>
                {typeof alert.daysRemaining === 'number' && (
                  <Group justify="space-between">
                    <Text size="md" c="dimmed">
                      Dias de estoque restante
                    </Text>
                    <Text size="md" fw={600}>
                      {alert.daysRemaining} dias
                    </Text>
                  </Group>
                )}
              </Stack>
              <Divider my="xs" />
              <Group gap="xs">
                <PackageIcon size={14} />
                <Text size="md">Estoque atual: {product.currentStock} unidades</Text>
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
              <Title order={5} mb="xs">
                Resumo
              </Title>
              <Stack gap={6}>
                <Group justify="space-between">
                  <Text size="md" c="dimmed">
                    Estoque atual
                  </Text>
                  <Text size="md" fw={600}>
                    {product.currentStock} unid.
                  </Text>
                </Group>

                {typeof alert.idealStock === 'number' && (
                  <Group justify="space-between">
                    <Text size="md" c="dimmed">
                      Estoque ideal
                    </Text>
                    <Text size="md" fw={600}>
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
                        <Text size="md" c="dimmed">
                          Excesso
                        </Text>
                        <Text size="md" fw={600}>
                          {label}
                        </Text>
                      </Group>
                    );
                  })()}

                {typeof alert.excessCapital === 'number' && (
                  <Group justify="space-between">
                    <Text size="md" c="dimmed">
                      Capital em excesso
                    </Text>
                    <Text size="md" fw={600}>
                      {formatCurrency(alert.excessCapital)}
                    </Text>
                  </Group>
                )}

                {typeof alert.estimatedDeadline === 'number' && alert.estimatedDeadline > 0 && (
                  <Group justify="space-between">
                    <Text size="md" c="dimmed">
                      Prazo estimado
                    </Text>
                    <Text size="md" fw={600}>
                      {alert.estimatedDeadline} dias
                    </Text>
                  </Group>
                )}

                {typeof alert.recoverableAmount === 'number' && (
                  <Group justify="space-between">
                    <Text size="md" c="dimmed">
                      Valor recuperável
                    </Text>
                    <Text size="md" fw={600}>
                      {formatCurrency(alert.recoverableAmount)}
                    </Text>
                  </Group>
                )}

                {typeof alert.suggestedPrice === 'number' && alert.suggestedPrice > 0 && (
                  <Group justify="space-between">
                    <Text size="md" c="dimmed">
                      Preço sugerido
                    </Text>
                    <Text size="md" fw={600}>
                      {formatCurrency(alert.suggestedPrice)}
                    </Text>
                  </Group>
                )}

                {(typeof alert.vvd7 === 'number' || typeof alert.vvd30 === 'number') && (
                  <>
                    <Divider my="xs" />
                    {typeof alert.vvdReal === 'number' && (
                      <Text size="md" mb="xs">
                        VVD Real: {alert.vvdReal.toFixed(1)} unid./dia
                      </Text>
                    )}
                    {typeof alert.vvd7 === 'number' && (
                      <Text size="md" mb="xs">
                        VVD 7d: {alert.vvd7.toFixed(1)} unid./dia
                      </Text>
                    )}
                    {typeof alert.vvd30 === 'number' && (
                      <Text size="md">VVD 30d: {alert.vvd30.toFixed(1)} unid./dia</Text>
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
                          <Text size="md" mb="xs">
                            Recomendações:
                          </Text>
                          <Stack gap={4}>
                            {recs.map((r: string, i: number) => (
                              <Text key={i} size="md">
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
              <Title order={5} mb="xs">
                Liquidação
              </Title>
              <Stack gap={6}>
                <Group justify="space-between">
                  <Text size="md" c="dimmed">
                    Estoque atual
                  </Text>
                  <Text size="md" fw={600}>
                    {product.currentStock} unid.
                  </Text>
                </Group>

                {typeof alert.idealStock === 'number' && (
                  <Group justify="space-between">
                    <Text size="md" c="dimmed">
                      Estoque ideal
                    </Text>
                    <Text size="md" fw={600}>
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
                        <Text size="md" c="dimmed">
                          Excesso
                        </Text>
                        <Text size="md" fw={600}>
                          {label}
                        </Text>
                      </Group>
                    );
                  })()}

                {typeof alert.excessCapital === 'number' && (
                  <Group justify="space-between">
                    <Text size="md" c="dimmed">
                      Capital em excesso
                    </Text>
                    <Text size="md" fw={600}>
                      {formatCurrency(alert.excessCapital)}
                    </Text>
                  </Group>
                )}

                {typeof alert.capitalStuck === 'number' && alert.capitalStuck > 0 && (
                  <Group justify="space-between">
                    <Text size="md" c="dimmed">
                      Capital parado
                    </Text>
                    <Text size="md" fw={600}>
                      {formatCurrency(alert.capitalStuck)}
                    </Text>
                  </Group>
                )}

                {typeof alert.suggestedPrice === 'number' && alert.suggestedPrice > 0 ? (
                  <Group justify="space-between">
                    <Text size="md" c="dimmed">
                      Preço sugerido
                    </Text>
                    <Text size="md" fw={600}>
                      {formatCurrency(alert.suggestedPrice)}
                    </Text>
                  </Group>
                ) : (
                  <>
                    <Group justify="space-between">
                      <Text size="md" c="dimmed">
                        Preço atual
                      </Text>
                      <Text size="md" fw={600}>
                        {formatCurrency(product.salePrice || 0)}
                      </Text>
                    </Group>
                    <Group justify="space-between">
                      <Text size="md" c="dimmed">
                        Custo
                      </Text>
                      <Text size="md" fw={600}>
                        {formatCurrency(product.costPrice || 0)}
                      </Text>
                    </Group>
                  </>
                )}

                {typeof alert.daysSinceLastSale === 'number' && alert.daysSinceLastSale > 0 && (
                  <Group justify="space-between">
                    <Text size="md" c="dimmed">
                      Dias desde última venda
                    </Text>
                    <Text size="md" fw={600}>
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
                      <Text size="md" mb="xs">
                        VVD Real: {alert.vvdReal.toFixed(1)} unid./dia
                      </Text>
                    )}
                    {typeof alert.vvd7 === 'number' && (
                      <Text size="md" mb="xs">
                        VVD 7d: {alert.vvd7.toFixed(1)} unid./dia
                      </Text>
                    )}
                    {typeof alert.vvd30 === 'number' && (
                      <Text size="md" mb="xs">
                        VVD 30d: {alert.vvd30.toFixed(1)} unid./dia
                      </Text>
                    )}
                    {typeof alert.daysRemaining === 'number' && (
                      <Text size="md">Dias de estoque restante: {alert.daysRemaining} dias</Text>
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
                          <Text size="md" mb="xs">
                            Recomendações:
                          </Text>
                          <Stack gap={4}>
                            {recs.map((r: string, i: number) => (
                              <Text key={i} size="md">
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

        {/* CTA: único botão de detalhes */}
        <Group justify="flex-end" mt="sm">
          <Button
            type="button"
            size="lg"
            onClick={() => {
              router.push(`/produto/${product.blingProductId}`);
            }}
            variant="filled"
            color={style.color}
          >
            Ver detalhes
          </Button>
        </Group>
      </Stack>
    </Card>
  );
}
