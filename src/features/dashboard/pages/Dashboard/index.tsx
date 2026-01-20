'use client';
import {
  Box,
  Button,
  Card,
  Group,
  MultiSelect,
  SimpleGrid,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { Download, Filter, Package, Sparkles } from 'lucide-react';
import { useEffect, useMemo, useState } from 'react';
import { BlingConnectBanner } from '@/features/bling/components/BlingConnectBanner';
import { ProductCard } from '@/features/products/components/ProductCard';
import { useBlingIntegration } from '@/hooks/useBlingIntegration';
import { useProductAlerts } from '../../hooks/use-product-alerts';

export function Dashboard() {
  const { status, loading } = useBlingIntegration();
  const [criticalCount, setCriticalCount] = useState(0);
  // Filters (URL-synced as comma-separated strings)
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('');

  // Build API params
  const queryParams = useMemo(() => {
    return {
      type: typeFilter || undefined,
      risk: riskFilter || undefined,
    } as Record<string, string | number | undefined>;
  }, [typeFilter, riskFilter]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useProductAlerts(queryParams);

  useEffect(() => {
    if (data) {
      const allAlerts = data.pages.flatMap((p) => p.data);
      const OUT_OF_STOCK_THRESHOLD_DAYS = 30;
      setCriticalCount(
        allAlerts.filter(
          (a) =>
            a.alert?.type === 'RUPTURE' ||
            (a.alert?.type === 'DEAD_STOCK' &&
              (a.alert?.daysOutOfStock ?? 0) > OUT_OF_STOCK_THRESHOLD_DAYS)
        ).length
      );
    }
  }, [data]);

  // Compute client-side search filtering (name/SKU)
  const flatProducts = useMemo(() => data?.pages.flatMap((p) => p.data) ?? [], [data]);
  const visibleProducts = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return flatProducts;
    return flatProducts.filter((p) =>
      [p.name, p.sku].some((v) => (v ?? '').toString().toLowerCase().includes(s))
    );
  }, [flatProducts, search]);

  return (
    <Stack gap="xl">
      {!loading && !status?.connected && <BlingConnectBanner />}

      {/* Summary Cards */}
      <SimpleGrid cols={{ base: 1, sm: 3 }}>
        <Card padding="lg" radius="md" withBorder shadow="md">
          <Group justify="space-between">
            <Box>
              <Text size="sm" fw={700}>
                Alertas Críticos
              </Text>
              <Title order={2} mt="xs" fw={800}>
                {criticalCount}
              </Title>
            </Box>
            <ThemeIcon size={48} radius="md" color="red" variant="light">
              <Filter size={24} />
            </ThemeIcon>
          </Group>
        </Card>
        <Card padding="lg" radius="md" withBorder shadow="md">
          <Group justify="space-between">
            <Box>
              <Text size="sm" fw={700}>
                Total de Produtos
              </Text>
              <Title order={2} mt="xs" fw={800}>
                {data?.pages.flatMap((p) => p.data).length ?? 0}
              </Title>
            </Box>
            <ThemeIcon size={48} radius="md" color="brand" variant="light">
              <Package size={24} />
            </ThemeIcon>
          </Group>
        </Card>

        <Card padding="lg" radius="md" withBorder shadow="md">
          <Group justify="space-between">
            <Box>
              <Text size="sm" fw={700}>
                Oportunidades
              </Text>
              <Title order={2} mt="xs" fw={800}>
                {
                  data?.pages.flatMap((p) => p.data).filter((a) => a.alert?.type === 'OPPORTUNITY')
                    .length
                }
              </Title>
            </Box>
            <ThemeIcon size={48} radius="md" color="teal" variant="light">
              <Sparkles size={24} />
            </ThemeIcon>
          </Group>
        </Card>
      </SimpleGrid>

      {/* Filters */}
      <Group align="end" justify="space-between">
        <Group align="end" gap="md" wrap="wrap">
          <TextInput
            label="Busca"
            placeholder="Nome ou SKU"
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            style={{ minWidth: 220 }}
          />
          <MultiSelect
            label="Tipo de alerta"
            placeholder="Selecione"
            value={typeFilter ? typeFilter.split(',') : []}
            onChange={(values) => setTypeFilter(values.join(','))}
            data={[
              { value: 'RUPTURE', label: 'Ruptura' },
              { value: 'DEAD_STOCK', label: 'Dinheiro Parado' },
              { value: 'OPPORTUNITY', label: 'Oportunidade' },
              { value: 'FINE', label: 'Observar' },
              { value: 'LIQUIDATION', label: 'Liquidação' },
            ]}
            style={{ minWidth: 240 }}
            searchable
            clearable
          />
          <MultiSelect
            label="Risco"
            placeholder="Selecione"
            value={riskFilter ? riskFilter.split(',') : []}
            onChange={(values) => setRiskFilter(values.join(','))}
            data={[
              { value: 'CRITICAL', label: 'Crítico' },
              { value: 'HIGH', label: 'Alto' },
              { value: 'MEDIUM', label: 'Médio' },
              { value: 'LOW', label: 'Baixo' },
            ]}
            style={{ minWidth: 200 }}
            searchable
            clearable
          />
        </Group>
        <Button
          variant="light"
          leftSection={<Download size={16} />}
          component="a"
          href={`/api/dashboard/alerts/export?${new URLSearchParams({
            ...(typeFilter ? { type: typeFilter } : {}),
            ...(riskFilter ? { risk: riskFilter } : {}),
          }).toString()}`}
        >
          Exportar CSV
        </Button>
      </Group>

      {/* Product Cards Stack */}
      <Stack gap="lg">
        {visibleProducts.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </Stack>

      {/* Infinite load button */}
      {hasNextPage && (
        <Button
          variant="light"
          onClick={() => fetchNextPage()}
          loading={isFetchingNextPage}
          mx="auto"
          mt="lg"
        >
          Carregar mais
        </Button>
      )}

      {data?.pages.flatMap((p) => p.data).length === 0 && !isLoading && (
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
