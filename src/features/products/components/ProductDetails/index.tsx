'use client';
import {
  AspectRatio,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Divider,
  Group,
  Image,
  Paper,
  Tabs,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import {
  AlertTriangle,
  DollarSign,
  Info,
  Package as PackageIcon,
  Settings,
  Sparkles,
  TrendingUp,
} from 'lucide-react';
import { useRouter, useSearchParams } from 'next/navigation';
import type { BlingProductType } from '@/lib/bling';
import { formatDate } from '@/lib/utils';
import { ProductCampaingGenerator } from '../ProductCampaingGenerator';
import { ProductMetrics } from '../ProductMetrics';
import { ProductSettingsForm } from '../ProductSettingsForm';

interface ProductDetailsProps {
  product: BlingProductType;
}

export function ProductDetails({ product }: ProductDetailsProps) {
  const { alert } = product;
  const router = useRouter();

  if (!alert) {
    throw new Error('Alert data is required for ProductDetailsPage component.');
  }

  const getCardStyle = () => {
    switch (alert.type) {
      case 'RUPTURE':
        return {
          color: 'red',
          icon: AlertTriangle,
          badge: 'Risco de Ruptura do Estoque',
        } as const;
      case 'DEAD_STOCK':
        return {
          color: 'brand',
          icon: DollarSign,
          badge: 'Dinheiro Parado',
        } as const;
      case 'OPPORTUNITY':
        return {
          color: 'green',
          icon: TrendingUp,
          badge: 'Oportunidade',
        } as const;
      case 'FINE':
        return {
          color: 'blue',
          icon: Info,
          badge: 'Observar',
        } as const;
      case 'LIQUIDATION':
        return {
          color: 'orange',
          icon: PackageIcon,
          badge: 'Liquidação',
        } as const;
      default:
        return { color: 'gray', icon: PackageIcon, badge: 'Produto' } as const;
    }
  };

  const { icon: Icon, color, badge: typeBadge } = getCardStyle();
  const currencyBRL = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
  const searchParams = useSearchParams();
  const tabParam = searchParams.get('tab');
  const canGenerateCampaign =
    alert.type === 'LIQUIDATION' || alert.type === 'DEAD_STOCK' || alert.type === 'OPPORTUNITY';
  const defaultTab = canGenerateCampaign && tabParam === 'campaign' ? 'campaign' : 'details';

  return (
    <Container size="xl">
      {/* Voltar para Dashboard */}
      <Group justify="space-between" align="center" py="md">
        <Button variant="light" onClick={() => router.push('/dashboard')}>
          Voltar ao Painel
        </Button>
      </Group>
      {/* Header */}
      <Container size="xl" py="md">
        <Group justify="space-between" align="center">
          <Group gap="md" align="center">
            <Box style={{ width: 56 }}>
              <AspectRatio ratio={1} style={{ width: '100%' }}>
                {product?.image ? (
                  <Image
                    src={product.image}
                    alt={product.name}
                    radius="md"
                    fit="contain"
                    height="100%"
                  />
                ) : (
                  <Box
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      borderRadius: 'var(--mantine-radius-md)',
                      backgroundColor: 'var(--mantine-color-gray-2)',
                    }}
                  >
                    <PackageIcon size={28} />
                  </Box>
                )}
              </AspectRatio>
            </Box>

            <ThemeIcon size={40} radius="lg" variant="filled" color={color}>
              <Icon size={24} />
            </ThemeIcon>

            <Box>
              <Title order={4}>{product?.name || 'Detalhes do Alerta'}</Title>
              <Group gap="xs" wrap="wrap" align="center">
                <Text size="sm" c="dimmed">
                  SKU: {product?.sku || 'N/A'}
                </Text>
                <Divider orientation="vertical" />
                <Badge variant="light" color="gray">
                  {product?.category?.name ?? 'Sem categoria'}
                </Badge>
                <Divider orientation="vertical" />
                <Text size="sm" c="dimmed">
                  Preço: {currencyBRL.format(product.salePrice)}
                </Text>
                <Divider orientation="vertical" />
                <Text size="sm" c="dimmed">
                  Estoque: {product.currentStock}
                </Text>
              </Group>
            </Box>
          </Group>
        </Group>
      </Container>

      {/* Alert Message destacado com a cor do card */}
      <Card padding="lg" radius="md" withBorder shadow="sm" mb="lg">
        <Group align="center" justify="space-between" mb="sm" wrap="wrap">
          <Group gap="sm" align="center">
            <ThemeIcon size={40} radius="md" color={color} variant="light">
              <Info size={20} />
            </ThemeIcon>
            <Badge color={color} variant="filled">
              {typeBadge}
            </Badge>
            <Badge color={alert.risk === 'CRITICAL' ? 'red' : 'brand'} variant="light">
              {alert.risk}
            </Badge>
          </Group>

          <Text size="sm" c="dimmed">
            Última atualização: {formatDate(product.updatedAt.toString())}
          </Text>
        </Group>
        <Paper
          p="sm"
          radius="md"
          style={{
            backgroundColor: `var(--mantine-color-${color}-light)`,
            borderLeft: `4px solid var(--mantine-color-${color}-5)`,
          }}
        >
          <Text size="md">{alert.message}</Text>
        </Paper>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue={defaultTab} color="gold">
        <Tabs.List>
          <Tabs.Tab value="details" leftSection={<Info size={16} />}>
            Detalhes
          </Tabs.Tab>
          <Tabs.Tab value="settings" leftSection={<Settings size={16} />}>
            Configurações
          </Tabs.Tab>
          {canGenerateCampaign && (
            <Tabs.Tab
              value="campaign"
              leftSection={<Sparkles size={16} />}
              style={{
                boxShadow:
                  '0 0 0 2px var(--mantine-color-brand-5), 0 0 12px var(--mantine-color-brand-4)',
                borderRadius: 'var(--mantine-radius-md)',
              }}
            >
              Gerador de Campanhas
            </Tabs.Tab>
          )}
        </Tabs.List>

        {/* Details Tab */}
        <Tabs.Panel value="details" pt="lg">
          <ProductMetrics product={product} />
        </Tabs.Panel>

        {/* Settings Tab */}
        <Tabs.Panel value="settings" pt="lg">
          <ProductSettingsForm
            settings={product.settings}
            blingProductId={product.blingProductId}
          />
        </Tabs.Panel>

        {/* Campaign Generator Tab */}
        {canGenerateCampaign && (
          <Tabs.Panel value="campaign" pt="lg">
            <ProductCampaingGenerator product={product} />
          </Tabs.Panel>
        )}
      </Tabs>
    </Container>
  );
}
