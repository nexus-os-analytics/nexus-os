'use client';
import {
  Box,
  Button,
  Card,
  Container,
  Divider,
  Group,
  List,
  Loader,
  Paper,
  SimpleGrid,
  Skeleton,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { AlertTriangle, ArrowRight, DollarSign, Sparkles, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useBlingIntegration } from '@/hooks/useBlingIntegration';
import { useOverviewMetrics } from '../../hooks/use-overview-metrics';

export function Overview() {
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

  useEffect(() => {
    const interval = setInterval(() => {
      if (status?.syncStatus !== 'COMPLETED') {
        refresh();
        refetch();
      }
    }, 3000);
    return () => clearInterval(interval);
  }, [status, refresh]);

  useEffect(() => {
    if (!isLoading) return;
    const id = setInterval(() => setTipIndex((i) => (i + 1) % tips.length), 4000);
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
              Análise Completa! 🎯
            </Title>
            <Text size="lg" maw={600} mx="auto">
              Analisamos seu estoque e encontramos oportunidades importantes para seu negócio.
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
            <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
              <Card padding="xl" radius="md" withBorder shadow="md">
                <Group justify="space-between" mb="md">
                  <ThemeIcon size={48} radius="md" color="orange" variant="light">
                    <DollarSign size={24} />
                  </ThemeIcon>
                </Group>
                <Text size="sm" mb={4}>
                  Capital Parado Detectado
                </Text>
                <Title order={2}>
                  R$ {data.capitalStuck.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                </Title>
                <Text size="xs" mt="xs">
                  Produtos sem venda há mais de 30 dias
                </Text>
              </Card>

              <Card padding="xl" radius="md" withBorder shadow="md">
                <Group justify="space-between" mb="md">
                  <ThemeIcon size={48} radius="md" color="red" variant="light">
                    <AlertTriangle size={24} />
                  </ThemeIcon>
                </Group>
                <Text size="sm" mb={4}>
                  Produtos em Risco de Ruptura
                </Text>
                <Title order={2}>{data.ruptureCount}</Title>
                <Text size="xs" mt="xs">
                  Necessitam reposição urgente
                </Text>
              </Card>

              <Card padding="xl" radius="md" withBorder shadow="md">
                <Group justify="space-between" mb="md">
                  <ThemeIcon size={48} radius="md" color="teal" variant="light">
                    <TrendingUp size={24} />
                  </ThemeIcon>
                </Group>
                <Text size="sm" mb={4}>
                  Oportunidades de Crescimento
                </Text>
                <Title order={2}>{data.opportunityCount}</Title>
                <Text size="xs" mt="xs">
                  Produtos com tendência de alta
                </Text>
              </Card>
            </SimpleGrid>
          )}

          {/* Top Actions */}
          {status?.syncStatus === 'COMPLETED' && !error && data && (
            <Card padding="xl" radius="md" withBorder shadow="md">
              <Title order={3} mb="lg">
                Top 3 Ações Recomendadas
              </Title>
              <SimpleGrid cols={{ base: 1, sm: 3 }} mb="md" spacing="lg">
                {data.topActions.map((action) => (
                  <Card key={action.id} padding="xl" radius="md" withBorder shadow="md">
                    <Text size="sm" fw={700} mb="md" component="div">
                      <Group gap="xs">
                        <ThemeIcon size={20} radius="md" color="brand" variant="light">
                          <ArrowRight size={12} />
                        </ThemeIcon>
                        {action.name}
                      </Group>
                    </Text>
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
                            (recommendation, index) => (
                              <List.Item key={index}>{recommendation}</List.Item>
                            )
                          )}
                      </List>
                    </Stack>
                  </Card>
                ))}
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
