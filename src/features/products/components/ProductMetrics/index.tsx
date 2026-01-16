import { Card, Divider, Grid, Group, Paper, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import {
  Calendar,
  DollarSign,
  PackageIcon,
  ShoppingCart,
  TrendingDown,
  TrendingUp,
} from 'lucide-react';
import type { BlingProductType } from '@/lib/bling';
import { formatCurrency, formatDate } from '@/lib/utils';

interface ProductMetricsProps {
  product: BlingProductType;
}

export function ProductMetrics({ product }: ProductMetricsProps) {
  const { alert } = product;

  if (!alert) {
    throw new Error('Alert data is required for ProductMetrics component.');
  }

  const recommendations = alert.recommendations
    ? (JSON.parse(alert.recommendations) as string[])
    : [];

  return (
    <Grid gutter="lg">
      {/* Product Information */}
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Card padding="lg" radius="md" withBorder shadow="sm" h="100%">
          <Group mb="md">
            <ThemeIcon size={32} radius="md" color="blue" variant="light">
              <PackageIcon size={18} />
            </ThemeIcon>
            <Title order={5}>Informações do Produto</Title>
          </Group>
          <Stack gap="xs">
            <Group justify="space-between">
              <Text size="sm">Preço de Custo:</Text>
              <Text size="sm">{formatCurrency(product?.costPrice || 0)}</Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm">Preço de Venda:</Text>
              <Text size="sm">{formatCurrency(product?.salePrice || 0)}</Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm">Estoque Atual:</Text>
              <Text size="sm">{product?.currentStock || 0} unidades</Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm">Categoria:</Text>
              <Text size="sm">{product?.category?.name || 'N/A'}</Text>
            </Group>
            {product?.shortDescription && (
              <>
                <Divider my="xs" />
                <Text size="sm">{product.shortDescription}</Text>
              </>
            )}
          </Stack>
        </Card>
      </Grid.Col>

      {/* Alert Metrics */}
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Card padding="lg" radius="md" withBorder shadow="sm">
          <Group mb="md">
            <ThemeIcon size={32} radius="md" color="brand" variant="light">
              <TrendingUp size={18} />
            </ThemeIcon>
            <Title order={5}>Métricas do Alerta</Title>
          </Group>
          <Stack gap="xs">
            <Group justify="space-between">
              <Text size="sm">VVD Real:</Text>
              <Text size="sm">{alert.vvdReal.toFixed(2)} un/dia</Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm">VVD 30 dias:</Text>
              <Text size="sm">{alert.vvd30.toFixed(2)} un/dia</Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm">VVD 7 dias:</Text>
              <Text size="sm">{alert.vvd7.toFixed(2)} un/dia</Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm">Tendência de Crescimento:</Text>
              <Group gap={4}>
                {alert.growthTrend > 0 ? (
                  <TrendingUp size={14} color="teal" />
                ) : (
                  <TrendingDown size={14} color="red" />
                )}
                <Text size="sm" c={alert.growthTrend > 0 ? 'teal' : 'red'}>
                  {alert.growthTrend.toFixed(1)}%
                </Text>
              </Group>
            </Group>
            <Group justify="space-between">
              <Text size="sm">Dias Restantes:</Text>
              <Text size="sm" c={alert.daysRemaining < 7 ? 'red' : '#2E2E2E'}>
                {alert.daysRemaining} dias
              </Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm">Ponto de Pedido:</Text>
              <Text size="sm">{alert.reorderPoint.toFixed(0)} unidades</Text>
            </Group>
            {typeof product.settings?.leadTimeDays === 'number' ? (
              <>
                <Group justify="space-between">
                  <Text size="sm">Lead time (tempo de reposição):</Text>
                  <Text size="sm">{product.settings.leadTimeDays} dias</Text>
                </Group>
                <Text size="xs" c="dimmed">
                  Lead time é o tempo que o fornecedor leva para entregar novos itens após o pedido.
                </Text>
              </>
            ) : null}
          </Stack>
        </Card>
      </Grid.Col>

      {/* Financial Metrics */}
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Card padding="lg" radius="md" withBorder shadow="sm">
          <Group mb="md">
            <ThemeIcon size={32} radius="md" color="green" variant="light">
              <DollarSign size={18} />
            </ThemeIcon>
            <Title order={5}>Métricas Financeiras</Title>
          </Group>
          <Stack gap="xs">
            {alert.type === 'LIQUIDATION' && (
              <>
                <Group justify="space-between">
                  <Text size="sm">Capital Parado:</Text>
                  <Text size="sm" c="orange">
                    {formatCurrency(alert.excessCapital)}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Excesso de Unidades:</Text>
                  <Text size="sm">{alert.excessUnits} un</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Percentual de Excesso:</Text>
                  <Text size="sm">{alert.excessPercentage.toFixed(0)}%</Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Estoque Ideal:</Text>
                  <Text size="sm">{alert.idealStock.toFixed(0)} un</Text>
                </Group>
              </>
            )}
            <Group justify="space-between">
              <Text size="sm">Preço Sugerido:</Text>
              <Text size="sm" c="teal">
                {formatCurrency(alert.suggestedPrice)}
              </Text>
            </Group>
            <Group justify="space-between">
              <Text size="sm">Valor Recuperável:</Text>
              <Text size="sm">{formatCurrency(alert.recoverableAmount)}</Text>
            </Group>
            {alert.type === 'RUPTURE' && (
              <>
                <Divider my="xs" />
                <Group justify="space-between">
                  <Text size="sm">Vendas Perdidas:</Text>
                  <Text size="sm" c="red">
                    {alert.estimatedLostSales} un
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Valor Perdido:</Text>
                  <Text size="sm" c="red">
                    {formatCurrency(alert.estimatedLostAmount)}
                  </Text>
                </Group>
                <Group justify="space-between">
                  <Text size="sm">Dias Sem Estoque:</Text>
                  <Text size="sm" c="red">
                    {alert.daysOutOfStock} dias
                  </Text>
                </Group>
              </>
            )}
          </Stack>
        </Card>
      </Grid.Col>

      {/* Recommendations */}
      <Grid.Col span={{ base: 12, md: 6 }}>
        <Card padding="lg" radius="md" withBorder shadow="sm" h="100%">
          <Group mb="md">
            <ThemeIcon size={32} radius="md" color="violet" variant="light">
              <ShoppingCart size={18} />
            </ThemeIcon>
            <Title order={5}>Recomendações</Title>
          </Group>
          <Stack gap="md">
            {recommendations.length > 0 ? (
              recommendations.map((rec: string, index: number) => (
                <Paper
                  key={index}
                  p="sm"
                  radius="md"
                  style={{
                    backgroundColor: 'rgba(199, 164, 70, 0.08)',
                    borderLeft: '3px solid #C7A446',
                  }}
                >
                  <Text size="sm">• {rec}</Text>
                </Paper>
              ))
            ) : (
              <Text size="sm">Nenhuma recomendação disponível</Text>
            )}
          </Stack>
        </Card>
      </Grid.Col>

      {/* Timeline */}
      <Grid.Col span={12}>
        <Card padding="lg" radius="md" withBorder shadow="sm">
          <Group mb="md">
            <ThemeIcon size={32} radius="md" color="gray" variant="light">
              <Calendar size={18} />
            </ThemeIcon>
            <Title order={5}>Linha do Tempo</Title>
          </Group>
          <Grid>
            <Grid.Col span={{ base: 6, sm: 3 }}>
              <Stack gap={4}>
                <Text size="xs">Criado em</Text>
                <Text size="sm">{formatDate(alert.createdAt.toString())}</Text>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 6, sm: 3 }}>
              <Stack gap={4}>
                <Text size="xs">Atualizado em</Text>
                <Text size="sm">{formatDate(alert.updatedAt.toString())}</Text>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 6, sm: 3 }}>
              <Stack gap={4}>
                <Text size="xs">Última venda</Text>
                <Text size="sm">{alert.daysSinceLastSale} dias atrás</Text>
              </Stack>
            </Grid.Col>
            <Grid.Col span={{ base: 6, sm: 3 }}>
              <Stack gap={4}>
                <Text size="xs">Prazo estimado</Text>
                <Text size="sm">{alert.estimatedDeadline} dias</Text>
              </Stack>
            </Grid.Col>
          </Grid>
        </Card>
      </Grid.Col>
    </Grid>
  );
}
