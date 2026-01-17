'use client';
import {
  Avatar,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Flex,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { AlertTriangle, DollarSign, Info, Package as PackageIcon, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { BlingProductType } from '@/lib/bling';
import { formatCurrency } from '@/lib/utils';

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
    <Card
      padding="lg"
      radius="md"
      withBorder
      shadow="sm"
      style={{ height: '100%', cursor: 'pointer' }}
      onClick={() => router.push(`/produto/${product.blingProductId}`)}
    >
      <Stack gap="md" style={{ height: '100%' }}>
        {/* Header */}
        <Box>
          <Group justify="space-between" align="start" mb="md">
            <ThemeIcon size={40} radius="md" color={style.color} variant="light">
              <Icon size={20} />
            </ThemeIcon>
            <Badge color={style.color} variant="light">
              {style.badge}
            </Badge>
          </Group>

          {/* Product Description */}
          <Flex gap="xs">
            <Avatar
              src={product.image}
              alt={product.name}
              size={80}
              radius="md"
              variant="filled"
              style={{ aspectRatio: '1 / 1', objectFit: 'contain' }}
            />
            <Stack gap={4}>
              <Text lineClamp={2}>{product.name}</Text>
              <Group gap="xs">
                <Text size="sm">SKU: {product.sku}</Text>
                <Text size="xs">Categoria: {product.category?.name ?? '—'}</Text>
              </Group>

              {/* Product commercial info */}
              <Group justify="space-between" align="center" mb="sm">
                <Text fw={600}>{formatCurrency(product.salePrice || 0)}</Text>
                <Group gap={8} style={{ color: 'var(--mantine-color-dimmed)' }}>
                  <Group gap={4}>
                    <PackageIcon size={14} />
                    <Text size="xs">Estoque: {product.currentStock} unid.</Text>
                  </Group>
                  {typeof alert.idealStock === 'number' && (
                    <Text size="xs">Ideal: {alert.idealStock}</Text>
                  )}
                </Group>
              </Group>
            </Stack>
          </Flex>
        </Box>

        {/* Content by Type */}
        <Box style={{ flex: 1 }}>
          {alert.type === 'RUPTURE' && (
            <Paper
              p="md"
              radius="md"
              style={{
                backgroundColor: `var(--mantine-color-red-light)`,
              }}
            >
              {/* Risk Message */}
              <Paper
                p="xs"
                radius="sm"
                mb="md"
                style={{
                  backgroundColor: `var(--mantine-color-red-0)`,
                  borderLeft: `3px solid var(--mantine-color-red-5)`,
                }}
              >
                <Group gap="xs">
                  <AlertTriangle size={16} />
                  <Text size="xs" style={{ flex: 1 }}>
                    {alert.message ?? 'Atenção: risco de ruptura de estoque identificado.'}
                  </Text>
                </Group>
              </Paper>

              <Text size="sm" mb="xs">
                Restam apenas <strong>{alert.daysRemaining} dias</strong> de estoque
              </Text>

              <Group gap="xs" mb="xs">
                <PackageIcon size={14} />
                <Text size="xs">Estoque atual: {product.currentStock} unidades</Text>
              </Group>

              <Text size="xs" mb="xs">
                VVD Real: {alert.vvdReal?.toFixed(2)} unid./dia
              </Text>

              <Text size="xs" mb="xs">
                Ponto de Pedido: {alert.reorderPoint?.toFixed(0)} unidades
              </Text>

              <Divider my="xs" />

              <Text size="xs">
                Tempo de Reposição: {product.settings?.leadTimeDays ?? 0} dias +{' '}
                {product.settings?.safetyDays ?? 0} dias de segurança
              </Text>
              <Text size="xs" c="dimmed" mt={4}>
                O lead time é o tempo que o fornecedor leva para entregar um novo pedido após a
                compra ser realizada.
              </Text>
              {alert.daysOutOfStock && alert.daysOutOfStock > 0 && (
                <Paper
                  p="xs"
                  radius="sm"
                  mt="xs"
                  style={{
                    backgroundColor: 'var(--mantine-color-red-light)',
                    borderLeft: '3px solid var(--mantine-color-red-5)',
                  }}
                >
                  <Group gap="xs">
                    <Info size={12} />
                    <Text size="xs" style={{ flex: 1 }}>
                      ⚠️ Produto ficou {alert.daysOutOfStock} dias sem estoque no período analisado.
                    </Text>
                  </Group>
                </Paper>
              )}
            </Paper>
          )}

          {alert.type === 'DEAD_STOCK' && (
            <Paper
              p="md"
              radius="md"
              style={{ backgroundColor: 'var(--mantine-color-brand-light)' }}
            >
              <Text size="sm" mb="xs">
                <strong>{formatCurrency(alert.capitalStuck || 0)}</strong> parados há{' '}
                <strong>{alert.daysSinceLastSale ?? 0} dias</strong>
              </Text>

              <Group gap="xs" mb="xs">
                <PackageIcon size={14} />
                <Text size="xs">Estoque: {product.currentStock} unidades</Text>
              </Group>

              <Text size="xs" mb="md">
                Custo: {formatCurrency(product.costPrice || 0)} | Venda:{' '}
                {formatCurrency(product.salePrice || 0)}
              </Text>
            </Paper>
          )}

          {alert.type === 'OPPORTUNITY' && (
            <Paper
              p="md"
              radius="md"
              style={{ backgroundColor: 'var(--mantine-color-green-light)' }}
            >
              <Text size="sm" mb="xs">
                Tendência de crescimento: <strong>{(alert.growthTrend ?? 0).toFixed(1)}%</strong>
              </Text>

              <Text size="xs" mb="xs">
                VVD últimos 7 dias: {alert.vvd7?.toFixed(1)} unid./dia
              </Text>

              <Text size="xs" mb="xs">
                VVD últimos 30 dias: {alert.vvd30?.toFixed(1)} unid./dia
              </Text>

              {alert.daysRemaining !== undefined && (
                <Text size="xs" mb="xs">
                  Dias de estoque restante: {alert.daysRemaining} dias
                </Text>
              )}
              <Divider my="xs" />
              <Group gap="xs">
                <PackageIcon size={14} />
                <Text size="xs">Estoque atual: {product.currentStock} unidades</Text>
              </Group>
            </Paper>
          )}

          {alert.type === 'FINE' && (
            <Paper
              p="md"
              radius="md"
              style={{ backgroundColor: 'var(--mantine-color-blue-light)' }}
            >
              {alert.message ? (
                <Paper
                  p="xs"
                  radius="sm"
                  mb="md"
                  style={{
                    backgroundColor: 'var(--mantine-color-blue-0)',
                    borderLeft: '3px solid var(--mantine-color-blue-5)',
                  }}
                >
                  <Group gap="xs">
                    <Info size={14} />
                    <Text size="xs" style={{ flex: 1 }}>
                      {alert.message}
                    </Text>
                  </Group>
                </Paper>
              ) : null}

              <Group gap="xs" mb="xs">
                <PackageIcon size={14} />
                <Text size="xs">Estoque atual: {product.currentStock} unidades</Text>
              </Group>

              {typeof alert.idealStock === 'number' && (
                <Text size="xs" mb="xs">
                  Estoque ideal: {alert.idealStock}
                </Text>
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
                    <Text size="xs" mb="xs">
                      {label}
                    </Text>
                  );
                })()}

              {typeof alert.excessCapital === 'number' && (
                <Text size="xs" mb="xs">
                  Capital em excesso: {formatCurrency(alert.excessCapital)}
                </Text>
              )}

              {typeof alert.estimatedDeadline === 'number' && alert.estimatedDeadline > 0 && (
                <Text size="xs" mb="xs">
                  Prazo estimado para correção: {alert.estimatedDeadline} dias
                </Text>
              )}

              {typeof alert.recoverableAmount === 'number' && (
                <Text size="xs" mb="xs">
                  Valor recuperável estimado: {formatCurrency(alert.recoverableAmount)}
                </Text>
              )}

              {typeof alert.suggestedPrice === 'number' && alert.suggestedPrice > 0 && (
                <Text size="xs" mb="xs">
                  Preço sugerido: {formatCurrency(alert.suggestedPrice)}
                </Text>
              )}

              {(typeof alert.vvd7 === 'number' || typeof alert.vvd30 === 'number') && (
                <>
                  <Divider my="xs" />
                  {typeof alert.vvdReal === 'number' && (
                    <Text size="xs" mb="xs">
                      VVD Real: {alert.vvdReal.toFixed(1)} unid./dia
                    </Text>
                  )}
                  {typeof alert.vvd7 === 'number' && (
                    <Text size="xs" mb="xs">
                      VVD 7d: {alert.vvd7.toFixed(1)} unid./dia
                    </Text>
                  )}
                  {typeof alert.vvd30 === 'number' && (
                    <Text size="xs">VVD 30d: {alert.vvd30.toFixed(1)} unid./dia</Text>
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
                        <Text size="xs" mb="xs">
                          Recomendações:
                        </Text>
                        <Stack gap={4}>
                          {recs.map((r: string, i: number) => (
                            <Text key={i} size="xs">
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
            </Paper>
          )}

          {alert.type === 'LIQUIDATION' && (
            <Paper
              p="md"
              radius="md"
              style={{ backgroundColor: 'var(--mantine-color-orange-light)' }}
            >
              <Group gap="xs" mb="xs">
                <PackageIcon size={14} />
                <Text size="xs">Estoque atual: {product.currentStock} unidades</Text>
              </Group>

              {typeof alert.idealStock === 'number' && (
                <Text size="xs" mb="xs">
                  Estoque ideal: {alert.idealStock}
                </Text>
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
                    <Text size="xs" mb="xs">
                      {label}
                    </Text>
                  );
                })()}

              {typeof alert.excessCapital === 'number' && (
                <Text size="xs" mb="xs">
                  Capital em excesso: {formatCurrency(alert.excessCapital)}
                </Text>
              )}

              {typeof alert.capitalStuck === 'number' && alert.capitalStuck > 0 && (
                <Text size="xs" mb="xs">
                  Capital parado: {formatCurrency(alert.capitalStuck)}
                </Text>
              )}

              {typeof alert.suggestedPrice === 'number' && alert.suggestedPrice > 0 ? (
                <Text size="xs" mb="xs">
                  Preço sugerido de liquidação: {formatCurrency(alert.suggestedPrice)}
                </Text>
              ) : (
                <Text size="xs" mb="xs">
                  Preço atual: {formatCurrency(product.salePrice || 0)} | Custo:{' '}
                  {formatCurrency(product.costPrice || 0)}
                </Text>
              )}

              {typeof alert.daysSinceLastSale === 'number' && alert.daysSinceLastSale > 0 && (
                <Text size="xs" mb="xs">
                  Dias desde a última venda: {alert.daysSinceLastSale}
                </Text>
              )}

              {(typeof alert.vvd7 === 'number' ||
                typeof alert.vvd30 === 'number' ||
                typeof alert.daysRemaining === 'number') && (
                <>
                  <Divider my="xs" />
                  {typeof alert.vvdReal === 'number' && (
                    <Text size="xs" mb="xs">
                      VVD Real: {alert.vvdReal.toFixed(1)} unid./dia
                    </Text>
                  )}
                  {typeof alert.vvd7 === 'number' && (
                    <Text size="xs" mb="xs">
                      VVD 7d: {alert.vvd7.toFixed(1)} unid./dia
                    </Text>
                  )}
                  {typeof alert.vvd30 === 'number' && (
                    <Text size="xs" mb="xs">
                      VVD 30d: {alert.vvd30.toFixed(1)} unid./dia
                    </Text>
                  )}
                  {typeof alert.daysRemaining === 'number' && (
                    <Text size="xs">Dias de estoque restante: {alert.daysRemaining} dias</Text>
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
                        <Text size="xs" mb="xs">
                          Recomendações:
                        </Text>
                        <Stack gap={4}>
                          {recs.map((r: string, i: number) => (
                            <Text key={i} size="xs">
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
            </Paper>
          )}
        </Box>

        {/* CTAs: incentivar análise individual e visão geral */}
        <Group justify="space-between" mt="sm">
          <Button
            onClick={(e) => {
              e.stopPropagation();
              router.push(`/produto/${product.blingProductId}`);
            }}
            variant="filled"
            color={style.color}
          >
            CLIQUE AQUI — Análise Individual
          </Button>
          <Button
            onClick={(e) => {
              e.stopPropagation();
              router.push('/visao-geral');
            }}
            variant="light"
          >
            Veja todos insights
          </Button>
        </Group>
      </Stack>
    </Card>
  );
}
