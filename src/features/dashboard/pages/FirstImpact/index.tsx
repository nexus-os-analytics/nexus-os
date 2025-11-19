'use client';
import {
  Box,
  Button,
  Card,
  Container,
  Group,
  List,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { AlertTriangle, ArrowRight, DollarSign, Sparkles, TrendingUp } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { FirstImpactData } from '@/types';

export function FirstImpact() {
  const [data, setData] = useState<FirstImpactData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

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

  const onContinue = () => {
    globalThis.location.href = '/dashboard';
  };

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
              <List
                spacing="md"
                size="md"
                center
                icon={
                  <ThemeIcon color="brand" size={24} radius="xl">
                    <ArrowRight size={16} />
                  </ThemeIcon>
                }
              >
                {data.topActions.map((action) => (
                  <List.Item key={action.productName}>
                    <Paper p="md" radius="md">
                      <Text mb="xs">
                        <strong>{action.productName}</strong>
                      </Text>
                      <Text size="sm" mb={4}>
                        {action.action}
                      </Text>
                      <Text size="sm" c="brand">
                        💡 {action.impact}
                      </Text>
                    </Paper>
                  </List.Item>
                ))}
              </List>
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
