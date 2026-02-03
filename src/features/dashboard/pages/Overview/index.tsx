'use client';
import {
  alpha,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Divider,
  Group,
  List,
  Loader,
  type MantineTheme,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { ArrowRight, Sparkles } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useBlingIntegration } from '@/hooks/useBlingIntegration';
import { ProductIndicators } from '../../components/ProductIndicators';
import { useOverviewMetrics } from '../../hooks/use-overview-metrics';

export function Overview() {
  type ThemeWithScheme = MantineTheme & { colorScheme?: 'dark' | 'light' };
  const BG_SHADE_LIGHT = 0 as const;
  const BG_SHADE_DARK = 9 as const;
  const BG_ALPHA_LIGHT = 0.12 as const;
  const BG_ALPHA_DARK = 0.06 as const;
  const { data, error, refetch } = useOverviewMetrics();
  const { status, refresh } = useBlingIntegration();
  const router = useRouter();
  const isLoading = status?.syncStatus !== 'COMPLETED';

  const tips = [
    'Dica: Você pode navegar enquanto calculamos os resultados.',
    'Estamos cruzando dados de vendas, compras e estoque…',
    'Analisando giro, sazonalidade e rupturas potenciais…',
    'Identificando oportunidades com maior impacto primeiro…',
    'Otimizando custos e margens para recomendações mais assertivas…',
    'Quase lá! Finalizando o cálculo das métricas…',
  ];
  const [tipIndex, setTipIndex] = useState(0);

  const onContinue = () => router.push('/dashboard');

  const SYNC_POLL_INTERVAL_MS = 3000;
  const TIP_ROTATE_INTERVAL_MS = 4000;
  useEffect(() => {
    const interval = setInterval(() => {
      if (status?.syncStatus !== 'COMPLETED') {
        refresh();
        refetch();
      }
    }, SYNC_POLL_INTERVAL_MS);
    return () => clearInterval(interval);
  }, [status, refresh, refetch]);

  useEffect(() => {
    if (!isLoading) return;
    const id = setInterval(() => setTipIndex((i) => (i + 1) % tips.length), TIP_ROTATE_INTERVAL_MS);
    return () => clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoading]);

  return (
    <Box style={{ minHeight: '100vh', paddingTop: '4rem', paddingBottom: '4rem' }}>
      <Container size="lg">
        <Stack gap="xl">
          {/* Header */}
          <Box style={{ textAlign: 'center' }}>
            <ThemeIcon size={80} radius="xl" color="brand" variant="light" mx="auto" mb="md">
              <Sparkles size={40} />
            </ThemeIcon>
            <Title order={1} mb="xs">
              🎉 Análise Concluída!
            </Title>
            <Text size="lg" maw={600} mx="auto">
              <strong>📊 Encontramos em seu estoque:</strong>
            </Text>
          </Box>

          {/* Loading/Error */}
          {isLoading && (
            <Stack gap="lg" align="center">
              <Loader size="lg" type="dots" />
              <Title order={3}>Gerando sua análise</Title>
              <Text size="lg" c="dimmed" aria-live="polite">
                {tips[tipIndex]}
              </Text>

              {/* Skeleton placeholders to reduce perceived wait */}
              <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg" style={{ width: '100%' }}>
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

              <Card padding="xl" radius="md" withBorder shadow="sm" style={{ width: '100%' }}>
                <Title order={3} mb="lg">
                  Preparando recomendações…
                </Title>
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
                  {[0, 1, 2].map((i) => (
                    <Card key={i} padding="lg" radius="md" withBorder shadow="xs">
                      <Skeleton height={16} width="70%" mb={12} />
                      <Stack gap="xs">
                        <Skeleton height={12} />
                        <Skeleton height={12} />
                        <Skeleton height={12} width="80%" />
                      </Stack>
                    </Card>
                  ))}
                </SimpleGrid>
              </Card>
            </Stack>
          )}
          {error && (
            <Text size="lg" c="red" style={{ textAlign: 'center' }}>
              {error.message}
            </Text>
          )}

          {/* Summary Cards */}
          {status?.syncStatus === 'COMPLETED' && !error && data && (
            <ProductIndicators metrics={data} />
          )}

          {/* Top Actions */}
          {status?.syncStatus === 'COMPLETED' && !error && data && (
            <Card padding="xl" radius="md" withBorder shadow="md">
              <Title order={3} mb="lg">
                Top 3 Ações Recomendadas
              </Title>
              <SimpleGrid cols={{ base: 1, sm: 3 }} mb="md" spacing="lg">
                {data.topActions.map((action) => {
                  const type = action.alertType;
                  const style = (() => {
                    switch (type) {
                      case 'RUPTURE':
                        return { color: 'red' as const, label: 'Ruptura' };
                      case 'DEAD_STOCK':
                        return { color: 'brand' as const, label: 'Dinheiro parado' };
                      case 'OPPORTUNITY':
                        return { color: 'green' as const, label: 'Oportunidade' };
                      case 'FINE':
                        return { color: 'blue' as const, label: 'Observar' };
                      case 'LIQUIDATION':
                        return { color: 'orange' as const, label: 'Liquidação' };
                      default:
                        return { color: 'gray' as const, label: 'Produto' };
                    }
                  })();
                  const label =
                    action.impactAmount && action.impactAmount > 0
                      ? `${action.impactLabel ?? 'Impacto'}: R$ ${action.impactAmount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`
                      : null;

                  return (
                    <Card
                      key={action.id}
                      padding="xl"
                      radius="md"
                      withBorder
                      shadow="md"
                      styles={(theme: ThemeWithScheme) => {
                        const palette =
                          (theme.colors as Record<string, readonly string[]>)[style.color] ??
                          theme.colors.gray;
                        const BG_SHADE =
                          theme.colorScheme === 'dark' ? BG_SHADE_DARK : BG_SHADE_LIGHT;
                        const BG_ALPHA =
                          theme.colorScheme === 'dark' ? BG_ALPHA_DARK : BG_ALPHA_LIGHT;
                        return {
                          root: {
                            borderColor: palette[6],
                            backgroundColor: alpha(palette[BG_SHADE], BG_ALPHA),
                          },
                        };
                      }}
                    >
                      <Group justify="space-between" mb="sm">
                        <Text size="sm" fw={700} component="div">
                          <Group gap="xs">
                            <ThemeIcon size={20} radius="md" color={style.color} variant="light">
                              <ArrowRight size={12} />
                            </ThemeIcon>
                            {action.name}
                            <Badge color={style.color} variant="light" size="sm">
                              {style.label}
                            </Badge>
                          </Group>
                        </Text>
                        {label && (
                          <Badge color="teal" variant="light">
                            {label}
                          </Badge>
                        )}
                      </Group>
                      <Stack gap="sm">
                        <Group gap={4}>
                          <Text size="sm" fw={700}>
                            SKU:
                          </Text>
                          <Text size="sm" c="dimmed">
                            {action.sku}
                          </Text>
                        </Group>
                        <Divider />
                        <List type="ordered">
                          {action.recommendations &&
                            (JSON.parse(action.recommendations) as string[]).map(
                              (recommendation) => (
                                <List.Item key={recommendation}>{recommendation}</List.Item>
                              )
                            )}
                        </List>
                      </Stack>
                    </Card>
                  );
                })}
              </SimpleGrid>
            </Card>
          )}

          {/* CTA */}
          <Box style={{ textAlign: 'center' }}>
            <Paper
              p="xl"
              radius="md"
              withBorder
              style={{ background: 'linear-gradient(135deg, #C7A446 0%, #A8872A 100%)' }}
            >
              <Title order={3} mb="md" c="white">
                Pronto para Tomar Ação?
              </Title>
              <Text size="md" mb="xl" c="white" opacity={0.9}>
                O Nexus OS é seu CFO Digital: calculamos preços ideais, prevemos rupturas e
                identificamos oportunidades automaticamente.
              </Text>
              <Button
                size="lg"
                variant="white"
                color="dark"
                leftSection={<Sparkles size={20} />}
                onClick={onContinue}
                styles={{
                  root: {
                    '&:hover': {
                      transform: 'scale(1.02)',
                      transition: 'transform 0.2s',
                    },
                  },
                }}
              >
                Acessar Dashboard Completo
              </Button>
            </Paper>
          </Box>

          <Text size="sm" style={{ textAlign: 'center' }}>
            💡 Dica: Você pode ajustar os parâmetros de análise nas configurações para personalizar
            as recomendações.
          </Text>
        </Stack>
      </Container>
    </Box>
  );
}
