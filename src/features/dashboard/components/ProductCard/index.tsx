'use client';
import {
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Group,
  Image,
  Paper,
  Progress,
  Stack,
  Text,
  ThemeIcon,
} from '@mantine/core';
import {
  AlertTriangle,
  Calendar,
  DollarSign,
  ImageOff,
  Info,
  Package as PackageIcon,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import type { ProductAlert } from '../../types';

interface ProductAlertCardProps {
  alert: ProductAlert;
  onGenerateCampaign?: () => void;
}

export function ProductCard({ alert, onGenerateCampaign }: ProductAlertCardProps) {
  const { product, metrics, finalRecommendation, pricingRecommendation } = alert;

  // cores por risco técnico
  const RiskColorMap: Record<string, string> = {
    CRITICAL: 'red',
    HIGH: 'orange',
    MEDIUM: 'yellow',
    LOW: 'teal',
  };

  // fallback values (segurança)
  const stock = product?.stock ?? 0;
  const cost = product?.costPrice ?? 0;
  const sale = product?.salePrice ?? 0;

  const styleByType = {
    RUPTURE: {
      color: 'red' as const,
      icon: AlertTriangle,
      badgeLabel: 'Ruptura',
      bg: alert.risk === 'CRITICAL' ? 'rgba(250,82,82,0.08)' : 'rgba(253,126,20,0.06)',
    },
    DEAD_STOCK: {
      color: 'orange' as const,
      icon: DollarSign,
      badgeLabel: 'Dinheiro parado',
      bg: 'rgba(253,126,20,0.08)',
    },
    OPPORTUNITY: {
      color: 'teal' as const,
      icon: TrendingUp,
      badgeLabel: 'Oportunidade',
      bg: 'rgba(18,184,134,0.06)',
    },
  } as const;

  const s = styleByType[alert.type];

  const Icon = s.icon;

  function formatCurrency(value?: number | null) {
    return (value ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  }

  function formatDate(iso?: string | null) {
    if (!iso) return 'N/A';
    try {
      return new Date(iso).toLocaleDateString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
      });
    } catch {
      return iso;
    }
  }

  // badge de risco legível (se tiver)
  const riskLabelDisplay =
    (alert.riskLabel ? String(alert.riskLabel) : undefined) ||
    (alert.risk ? String(alert.risk).toLowerCase() : undefined);

  // recomendações
  const recs = alert.recommendationsStrings ?? [];

  return (
    <Card padding="lg" radius="md" withBorder shadow="sm" style={{ height: '100%' }}>
      <Stack gap="md" style={{ height: '100%' }}>
        {/* header */}
        <Stack>
          <Group align="center">
            <ThemeIcon size={44} radius="md" color={s.color} variant="light">
              <Icon size={20} />
            </ThemeIcon>
            <div>
              <Text fw={700} truncate style={{ maxWidth: 250 }}>
                {product.name}
              </Text>
              <Text size="xs" c="dimmed">
                SKU: {product.sku ?? '—'} • {product.categoryName ?? 'Sem categoria'}
              </Text>
            </div>
          </Group>

          <Group justify="space-between" align="center">
            <Badge color={s.color} variant="light" size="md">
              {s.badgeLabel}
            </Badge>
            {riskLabelDisplay && (
              <Badge
                color={RiskColorMap[(alert.risk as string) ?? 'LOW'] || 'gray'}
                variant="filled"
                size="md"
              >
                {String(riskLabelDisplay).toUpperCase()}
              </Badge>
            )}
          </Group>
        </Stack>

        {/* imagem */}
        <Box>
          {product.imageUrl ? (
            <Image src={product.imageUrl} alt={product.name} height={220} radius="md" fit="cover" />
          ) : (
            <Box
              style={{
                height: 220,
                borderRadius: 12,
                overflow: 'hidden',
                background: '#3b3b3b',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <Stack gap="md" align="center">
                <ImageOff size={48} color="#6c6c6c" />
                <Text size="sm" c="dimmed">
                  Sem imagem disponível
                </Text>
              </Stack>
            </Box>
          )}
        </Box>

        {/* conteúdo principal - sempre visível */}
        <Paper p="md" radius="md" style={{ backgroundColor: s.bg }}>
          {/* Rupture block */}
          {alert.type === 'RUPTURE' && (
            <>
              {alert.recommendationsStrings && alert.recommendationsStrings.length > 0 && (
                <Paper
                  p="xs"
                  radius="sm"
                  mb="md"
                  style={{
                    backgroundColor:
                      alert.risk === 'CRITICAL' ? 'rgba(250,82,82,0.12)' : 'rgba(253,126,20,0.08)',
                    borderLeft: `3px solid ${alert.risk === 'CRITICAL' ? '#FA5252' : '#FD7E14'}`,
                  }}
                >
                  <Group gap="xs" align="flex-start">
                    <Info size={14} />
                    <Text size="xs" c="dimmed" style={{ flex: 1 }}>
                      {alert.recommendationsStrings[0]}
                    </Text>
                  </Group>
                </Paper>
              )}

              <Text size="sm" mb="6px">
                Restam <strong>{(metrics.stockCoverageDays ?? 0).toFixed(0)}</strong> dias de
                estoque
              </Text>

              <Group gap="xs" mb="6px">
                <PackageIcon size={14} />
                <Text size="xs" c="dimmed">
                  Estoque atual: <strong>{stock}</strong> unidades
                </Text>
              </Group>

              <Text size="xs" c="dimmed" mb="6px">
                VVD (real): {(metrics.vvd ?? metrics.vvd7 ?? 0).toFixed(2)} unid./dia
              </Text>

              {typeof product.productSettings?.leadTimeDays !== 'undefined' && (
                <Text size="xs" c="dimmed">
                  Lead time: {product.productSettings?.leadTimeDays} dias • Safety days:{' '}
                  {product.productSettings?.safetyDays}
                </Text>
              )}
            </>
          )}

          {/* Dead stock block */}
          {alert.type === 'DEAD_STOCK' && (
            <>
              <Text size="sm" mb="8px">
                <strong>{formatCurrency(metrics.capitalStuck ?? product.stock! * cost)}</strong>{' '}
                parados há <strong>{metrics.idleDays ?? 0} dias</strong>
              </Text>

              <Group gap="xs" mb="6px">
                <Calendar size={14} />
                <Text size="xs" c="dimmed">
                  Última venda: {product.lastSaleDate ? formatDate(product.lastSaleDate) : 'N/A'}
                </Text>
              </Group>

              <Group gap="xs" mb="6px">
                <PackageIcon size={14} />
                <Text size="xs" c="dimmed">
                  Estoque: <strong>{stock}</strong> unidades
                </Text>
              </Group>

              <Text size="xs" c="dimmed" mb="8px">
                Custo: {formatCurrency(cost)} • Venda: {formatCurrency(sale)}
              </Text>

              {/* Pricing recommendation if exists */}
              {pricingRecommendation && pricingRecommendation.feasible !== false && (
                <>
                  <Divider my="sm" />
                  <Text size="sm" mb="6px">
                    💰 <strong>Recomendação de preço</strong>
                  </Text>

                  <Text size="lg" mb="6px" style={{ color: '#C7A446' }}>
                    {pricingRecommendation.optimalPrice ? (
                      <>
                        Liquide por{' '}
                        <strong>{formatCurrency(pricingRecommendation.optimalPrice)}</strong>
                      </>
                    ) : (
                      <>Sugestão disponível</>
                    )}
                  </Text>

                  {typeof pricingRecommendation.discountPercent === 'number' && (
                    <Text size="xs" c="dimmed" mb="6px">
                      Desconto sugerido: <strong>{pricingRecommendation.discountPercent}%</strong>
                    </Text>
                  )}

                  <Group gap="lg" align="center" mb="6px">
                    <Box>
                      <Text size="xs" c="dimmed">
                        Recuperação
                      </Text>
                      <Text size="sm" fw={700}>
                        {pricingRecommendation.capitalRecoveryPercent
                          ? `${(pricingRecommendation.capitalRecoveryPercent * 100).toFixed(0)}%`
                          : (pricingRecommendation.capitalRecoveryPercent ?? '—')}
                      </Text>
                    </Box>

                    <Box>
                      <Text size="xs" c="dimmed">
                        Prazo
                      </Text>
                      <Text size="sm" fw={700}>
                        {pricingRecommendation.recommendedDays ?? '—'} dias
                      </Text>
                    </Box>

                    <Box>
                      <Text size="xs" c="dimmed">
                        Confiança
                      </Text>
                      <Text size="sm" fw={700}>
                        {pricingRecommendation.probabilityOfSale
                          ? `${(pricingRecommendation.probabilityOfSale * 100).toFixed(0)}%`
                          : '—'}
                      </Text>
                    </Box>
                  </Group>

                  {typeof pricingRecommendation.probabilityOfSale === 'number' && (
                    <Progress
                      value={(pricingRecommendation.probabilityOfSale ?? 0) * 100}
                      size="sm"
                      color="yellow"
                    />
                  )}

                  <Text size="xs" c="dimmed" mt="8px">
                    Receita estimada: {formatCurrency(pricingRecommendation.expectedRevenue ?? 0)}
                  </Text>
                </>
              )}
            </>
          )}

          {/* Opportunity block */}
          {alert.type === 'OPPORTUNITY' && (
            <>
              <Text size="sm" mb="6px">
                Crescimento detectado: <strong>{((metrics.trend ?? 0) * 100).toFixed(0)}%</strong>
              </Text>
              <Text size="xs" c="dimmed" mb="6px">
                VVD 7 dias: {metrics.vvd7?.toFixed(2) ?? '—'} • VVD 30 dias:{' '}
                {metrics.vvd30?.toFixed(2) ?? '—'}
              </Text>

              <Group gap="xs" mb="6px">
                <PackageIcon size={14} />
                <Text size="xs" c="dimmed">
                  Estoque: <strong>{stock}</strong>
                </Text>
              </Group>

              {recs.length > 0 && (
                <Box mt="8px">
                  <Text size="xs" c="dimmed">
                    Recomendações:
                  </Text>
                  <ul style={{ marginTop: 6, marginBottom: 0, paddingLeft: 16 }}>
                    {recs.map((r, i) => (
                      <li key={i}>
                        <Text size="xs">{r}</Text>
                      </li>
                    ))}
                  </ul>
                </Box>
              )}
            </>
          )}
        </Paper>

        <Divider />

        {/* Final recommendation + actions (sempre visível) */}
        <Box>
          <Text size="sm" mb="4px">
            <strong>Ação sugerida:</strong>{' '}
            {finalRecommendation?.action ?? (recs.length > 0 ? recs[0] : 'Nenhuma ação sugerida')}
          </Text>
          {finalRecommendation?.justification && (
            <Text size="xs" c="dimmed" mb="6px">
              {finalRecommendation.justification}
            </Text>
          )}

          <Group align="center" mt="xs">
            <Text size="xs" c="dimmed">
              Gerado em: {new Date(alert.generatedAt).toLocaleString('pt-BR')}
            </Text>

            {alert.type === 'DEAD_STOCK' && onGenerateCampaign && (
              <Button leftSection={<Sparkles size={14} />} onClick={onGenerateCampaign} fullWidth>
                Gerar campanha
              </Button>
            )}
          </Group>
        </Box>
      </Stack>
    </Card>
  );
}
