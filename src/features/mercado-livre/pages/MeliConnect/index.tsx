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
import { AlertCircle, CheckCircle2, ShoppingBag } from 'lucide-react';
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

  return (
    <Box
      style={{
        minHeight: '100vh',
        background: 'linear-gradient(135deg, #FFE600 0%, #F7D000 100%)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <Container size="md">
        <Paper
          shadow="xl"
          p="xl"
          radius="md"
          style={{
            maxWidth: 600,
            margin: '0 auto',
          }}
        >
          <Stack gap="xl">
            <Box ta="center">
              <ThemeIcon
                size={80}
                radius="xl"
                variant="gradient"
                gradient={{ from: 'yellow', to: 'orange' }}
                mb="md"
                mx="auto"
              >
                {state === 'complete' ? (
                  <CheckCircle2 size={48} />
                ) : state === 'error' ? (
                  <AlertCircle size={48} />
                ) : state === 'idle' ? (
                  <ShoppingBag size={48} />
                ) : (
                  <Loader size="lg" />
                )}
              </ThemeIcon>
              <Title order={1} mb="sm" c="dark">
                {getTitle()}
              </Title>
              <Text c="dimmed" size="lg">
                {getDescription()}
              </Text>
            </Box>

            {error && (
              <Alert icon={<AlertCircle size={16} />} title="Erro" color="red" radius="md">
                {error}
              </Alert>
            )}

            {state === 'analyzing' && (
              <Box>
                <Progress value={progress} size="lg" radius="md" animated mb="md" />
                <SimpleGrid cols={2} spacing="md">
                  <Card shadow="sm" padding="md" radius="md" withBorder>
                    <Text size="sm" c="dimmed" fw={500}>
                      Anúncios
                    </Text>
                    <Text size="xl" fw={700}>
                      {simStats.products}
                    </Text>
                  </Card>
                  <Card shadow="sm" padding="md" radius="md" withBorder>
                    <Text size="sm" c="dimmed" fw={500}>
                      Vendas
                    </Text>
                    <Text size="xl" fw={700}>
                      {simStats.sales}
                    </Text>
                  </Card>
                </SimpleGrid>
              </Box>
            )}

            {state === 'idle' && (
              <Button
                size="lg"
                onClick={handleConnect}
                loading={loading}
                fullWidth
                variant="gradient"
                gradient={{ from: 'yellow', to: 'orange' }}
              >
                Conectar Mercado Livre
              </Button>
            )}

            {state === 'complete' && (
              <Button
                size="lg"
                onClick={handleComplete}
                fullWidth
                variant="gradient"
                gradient={{ from: 'teal', to: 'green' }}
              >
                Ir para o Dashboard
              </Button>
            )}

            {state === 'error' && (
              <Button size="lg" onClick={handleConnect} fullWidth color="red">
                Tentar Novamente
              </Button>
            )}

            {planParam === 'PRO' && state === 'idle' && (
              <Alert icon={<AlertCircle size={16} />} title="Plano PRO selecionado" color="blue">
                Após conectar o Mercado Livre, você será direcionado ao checkout para ativar o plano
                PRO com sincronização horária e produtos ilimitados.
              </Alert>
            )}
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
