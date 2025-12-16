'use client';
import {
  Badge,
  Box,
  Card,
  Divider,
  Group,
  Image,
  Paper,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import { AlertTriangle, DollarSign, Info, Package as PackageIcon, TrendingUp } from 'lucide-react';
import type { BlingProductType } from '@/lib/bling';
import { formatCurrency } from '@/lib/utils';

interface ProductCardProps {
  product: BlingProductType;
}

export function ProductCard({ product }: ProductCardProps) {
  const { alert } = product;

  if (!alert) {
    throw new Error('Alert data is required for ProductCard component.');
  }

  const getCardStyle = () => {
    switch (alert.type) {
      case 'RUPTURE':
        return {
          color: alert.risk === 'CRITICAL' ? 'red' : alert.risk === 'HIGH' ? 'orange' : 'yellow',
          icon: AlertTriangle,
          badge: 'Risco de Ruptura',
        };
      case 'DEAD_STOCK':
        return {
          color: 'orange',
          icon: DollarSign,
          badge: 'Dinheiro Parado',
        };
      case 'OPPORTUNITY':
        return {
          color: 'teal',
          icon: TrendingUp,
          badge: 'Oportunidade',
        };
      case 'FINE':
        return {
          color: 'blue',
          icon: Info,
          badge: 'Multa',
        };
      case 'LIQUIDATION':
        return {
          color: 'green',
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

          {/* Product Image */}
          {product.image ? (
            <Image src={product.image} alt={product.name} h={120} radius="md" mb="sm" fit="cover" />
          ) : null}

          <Text lineClamp={2} mb={4}>
            {product.name}
          </Text>
          <Text size="sm">SKU: {product.sku}</Text>
          <Text size="xs" mb="xs">
            Categoria: {product.category?.name ?? '—'}
          </Text>

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
        </Box>

        {/* Content by Type */}
        <Box style={{ flex: 1 }}>
          {alert.type === 'RUPTURE' && (
            <Paper
              p="md"
              radius="md"
              style={{
                backgroundColor:
                  alert.risk === 'CRITICAL'
                    ? 'rgba(250, 82, 82, 0.08)'
                    : 'rgba(253, 126, 20, 0.08)',
              }}
            >
              {/* Risk Message */}
              <Paper
                p="xs"
                radius="sm"
                mb="md"
                style={{
                  backgroundColor:
                    alert.risk === 'CRITICAL'
                      ? 'rgba(250, 82, 82, 0.15)'
                      : 'rgba(253, 126, 20, 0.1)',
                  borderLeft: `3px solid ${alert.risk === 'CRITICAL' ? '#FA5252' : '#FD7E14'}`,
                }}
              >
                <Group gap="xs">
                  <AlertTriangle size={16} />
                  <Text size="xs" style={{ flex: 1 }}>
                    {alert.message ?? 'Atenção: risco de ruptura identificado.'}
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
              {alert.daysOutOfStock && alert.daysOutOfStock > 0 && (
                <Paper
                  p="xs"
                  radius="sm"
                  mt="xs"
                  style={{
                    backgroundColor: 'rgba(250, 82, 82, 0.05)',
                    borderLeft: '3px solid #FA5252',
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
            <Paper p="md" radius="md" style={{ backgroundColor: 'rgba(253, 126, 20, 0.08)' }}>
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
            <Paper p="md" radius="md" style={{ backgroundColor: 'rgba(18, 184, 134, 0.08)' }}>
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
            <Paper p="md" radius="md" style={{ backgroundColor: 'rgba(34, 139, 230, 0.08)' }}>
              {alert.message ? (
                <Paper
                  p="xs"
                  radius="sm"
                  mb="md"
                  style={{
                    backgroundColor: 'rgba(34, 139, 230, 0.12)',
                    borderLeft: '3px solid #228BE6',
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
                typeof alert.excessPercentage === 'number') && (
                <Text size="xs" mb="xs">
                  {typeof alert.excessUnits === 'number' &&
                  typeof alert.excessPercentage === 'number'
                    ? `Excesso: ${alert.excessUnits.toFixed(0)} unid. (${alert.excessPercentage.toFixed(1)}%)`
                    : typeof alert.excessUnits === 'number'
                      ? `Excesso: ${alert.excessUnits.toFixed(0)} unid.`
                      : `Excesso: ${alert.excessPercentage!.toFixed(1)}%`}
                </Text>
              )}

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
            <Paper p="md" radius="md" style={{ backgroundColor: 'rgba(34, 197, 94, 0.08)' }}>
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
                typeof alert.excessPercentage === 'number') && (
                <Text size="xs" mb="xs">
                  {typeof alert.excessUnits === 'number' &&
                  typeof alert.excessPercentage === 'number'
                    ? `Excesso: ${alert.excessUnits.toFixed(0)} unid. (${alert.excessPercentage.toFixed(1)}%)`
                    : typeof alert.excessUnits === 'number'
                      ? `Excesso: ${alert.excessUnits.toFixed(0)} unid.`
                      : `Excesso: ${alert.excessPercentage!.toFixed(1)}%`}
                </Text>
              )}

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

        {/* CTA removida: handler inexistente e tipo ajustado */}
      </Stack>
    </Card>
  );
}
