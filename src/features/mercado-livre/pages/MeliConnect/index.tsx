'use client';
import {
  Alert,
  Box,
  Button,
  Card,
  Container,
  Loader,
  Paper,
  Progress,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useStripeCheckout } from '@/features/billing/services';
import { useQueryString } from '@/hooks';
import { useMeliIntegration } from '@/hooks/useMeliIntegration';

type ConnectionState = 'idle' | 'connecting' | 'analyzing' | 'complete' | 'error';

const PROGRESS_INITIAL = 50;
const PROGRESS_COMPLETE = 100;
const PROGRESS_CONNECTING = 25;
const PROGRESS_INCREMENT = 7;
const ANALYZE_TICK_MS = 220;
const STATS_TICK_MS = 180;
const COMPLETE_DELAY_MS = 1500;
const PRODUCTS_RANDOM_MAX = 12;
const PRODUCTS_CAP = 127;
const SALES_RANDOM_MAX = 40;
const SALES_CAP = 847;

export function MeliConnect({ canConnect = false }: { canConnect?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, loading, connect } = useMeliIntegration();
  const [state, setState] = useState<ConnectionState>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [simStats, setSimStats] = useState({ products: 0, sales: 0 });
  const { getQueryParam } = useQueryString();
  const planParam = (getQueryParam('plan') || '').toUpperCase();
  const { mutateAsync: stripeCheckout } = useStripeCheckout();

  const handleComplete = useCallback(() => {
    router.push('/visao-geral');
  }, [router]);

  const handleConnect = async () => {
    try {
      if (!canConnect && searchParams.get('activated') !== '1') {
        setError(
          'Confirme seu e-mail para conectar ao Mercado Livre. Verifique sua caixa de entrada.'
        );
        return;
      }
      setState('connecting');
      setError(null);
      setProgress(PROGRESS_CONNECTING);

      const authUrl = await connect();

      // Redirecionar para a página de autorização do Mercado Livre
      window.location.href = authUrl;
    } catch (err) {
      console.error('Error connecting to Mercado Livre:', err);
      setState('error');
      setError('Erro ao iniciar conexão com o Mercado Livre. Tente novamente.');
    }
  };

  const getTitle = () => {
    if (state === 'idle') return 'Conectar com Mercado Livre';
    if (state === 'connecting') return 'Conectando...';
    if (state === 'analyzing') return 'Analisando anúncios...';
    if (state === 'error') return 'Erro na conexão';
    return 'Tudo pronto!';
  };

  const getDescription = () => {
    if (state === 'idle')
      return 'Conecte sua conta Mercado Livre para começar a análise inteligente do seu estoque.';
    if (state === 'connecting') return 'Redirecionando para o Mercado Livre...';
    if (state === 'analyzing')
      return 'Analisando Anúncios ⏳ | Importando dados dos últimos 30 dias para gerar valor rápido...';
    if (state === 'error')
      return 'Houve um problema ao conectar com o Mercado Livre. Tente novamente.';
    return 'Conexão bem-sucedida! Seu dashboard estará pronto em breve. Você será notificado por e-mail.';
  };

  const handleStripeCheckout = useCallback(async () => {
    try {
      const { url } = await stripeCheckout();
      if (url) {
        window.location.href = url;
      }
    } catch (error) {
      console.error('error on stripe checkout', error);
    }
  }, [stripeCheckout]);

  // Detectar sucesso após callback OAuth
  useEffect(() => {
    if (searchParams.get('success') === '1' && state === 'idle') {
      setState('analyzing');
      setProgress(PROGRESS_INITIAL);
    }
  }, [searchParams, state]);

  // Simulação de progresso durante análise
  useEffect(() => {
    if (state !== 'analyzing') return;
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= PROGRESS_COMPLETE) return prev;
        return Math.min(prev + PROGRESS_INCREMENT, PROGRESS_COMPLETE - 5);
      });
    }, ANALYZE_TICK_MS);
    return () => clearInterval(progressTimer);
  }, [state]);

  // Simulação de estatísticas crescentes
  useEffect(() => {
    if (state !== 'analyzing') return;
    const statsTimer = setInterval(() => {
      setSimStats((prev) => ({
        products: Math.min(
          prev.products + Math.floor(Math.random() * PRODUCTS_RANDOM_MAX),
          PRODUCTS_CAP
        ),
        sales: Math.min(prev.sales + Math.floor(Math.random() * SALES_RANDOM_MAX), SALES_CAP),
      }));
    }, STATS_TICK_MS);
    return () => clearInterval(statsTimer);
  }, [state]);

  // Verificar se sincronização foi concluída
  useEffect(() => {
    if (state !== 'analyzing' && state !== 'connecting') return;
    const checkInterval = setInterval(async () => {
      try {
        const response = await fetch('/api/integrations/meli/status');
        const data = await response.json();
        if (data.syncStatus === 'COMPLETED') {
          setProgress(PROGRESS_COMPLETE);
          setState('complete');
          setTimeout(() => {
            handleComplete();
          }, COMPLETE_DELAY_MS);
        } else if (data.syncStatus === 'FAILED') {
          setState('error');
          setError('Sincronização falhou. Tente novamente.');
        }
      } catch (err) {
        console.error('Error checking sync status:', err);
      }
    }, 3000); // Check every 3 seconds
    return () => clearInterval(checkInterval);
  }, [state, handleComplete]);

  // Se ainda está carregando o status da integração
  if (loading && state === 'idle') {
    return (
      <Container>
        <Paper radius="lg" p="xl" withBorder shadow="md" style={{ width: '100%' }}>
          <Stack gap="lg" align="center">
            <Loader size="xl" />
            <Text>Verificando status da integração...</Text>
          </Stack>
        </Paper>
      </Container>
    );
  }

  return (
    <Container>
      <Paper radius="lg" p="xl" withBorder shadow="md" style={{ width: '100%' }}>
        <Stack gap="lg">
          <Box style={{ textAlign: 'center' }}>
            <Image src="/img/meli-logo.png" alt="Mercado Livre Logo" width={180} height={180} />
            <Title order={2} ta="center">
              {getTitle()}
            </Title>
            <Text size="sm" ta="center" mt="sm">
              {getDescription()}
            </Text>
          </Box>

          {error && (
            <Alert
              icon={<AlertCircle size={16} />}
              title="Erro na conexão"
              color="red"
              variant="light"
            >
              {error}
            </Alert>
          )}

          {state === 'idle' && (
            <Stack gap="lg">
              {/* Hero value props */}
              <Card padding="lg" radius="md" withBorder shadow="sm">
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
                  <Card withBorder padding="md" radius="md">
                    <Text fw={700} size="sm">
                      🔴 Nunca mais perca vendas por falta de estoque
                    </Text>
                    <Text size="sm" c="dimmed">
                      Receba alertas inteligentes antes de ficar sem produtos ativos
                    </Text>
                  </Card>
                  <Card withBorder padding="md" radius="md">
                    <Text fw={700} size="sm">
                      💰 Recupere capital travado em produtos parados
                    </Text>
                    <Text size="sm" c="dimmed">
                      Identifique anúncios com estoque encalhado e preço ideal de liquidação
                    </Text>
                  </Card>
                  <Card withBorder padding="md" radius="md">
                    <Text fw={700} size="sm">
                      🚀 Identifique anúncios em explosão de vendas
                    </Text>
                    <Text size="sm" c="dimmed">
                      Aumente estoque antes de perder oportunidade
                    </Text>
                  </Card>
                </SimpleGrid>
              </Card>
              <Button
                onClick={handleConnect}
                fullWidth
                size="lg"
                color="yellow"
                loading={loading}
                disabled={!canConnect}
              >
                Conectar com Mercado Livre
              </Button>
              {!canConnect && (
                <Alert
                  icon={<AlertCircle size={16} />}
                  title="Verifique seu e-mail"
                  color="yellow"
                  variant="light"
                >
                  Sua conta ainda não está verificada. Ative pelo e-mail enviado para liberar a
                  conexão.
                </Alert>
              )}
            </Stack>
          )}

          {(state === 'connecting' || state === 'analyzing') && (
            <Stack gap="md" align="center">
              <Loader size="xl" color="yellow" type="dots" />
              <Progress value={progress} size="lg" color="yellow" radius="xl" w="100%" animated />
              <Text size="sm" c="dimmed">
                {Math.round(progress)}% completo
              </Text>
              <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg" style={{ width: '100%' }}>
                <Card withBorder padding="md" radius="md">
                  <Text size="sm">✓ {simStats.products} anúncios encontrados</Text>
                </Card>
                <Card withBorder padding="md" radius="md">
                  <Text size="sm">✓ {simStats.sales} vendas analisadas</Text>
                </Card>
                <Card withBorder padding="md" radius="md">
                  <Text size="sm">⏳ Calculando VVD...</Text>
                </Card>
              </SimpleGrid>
              <Paper p="sm" radius="sm" withBorder style={{ width: '100%' }}>
                <Text size="sm" fw={700}>
                  💡 Você sabia?
                </Text>
                <Text size="xs" c="dimmed">
                  Lojistas perdem em média R$ 12k por ano em rupturas evitáveis.
                </Text>
              </Paper>
            </Stack>
          )}

          {state === 'complete' && (
            <Stack gap="md" align="center">
              <ThemeIcon size={64} radius="xl" color="teal" variant="light">
                <CheckCircle2 size={32} />
              </ThemeIcon>
              <Text size="sm" c="dimmed" ta="center">
                Redirecionando para o dashboard...
              </Text>
            </Stack>
          )}

          {state === 'error' && (
            <Stack gap="md" align="center">
              <ThemeIcon size={64} radius="xl" color="red" variant="light">
                <AlertCircle size={32} />
              </ThemeIcon>
              <Button onClick={handleConnect} fullWidth size="md" color="yellow">
                Tentar novamente
              </Button>
            </Stack>
          )}
        </Stack>
      </Paper>
    </Container>
  );
}
