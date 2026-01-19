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
import { useBlingIntegration } from '@/hooks/useBlingIntegration';

type ConnectionState = 'idle' | 'connecting' | 'analyzing' | 'complete' | 'error';

export function BlingConnect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, loading, connect } = useBlingIntegration();
  const [state, setState] = useState<ConnectionState>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [simStats, setSimStats] = useState({ products: 0, sales: 0 });
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

  // Verificar parâmetros de URL para erros/sucesso
  useEffect(() => {
    const errorParam = searchParams.get('error');
    const successParam = searchParams.get('success');

    if (errorParam) {
      setState('error');
      switch (errorParam) {
        case 'auth_failed':
          setError('Falha na autenticação com o Bling. Tente novamente.');
          break;
        case 'connection_failed':
          setError('Erro ao conectar com o Bling. Verifique suas credenciais.');
          break;
        case 'invalid_callback':
          setError('Callback inválido do Bling. Tente novamente.');
          break;
        case 'unauthorized':
          setError('Usuário não autorizado. Faça login e tente novamente.');
          break;
        default:
          setError('Erro desconhecido ao conectar com o Bling.');
      }
    }

    if (successParam === 'bling_connected') {
      setState('analyzing');
      setProgress(PROGRESS_INITIAL);
    }
  }, [searchParams]);

  // Verificar se já está conectado
  useEffect(() => {
    if (status?.syncStatus === 'COMPLETED' && state === 'idle') {
      setState('complete');
      setProgress(PROGRESS_COMPLETE);
    }
  }, [status, state]);

  const handleComplete = useCallback(() => {
    router.push('/visao-geral');
  }, [router]);

  useEffect(() => {
    if (state === 'analyzing') {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= PROGRESS_COMPLETE) {
            clearInterval(interval);
            setState('complete');
            return PROGRESS_COMPLETE;
          }
          return prev + PROGRESS_INCREMENT;
        });
      }, ANALYZE_TICK_MS);

      const stats = setInterval(() => {
        setSimStats((s) => ({
          products: Math.min(
            s.products + Math.ceil(Math.random() * PRODUCTS_RANDOM_MAX),
            PRODUCTS_CAP
          ),
          sales: Math.min(s.sales + Math.ceil(Math.random() * SALES_RANDOM_MAX), SALES_CAP),
        }));
      }, STATS_TICK_MS);

      return () => {
        clearInterval(interval);
        clearInterval(stats);
      };
    }

    if (state === 'complete') {
      const timer = setTimeout(() => {
        handleComplete();
      }, COMPLETE_DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [state, handleComplete]);

  const handleConnect = async () => {
    try {
      setState('connecting');
      setError(null);
      setProgress(PROGRESS_CONNECTING);

      const authUrl = await connect();

      // Redirecionar para a página de autorização do Bling
      window.location.href = authUrl;
    } catch (err) {
      console.error('Error connecting to Bling:', err);
      setState('error');
      setError('Erro ao iniciar conexão com o Bling. Tente novamente.');
    }
  };

  const getTitle = () => {
    if (state === 'idle') return 'Conectar com Bling';
    if (state === 'connecting') return 'Conectando...';
    if (state === 'analyzing') return 'Analisando produtos...';
    if (state === 'error') return 'Erro na conexão';
    return 'Tudo pronto!';
  };

  const getDescription = () => {
    if (state === 'idle')
      return 'Conecte sua conta Bling para começar a análise inteligente do seu estoque.';
    if (state === 'connecting') return 'Redirecionando para o Bling...';
    if (state === 'analyzing')
      return 'Analisando Produtos ⏳ | Importando dados dos últimos 7 dias para gerar valor rápido...';
    if (state === 'error') return 'Houve um problema ao conectar com o Bling. Tente novamente.';
    return 'Conexão bem-sucedida! Seu dashboard estará pronto em breve. Você será notificado por e-mail.';
  };

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
            <Image src="/img/bling-logo.png" alt="Bling Logo" width={180} height={70} />
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
                      🔴 Nunca mais perca vendas por estoque zerado
                    </Text>
                    <Text size="sm" c="dimmed">
                      Receba alertas inteligentes de ruptura antes que aconteçam
                    </Text>
                  </Card>
                  <Card withBorder padding="md" radius="md">
                    <Text fw={700} size="sm">
                      💰 Recupere até R$ 15k em capital parado
                    </Text>
                    <Text size="sm" c="dimmed">
                      Veja quanto está travado + preço ideal de liquidação
                    </Text>
                  </Card>
                  <Card withBorder padding="md" radius="md">
                    <Text fw={700} size="sm">
                      🚀 Identifique produtos em explosão de vendas
                    </Text>
                    <Text size="sm" c="dimmed">
                      Aumente estoque antes de perder oportunidade
                    </Text>
                  </Card>
                </SimpleGrid>
              </Card>
              <Button onClick={handleConnect} fullWidth size="lg" color="green.9" loading={loading}>
                Conectar com Bling
              </Button>
            </Stack>
          )}

          {(state === 'connecting' || state === 'analyzing') && (
            <Stack gap="md" align="center">
              <Loader size="xl" color="green.9" type="dots" />
              <Progress value={progress} size="lg" color="green.9" radius="xl" w="100%" animated />
              <Text size="sm" c="dimmed">
                {Math.round(progress)}% completo
              </Text>
              <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg" style={{ width: '100%' }}>
                <Card withBorder padding="md" radius="md">
                  <Text size="sm">✓ {simStats.products} produtos encontrados</Text>
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
              <Button onClick={handleConnect} fullWidth size="md" color="green.9">
                Tentar novamente
              </Button>
            </Stack>
          )}
        </Stack>
      </Paper>
    </Container>
  );
}
