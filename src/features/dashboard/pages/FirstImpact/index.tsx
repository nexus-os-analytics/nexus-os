'use client';
import {
  Box,
  Button,
  Card,
  Container,
  Group,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { AlertTriangle, ArrowRight, DollarSign, Sparkles, TrendingUp } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import type { FirstImpactData } from '@/types';

export function FirstImpact() {
  const [data, setData] = useState<FirstImpactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    async function fetchData() {
      setLoading(true);
      setError(null);
      try {
        const res = await fetch('/api/first-impact');
        if (!res.ok) throw new Error('Erro ao buscar dados');
        const json = await res.json();
        setData(json);
      } catch (err) {
        setError((err as Error).message || 'Erro desconhecido');
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  const onContinue = () => router.push('/dashboard');

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
          {loading && (
            <Text size="lg" c="dimmed" style={{ textAlign: 'center' }}>
              Carregando análise...
            </Text>
          )}
          {error && (
            <Text size="lg" c="red" style={{ textAlign: 'center' }}>
              {error}
            </Text>
          )}

          {/* Summary Cards */}
          {!loading && !error && data && (
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
                  R$ {data.capitalTied.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
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
          {!loading && !error && data && (
            <Card padding="xl" radius="md" withBorder shadow="md">
              <Title order={3} mb="lg">
                Top 3 Ações Recomendadas
              </Title>
              <SimpleGrid cols={{ base: 1, sm: 3 }} mb="md" spacing="lg">
                {data.topActions.map((action) => (
                  <Card key={action.productName} padding="xl" radius="md" withBorder shadow="md">
                    <Text size="sm" fw={700} mb="md">
                      <Group gap="xs">
                        <ThemeIcon size={20} radius="md" color="brand" variant="light">
                          <ArrowRight size={12} />
                        </ThemeIcon>
                        {action.productName}
                      </Group>
                    </Text>
                    <Stack gap={0}>
                      <Text size="sm" c="dimmed">
                        {action.action}
                      </Text>
                      <Text fw={500}>{action.impact}</Text>
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
