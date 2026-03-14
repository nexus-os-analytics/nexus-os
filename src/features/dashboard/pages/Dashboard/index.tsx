'use client';
import {
  Box,
  Button,
  Card,
  Center,
  Group,
  MultiSelect,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  TextInput,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { BoxIcon, ChartBar, Download, Package, RotateCcw, Sparkles } from 'lucide-react';
import { useSession } from 'next-auth/react';
import { useEffect, useMemo, useRef, useState } from 'react';
import { ProLockedState } from '@/features/billing/components/ProLockedState';
import { BlingConnectBanner } from '@/features/bling/components/BlingConnectBanner';
import { ProductCard } from '@/features/products/components/ProductCard';
import { useActiveIntegration } from '@/hooks/useActiveIntegration';
import { ALERT_TYPE_CONFIG, ALERT_URGENCY_ORDER } from '@/lib/constants';
import { DashboardOnboarding, getOnboardingCompleted } from '../../components/DashboardOnboarding';
import { ProductIndicators } from '../../components/ProductIndicators';
import { useOverviewMetrics } from '../../hooks/use-overview-metrics';
import { useProductAlerts } from '../../hooks/use-product-alerts';
import { modals } from '@mantine/modals';
import { useRouter, useSearchParams } from 'next/navigation';

const CAMPAIGN_ELIGIBLE_TYPES = ['LIQUIDATION', 'DEAD_STOCK', 'OPPORTUNITY'] as const;

export function Dashboard() {
  const { data: session } = useSession();
  const planTier = session?.user?.planTier ?? 'FREE';
  const { status, loading, sync, refresh, manualSyncAllowed } = useActiveIntegration();
  const searchParams = useSearchParams();
  const source = searchParams.get('source') as 'BLING' | 'MERCADO_LIVRE' | 'SHOPEE' | null;
  // Overview metrics
  const { data: overviewMetrics } = useOverviewMetrics({ provider: source ?? undefined });
  // Filters (URL-synced as comma-separated strings)
  const [search, setSearch] = useState('');
  const [typeFilter, setTypeFilter] = useState<string>('');
  const [riskFilter, setRiskFilter] = useState<string>('');

  // Build API params
  const queryParams = useMemo(() => {
    return {
      provider: source ?? undefined,
      type: typeFilter || undefined,
      risk: riskFilter || undefined,
    } as Record<string, string | number | undefined>;
  }, [source, typeFilter, riskFilter]);

  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading } =
    useProductAlerts(queryParams);
  const loadMoreRef = useRef<HTMLDivElement | null>(null);
  const indicatorsRef = useRef<HTMLDivElement>(null);
  const filtersRef = useRef<HTMLDivElement>(null);

  const [onboardingOpen, setOnboardingOpen] = useState(false);
  const [onboardingStep, setOnboardingStep] = useState(1);

  useEffect(() => {
    if (!getOnboardingCompleted()) {
      setOnboardingOpen(true);
    }
  }, []);

  useEffect(() => {
    if (!onboardingOpen) return;
    if (onboardingStep === 2) {
      indicatorsRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    } else if (onboardingStep === 3) {
      filtersRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }, [onboardingOpen, onboardingStep]);

  // No local computation for indicators; rely on overview API for consistency

  // Fixed alert type order: Ruptura → Capital Parado → Liquidação → Oportunidade → Saudável
  const flatProducts = useMemo(() => {
    const list = data?.pages.flatMap((p) => p.data) ?? [];
    return [...list].sort((a, b) => {
      const typeA = a.alert?.type ?? 'FINE';
      const typeB = b.alert?.type ?? 'FINE';
      const indexA = ALERT_URGENCY_ORDER.indexOf(typeA);
      const indexB = ALERT_URGENCY_ORDER.indexOf(typeB);
      const orderA = indexA === -1 ? ALERT_URGENCY_ORDER.length : indexA;
      const orderB = indexB === -1 ? ALERT_URGENCY_ORDER.length : indexB;
      return orderA - orderB;
    });
  }, [data]);
  const totalProductsCount = flatProducts.length;
  const firstEligibleForCampaign = useMemo(
    () =>
      flatProducts.find((p) =>
        p.alert ? (CAMPAIGN_ELIGIBLE_TYPES as readonly string[]).includes(p.alert.type) : false
      ) ?? null,
    [flatProducts]
  );
  const visibleProducts = useMemo(() => {
    const s = search.trim().toLowerCase();
    if (!s) return flatProducts;
    return flatProducts.filter((p) =>
      [p.name, p.sku].some((v) => (v ?? '').toString().toLowerCase().includes(s))
    );
  }, [flatProducts, search]);
  const router = useRouter();
  const showProRequiredModal = () => {
    modals.open({
      title: 'Plano PRO',
      size: 'lg',
      centered: true,
      withCloseButton: false,
      withOverlay: true,
      overlayProps: {
        color: 'rgba(0, 0, 0, 0.5)',
        opacity: 0.5,
        blur: 10,
      },
      children: (
        <ProLockedState
          title="Gerador de campanhas PRO"
          description="Gere campanhas inteligentes com IA para aumentar suas vendas e lucros."
          ctaLabel="Desbloquear com o plano PRO"
        />
      ),
    });
  };

  // Infinite scroll with IntersectionObserver
  useEffect(() => {
    if (!loadMoreRef.current) return;
    const el = loadMoreRef.current;
    const observer = new IntersectionObserver((entries) => {
      const [entry] = entries;
      if (entry.isIntersecting && hasNextPage && !isFetchingNextPage) {
        void fetchNextPage();
      }
    });
    observer.observe(el);
    return () => {
      observer.disconnect();
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return (
    <Stack gap="xl">
      <DashboardOnboarding
        opened={onboardingOpen}
        step={onboardingStep}
        onStepChange={setOnboardingStep}
        onComplete={() => setOnboardingOpen(false)}
        onClose={() => setOnboardingOpen(false)}
      />

      {!loading && !status?.connected && (source === 'BLING' || source === null) && (
        <BlingConnectBanner />
      )}

      {/* Summary Cards aligned with Overview */}
      <Box ref={indicatorsRef}>
        {overviewMetrics ? (
          <ProductIndicators metrics={overviewMetrics} />
        ) : (
          <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
            {[0, 1, 2].map((i) => (
              <Card key={i} padding="xl" radius="md" withBorder shadow="sm">
                <Group justify="space-between" mb="md">
                  <Skeleton height={48} width={48} radius="md" />
                </Group>
                <Skeleton height={16} width="60%" mb={8} />
                <Skeleton height={28} width="50%" mb={8} />
                <Skeleton height={12} width="80%" />
              </Card>
            ))}
          </SimpleGrid>
        )}
      </Box>

      {/* Filters */}
      <Stack ref={filtersRef} gap="md">
        <Group align="end" gap="md" wrap="wrap">
          <TextInput
            label="Busca"
            placeholder="Nome ou SKU"
            value={search}
            onChange={(e) => setSearch(e.currentTarget.value)}
            style={{ flexGrow: 1, minWidth: 200 }}
          />
          <MultiSelect
            label="Tipo de alerta"
            placeholder="Selecione"
            value={typeFilter ? typeFilter.split(',') : []}
            onChange={(values) => setTypeFilter(values.join(','))}
            data={[
              {
                value: 'RUPTURE',
                label: `${ALERT_TYPE_CONFIG.RUPTURE.emoji} ${ALERT_TYPE_CONFIG.RUPTURE.label}`,
              },
              {
                value: 'DEAD_STOCK',
                label: `${ALERT_TYPE_CONFIG.DEAD_STOCK.emoji} ${ALERT_TYPE_CONFIG.DEAD_STOCK.label}`,
              },
              {
                value: 'OPPORTUNITY',
                label: `${ALERT_TYPE_CONFIG.OPPORTUNITY.emoji} ${ALERT_TYPE_CONFIG.OPPORTUNITY.label}`,
              },
              {
                value: 'FINE',
                label: `${ALERT_TYPE_CONFIG.FINE.emoji} ${ALERT_TYPE_CONFIG.FINE.label}`,
              },
              {
                value: 'LIQUIDATION',
                label: `${ALERT_TYPE_CONFIG.LIQUIDATION.emoji} ${ALERT_TYPE_CONFIG.LIQUIDATION.label}`,
              },
            ]}
            style={{ flexGrow: 1, minWidth: 200 }}
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
            style={{ flexGrow: 1, minWidth: 180 }}
            searchable
            clearable
          />
        </Group>
        <Group justify="space-between" align="center">
          <Group gap="sm" wrap="wrap">
            <Button
              variant="filled"
              color="brand"
              leftSection={<ChartBar size={16} />}
              component="a"
              href="/visao-geral"
            >
              Visão Geral
            </Button>
            <Button
              variant="light"
              leftSection={<RotateCcw size={16} />}
              onClick={async () => {
                await sync();
                await refresh();
              }}
              disabled={
                loading ||
                !status?.connected ||
                status.syncStatus === 'SYNCING' ||
                !manualSyncAllowed
              }
            >
              Atualizar
            </Button>
            {(() => {
              const csvHref = `/api/dashboard/alerts/export?${new URLSearchParams({
                ...(source ? { provider: source } : {}),
                ...(typeFilter ? { type: typeFilter } : {}),
                ...(riskFilter ? { risk: riskFilter } : {}),
              }).toString()}`;
              const isDisabled = totalProductsCount === 0;
              return (
                <Button
                  variant="light"
                  leftSection={<Download size={16} />}
                  component={isDisabled ? 'button' : 'a'}
                  href={isDisabled ? undefined : csvHref}
                  disabled={isDisabled}
                >
                  Exportar CSV
                </Button>
              );
            })()}
            <Button
              variant="gradient"
              gradient={{ from: 'blue', to: 'cyan', deg: 90 }}
              leftSection={<Sparkles size={16} />}
              onClick={() => {
                if (planTier === 'FREE') {
                  showProRequiredModal();
                } else {
                  router.push('/campanhas/criar?step=1');
                }
              }}
            >
              Criar Campanha
            </Button>
          </Group>
          {overviewMetrics?.productCount != null && overviewMetrics?.productLimit != null && (
            <Text size="sm" c="dimmed">
              Produtos sincronizados: {overviewMetrics.productCount}/
              {planTier === 'PRO' ? '∞' : overviewMetrics.productLimit}
            </Text>
          )}
        </Group>
      </Stack>

      {/* Product Cards Grid or Skeletons */}
      {isLoading && (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
          {Array.from({ length: 6 }, (_, i) => i).map((index) => (
            <Card
              key={`skeleton-${index}`}
              padding="lg"
              radius="md"
              withBorder
              shadow="sm"
              style={{ height: '100%' }}
            >
              <Stack gap="md">
                <Group justify="space-between" align="center">
                  <Group gap="sm">
                    <Skeleton height={36} width={36} radius="md" />
                    <Skeleton height={24} width={140} radius="sm" />
                  </Group>
                </Group>
                <Group align="stretch" gap="md">
                  <Skeleton height={120} width={120} radius="md" />
                  <Stack gap={6} style={{ flex: 1 }}>
                    <Skeleton height={18} width="60%" />
                    <Skeleton height={14} width="40%" />
                    <Group justify="space-between" align="center" mt="xs">
                      <Skeleton height={20} width={120} />
                      <Group gap="xs">
                        <Skeleton height={20} width={80} />
                        <Skeleton height={20} width={80} />
                      </Group>
                    </Group>
                  </Stack>
                </Group>
                <Skeleton height={14} width="30%" />
                <Stack gap={6}>
                  <Skeleton height={14} width="50%" />
                  <Skeleton height={14} width="50%" />
                  <Skeleton height={14} width="50%" />
                </Stack>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      )}

      {!isLoading && visibleProducts.length > 0 && (
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg">
          {visibleProducts.map((product) => (
            <ProductCard key={product.id} product={product} />
          ))}
        </SimpleGrid>
      )}

      {!isLoading && visibleProducts.length === 0 && (
        <Center h={300}>
          <Stack align="center">
            <BoxIcon size={48} color="#999" />
            <Text c="dimmed" ta="center">
              Nenhum alerta de produtos encontrado.
            </Text>
            <Button
              variant="light"
              leftSection={<RotateCcw size={16} />}
              onClick={async () => {
                await sync();
                await refresh();
              }}
              disabled={loading || !status?.connected || !manualSyncAllowed}
            >
              Atualizar
            </Button>
          </Stack>
        </Center>
      )}

      {/* Infinite scroll sentinel */}
      <Box ref={loadMoreRef} style={{ height: 1 }} />

      {!isLoading && totalProductsCount === 0 && status?.connected && (
        <Card padding="xl" radius="md" withBorder shadow="sm">
          <Stack align="center" gap="md">
            <ThemeIcon size={56} radius="xl" variant="light" color="gray">
              <Package size={28} />
            </ThemeIcon>
            <Title order={3}>Nenhum alerta de produtos no momento</Title>
            <Text c="dimmed" ta="center">
              Assim que houver dados suficientes, os alertas aparecerão aqui. Você pode atualizar
              agora para gerar novos alertas.
            </Text>
            <Button
              size="md"
              leftSection={<RotateCcw size={16} />}
              onClick={async () => {
                await sync();
                await refresh();
              }}
              disabled={loading || !manualSyncAllowed}
            >
              Atualizar
            </Button>
          </Stack>
        </Card>
      )}

      {!isLoading && visibleProducts.length === 0 && totalProductsCount > 0 && (
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
