import {
  Badge,
  Box,
  Card,
  Container,
  Divider,
  Group,
  Tabs,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { AlertTriangle, DollarSign, Info, PackageIcon, Settings, TrendingUp } from 'lucide-react';
import type { BlingProductType } from '@/lib/bling';
import { formatDate } from '@/lib/utils';
import { ProductMetrics } from '../ProductMetrics';
import { ProductSettingsForm } from '../ProductSettingsForm';

interface ProductDetailsPageProps {
  product: BlingProductType;
}

export function ProductDetailsPage({ product }: ProductDetailsPageProps) {
  const { alert } = product;

  if (!alert) {
    throw new Error('Alert data is required for ProductDetailsPage component.');
  }

  const getAlertIcon = () => {
    switch (alert.type) {
      case 'RUPTURE':
        return AlertTriangle;
      case 'LIQUIDATION':
        return DollarSign;
      case 'OPPORTUNITY':
        return TrendingUp;
      default:
        return PackageIcon;
    }
  };

  const getAlertColor = () => {
    switch (alert.type) {
      case 'RUPTURE':
        return alert.risk === 'CRITICAL' ? 'red' : alert.risk === 'HIGH' ? 'orange' : 'yellow';
      case 'LIQUIDATION':
        return 'orange';
      case 'OPPORTUNITY':
        return 'teal';
      default:
        return 'gray';
    }
  };

  const Icon = getAlertIcon();
  const color = getAlertColor();

  return (
    <Container size="xl">
      {/* Header */}
      <Container size="xl" h={70}>
        <Group justify="space-between" h="100%">
          <Group>
            {/* <Button
              variant="subtle"
              color="gray"
              leftSection={<ArrowLeft size={16} />}
              onClick={onBack}
            >
              Voltar
            </Button> */}
            <Divider orientation="vertical" />
            <ThemeIcon size={40} radius="lg" variant="filled" color={color}>
              <Icon size={24} />
            </ThemeIcon>
            <Box>
              <Title order={4} style={{ color: '#2E2E2E' }}>
                {product?.name || 'Detalhes do Alerta'}
              </Title>
              <Text size="sm" c="#6E6E6E">
                SKU: {product?.sku || 'N/A'}
              </Text>
            </Box>
          </Group>
        </Group>
      </Container>

      {/* Alert Message */}
      <Card
        padding="lg"
        radius="md"
        withBorder
        shadow="sm"
        mb="lg"
        style={{ background: '#FFFFFF' }}
      >
        <Group gap="md" align="start">
          <ThemeIcon size={48} radius="md" color={color} variant="light">
            <Info size={24} />
          </ThemeIcon>
          <Box style={{ flex: 1 }}>
            <Group mb="xs">
              <Badge color={color} variant="filled">
                {alert.type}
              </Badge>
              <Badge
                color={
                  alert.risk === 'CRITICAL' ? 'red' : alert.risk === 'HIGH' ? 'orange' : 'yellow'
                }
              >
                {alert.risk}
              </Badge>
            </Group>
            <Text size="lg" mb="xs" style={{ color: '#2E2E2E' }}>
              {alert.message}
            </Text>
            <Text size="sm" c="#6E6E6E">
              Última atualização: {formatDate(product.updatedAt)}
            </Text>
          </Box>
        </Group>
      </Card>

      {/* Tabs */}
      <Tabs defaultValue="details" color="gold">
        <Tabs.List>
          <Tabs.Tab value="details" leftSection={<Info size={16} />}>
            Detalhes
          </Tabs.Tab>
          <Tabs.Tab value="settings" leftSection={<Settings size={16} />}>
            Configurações
          </Tabs.Tab>
        </Tabs.List>

        {/* Details Tab */}
        <Tabs.Panel value="details" pt="lg">
          <ProductMetrics product={product} />
        </Tabs.Panel>

        {/* Settings Tab */}
        <Tabs.Panel value="settings" pt="lg">
          <ProductSettingsForm settings={product.settings} />
        </Tabs.Panel>
      </Tabs>
    </Container>
  );
}
