'use client';
import {
  Badge,
  Box,
  Card,
  Group,
  SimpleGrid,
  Stack,
  Tabs,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { Filter, Package, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { BlingConnectBanner } from '@/features/bling/components/BlingConnectBanner';
import { useBlingIntegration } from '@/hooks/useBlingIntegration';
import { mockProducts } from '@/mock';
import type { ProductAlert } from '@/types';
import { ProductCard } from '../../components/ProductCard';

export function Dashboard() {
  const { status, loading } = useBlingIntegration();
  const [filter, setFilter] = useState<string | null>('all');
  const router = useRouter();

  const criticalLimitDays = 30;

  const filteredProducts =
    filter === 'critical'
      ? mockProducts.filter(
          (p) =>
            p.type === 'rupture' ||
            (p.type === 'dead-stock' && (p.daysSinceLastSale || 0) > criticalLimitDays)
        )
      : mockProducts;

  const criticalCount = mockProducts.filter(
    (p) =>
      p.type === 'rupture' ||
      (p.type === 'dead-stock' && (p.daysSinceLastSale || 0) > criticalLimitDays)
  ).length;

  const handleOpenCampaign = (product: ProductAlert) => {
    router.push(`/campaign/${product.id}/generate`);
  };

  return (
    <Stack gap="xl">
      {!loading && !status?.connected && <BlingConnectBanner />}

      {/* Summary Cards */}
      <SimpleGrid cols={{ base: 1, sm: 3 }}>
        <Card padding="lg" radius="md" withBorder shadow="sm">
          <Group justify="space-between">
            <Box>
              <Text size="sm">Alertas Críticos</Text>
              <Title order={2} mt="xs">
                {criticalCount}
              </Title>
            </Box>
            <ThemeIcon size={48} radius="md" color="red" variant="light">
              <Filter size={24} />
            </ThemeIcon>
          </Group>
        </Card>

        <Card padding="lg" radius="md" withBorder shadow="sm">
          <Group justify="space-between">
            <Box>
              <Text size="sm">Total de Produtos</Text>
              <Title order={2} mt="xs">
                {mockProducts.length}
              </Title>
            </Box>
            <ThemeIcon size={48} radius="md" color="brand" variant="light">
              <Package size={24} />
            </ThemeIcon>
          </Group>
        </Card>

        <Card padding="lg" radius="md" withBorder shadow="sm">
          <Group justify="space-between">
            <Box>
              <Text size="sm">Oportunidades</Text>
              <Title order={2} mt="xs">
                {mockProducts.filter((p) => p.type === 'opportunity').length}
              </Title>
            </Box>
            <ThemeIcon size={48} radius="md" color="teal" variant="light">
              <Sparkles size={24} />
            </ThemeIcon>
          </Group>
        </Card>
      </SimpleGrid>

      {/* Filters */}
      <Group mb="lg" align="center">
        <Text size="sm">Mostrando:</Text>
        <Tabs value={filter} onChange={setFilter} color="gold">
          <Tabs.List>
            <Tabs.Tab value="all">Todos</Tabs.Tab>
            <Tabs.Tab
              value="critical"
              rightSection={
                criticalCount > 0 ? (
                  <Badge
                    size="sm"
                    variant="filled"
                    color="red"
                    w={24}
                    style={{ minWidth: 24, height: 24 }}
                  >
                    {criticalCount}
                  </Badge>
                ) : null
              }
            >
              Apenas Críticos
            </Tabs.Tab>
          </Tabs.List>
        </Tabs>
      </Group>

      {/* Product Cards Grid */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
        {filteredProducts.map((product) => (
          <ProductCard
            key={product.id}
            product={product}
            onGenerateCampaign={() => handleOpenCampaign(product)}
          />
        ))}
      </SimpleGrid>

      {filteredProducts.length === 0 && (
        <Box style={{ textAlign: 'center', padding: '3rem 0' }}>
          <ThemeIcon size={48} radius="xl" variant="light" color="gray" mx="auto" mb="md">
            <Package size={24} />
          </ThemeIcon>
          <Text>Nenhum produto encontrado com os filtros aplicados.</Text>
        </Box>
      )}
    </Stack>
  );
}
