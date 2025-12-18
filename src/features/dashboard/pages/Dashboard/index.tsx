'use client';
import { Box, Button, Card, Group, SimpleGrid, Stack, Text, ThemeIcon, Title } from '@mantine/core';
import { Filter, Package, Sparkles } from 'lucide-react';
import { useEffect, useState } from 'react';
import { BlingConnectBanner } from '@/features/bling/components/BlingConnectBanner';
import { ProductCard } from '@/features/products/components/ProductCard';
import type { GetProductsAlertsParams } from '@/features/products/types';
import { useBlingIntegration } from '@/hooks/useBlingIntegration';
import { useProductAlerts } from '../../hooks/use-product-alerts';

export function Dashboard() {
  const { status, loading } = useBlingIntegration();
  const [criticalCount, setCriticalCount] = useState(0);
  const [params, _] = useState<GetProductsAlertsParams | undefined>();

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useProductAlerts(params);

  useEffect(() => {
    if (data) {
      const allAlerts = data.pages.flatMap((p) => p.data);
      setCriticalCount(
        allAlerts.filter(
          (a) =>
            a.alert?.type === 'RUPTURE' ||
            (a.alert?.type === 'DEAD_STOCK' && (a.alert?.daysOutOfStock ?? 0) > 30)
        ).length
      );
    }
  }, [data]);

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
                {data?.pages.length}
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

      {/* TODO: Refatorar os filtros */}
      {/* Filters */}
      {/* <Group mb="lg" align="center">
        <Text size="sm">Mostrando:</Text>
        <Tabs value={params} onChange={setParams} color="gold">
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
      </Group> */}

      {/* Product Cards Grid */}
      <SimpleGrid cols={{ base: 1, sm: 2, md: 3 }} spacing="lg">
        {data?.pages
          .flatMap((p) => p.data)
          .map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
      </SimpleGrid>

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
