'use client';
// Função utilitária para moeda
function formatCurrency(value?: number | null) {
  return (value ?? 0).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

import {
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Group,
  Image,
  Paper,
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
import type { DashboardProductAlert } from '../../types';

interface ProductAlertCardProps {
  alert: DashboardProductAlert;
  onGenerateCampaign?: () => void;
}

export function ProductCard({ alert, onGenerateCampaign }: ProductAlertCardProps) {
  const { product, alert: alertData } = alert;
  const { type, risk, riskLabel, metrics, recommendations, finalRecommendation, generatedAt } =
    alertData;
  // Função utilitária para moeda fora do componente

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
      bg: risk === 'CRITICAL' ? 'rgba(250,82,82,0.08)' : 'rgba(253,126,20,0.06)',
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

  const s = styleByType[type as keyof typeof styleByType];
  const Icon = s.icon;

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
    (riskLabel ? String(riskLabel) : undefined) || (risk ? String(risk).toLowerCase() : undefined);

  // recomendações
  const recs = recommendations ?? [];

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
                SKU: {product.sku ?? '—'} • {'Sem categoria'}
              </Text>
            </div>
          </Group>

          <Group justify="space-between" align="center">
            <Badge color={s.color} variant="light" size="md">
              {s.badgeLabel}
            </Badge>
            {riskLabelDisplay && (
              <Badge
                color={RiskColorMap[(risk as string) ?? 'LOW'] || 'gray'}
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
          {product.image ? (
            <Image src={product.image} alt={product.name} height={220} radius="md" fit="cover" />
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
          {type === 'RUPTURE' && (
            <>
              {recs.length > 0 && (
                <Paper
                  p="xs"
                  radius="sm"
                  mb="md"
                  style={{
                    backgroundColor:
                      risk === 'CRITICAL' ? 'rgba(250,82,82,0.12)' : 'rgba(253,126,20,0.08)',
                    borderLeft: `3px solid ${risk === 'CRITICAL' ? '#FA5252' : '#FD7E14'}`,
                  }}
                >
                  <Group gap="xs" align="flex-start">
                    <Info size={14} />
                    <Text size="xs" c="dimmed" style={{ flex: 1 }}>
                      {recs[0]}
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

              {/* Se houver campo de venda diária, exiba aqui (ajuste conforme o novo tipo) */}
              {/* <Text size="xs" c="dimmed" mb="6px">
                Venda média diária: {metrics.dailySales?.toFixed(2) ?? '—'} unid./dia
              </Text> */}

              {/* Exemplo de lead time e safety stock, se existirem no produto */}
              {product.replenishmentTime !== undefined && (
                <Text size="xs" c="dimmed">
                  Lead time: {product.replenishmentTime} dias • Safety stock: {product.safetyStock}
                </Text>
              )}
            </>
          )}

          {/* Dead stock block */}
          {type === 'DEAD_STOCK' && (
            <>
              <Text size="sm" mb="8px">
                <strong>{formatCurrency(metrics.capitalStuck ?? stock * cost)}</strong> parados há{' '}
                <strong>{metrics.idleDays ?? 0} dias</strong>
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

              {/* Se houver recomendação de preço, exiba aqui (ajuste conforme o novo tipo) */}
              {/* Recomendações de preço removidas, ajuste aqui se necessário */}
            </>
          )}

          {/* Opportunity block */}
          {type === 'OPPORTUNITY' && (
            <>
              <Text size="sm" mb="6px">
                Crescimento detectado: <strong>{((metrics.trend ?? 0) * 100).toFixed(0)}%</strong>
              </Text>

              {/* Se houver campos de venda diária, exiba aqui (ajuste conforme o novo tipo) */}
              {/* <Text size="xs" c="dimmed" mb="6px">
                Venda média diária: {metrics.dailySales?.toFixed(2) ?? '—'}
              </Text> */}

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
                    {recs.map((r) => (
                      <li key={r}>
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
              Gerado em: {new Date(generatedAt).toLocaleString('pt-BR')}
            </Text>

            {type === 'DEAD_STOCK' && onGenerateCampaign && (
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
