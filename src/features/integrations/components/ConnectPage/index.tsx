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
import { useCallback, useEffect, useRef, useState } from 'react';

export interface ConnectPageConfig {
  color: string;
  logoSrc: string;
  logoAlt: string;
  logoWidth?: number;
  logoHeight?: number;
  providerName: string;
  successParam: string;
  analysisLabel: string;
  itemsLabel: string;
  funFact?: string;
  valuePropCards: Array<{
    emoji: string;
    title: string;
    description: string;
  }>;
}

export interface ConnectPageProps {
  config: ConnectPageConfig;
  canConnect: boolean;
  loading: boolean;
  onConnect: () => Promise<string>;
}

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

const ERROR_MESSAGES: Record<string, string> = {
  auth_failed: 'Falha na autenticação. Tente novamente.',
  connection_failed: 'Erro ao conectar. Verifique suas credenciais.',
  invalid_callback: 'Callback inválido. Tente novamente.',
  unauthorized: 'Usuário não autorizado. Faça login e tente novamente.',
  token_exchange_failed: 'Erro ao trocar token de acesso.',
  config_missing: 'Configuração do servidor incompleta. Contate o suporte.',
};
const DEFAULT_ERROR_MESSAGE = 'Erro desconhecido ao conectar.';

export function ConnectPage({ config, canConnect, loading, onConnect }: ConnectPageProps) {
  const [state, setState] = useState<ConnectionState>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [simStats, setSimStats] = useState({ products: 0, sales: 0 });

  const router = useRouter();
  const searchParams = useSearchParams();
  const handledRef = useRef(false);

  const handleComplete = useCallback(() => {
    router.push('/visao-geral');
  }, [router]);

  const handleConnect = async () => {
    if (!canConnect && searchParams.get('activated') !== '1') {
      setError(
        `Confirme seu e-mail para conectar ao ${config.providerName}. Verifique sua caixa de entrada.`
      );
      return;
    }
    setState('connecting');
    setError(null);
    setProgress(PROGRESS_CONNECTING);
    const authUrl = await onConnect();
    window.location.href = authUrl;
  };

  const handleConnectWithCatch = async () => {
    try {
      await handleConnect();
    } catch (err) {
      setState('error');
      setError(
        err instanceof Error
          ? err.message
          : `Erro ao iniciar conexão com ${config.providerName}. Tente novamente.`
      );
    }
  };

  const getTitle = () => {
    switch (state) {
      case 'idle':
        return `Conectar com ${config.providerName}`;
      case 'connecting':
        return 'Conectando...';
      case 'analyzing':
        return `Analisando ${config.analysisLabel}...`;
      case 'error':
        return 'Erro na conexão';
      case 'complete':
        return 'Tudo pronto!';
    }
  };

  const getDescription = () => {
    switch (state) {
      case 'idle':
        return `Conecte sua conta ${config.providerName} para começar a análise inteligente do seu estoque.`;
      case 'connecting':
        return `Redirecionando para ${config.providerName}...`;
      case 'analyzing': {
        const label = config.analysisLabel.charAt(0).toUpperCase() + config.analysisLabel.slice(1);
        return `Analisando ${label} ⏳ | Importando dados dos últimos 30 dias para gerar valor rápido...`;
      }
      case 'error':
        return `Houve um problema ao conectar com ${config.providerName}. Tente novamente.`;
      case 'complete':
        return 'Conexão bem-sucedida! Seu dashboard estará pronto em breve. Você será notificado por e-mail.';
    }
  };

  // useEffect 1 — URL param detection (runs once on mount via handledRef)
  useEffect(() => {
    if (handledRef.current) return;

    const successParam = searchParams.get('success');
    const errorParam = searchParams.get('error');

    if (successParam === config.successParam) {
      handledRef.current = true;
      setState('analyzing');
      setProgress(PROGRESS_INITIAL);
    } else if (errorParam) {
      handledRef.current = true;
      setState('error');
      setError(ERROR_MESSAGES[errorParam] ?? DEFAULT_ERROR_MESSAGE);
    }
  }, [searchParams, config.successParam]);

  // useEffect 2 — Progress animation
  useEffect(() => {
    if (state !== 'analyzing') return;

    const interval = setInterval(() => {
      setProgress((prev) => {
        const next = prev + PROGRESS_INCREMENT;
        if (next >= PROGRESS_COMPLETE) {
          clearInterval(interval);
          setState('complete');
          return PROGRESS_COMPLETE;
        }
        return next;
      });
    }, ANALYZE_TICK_MS);

    return () => clearInterval(interval);
  }, [state]);

  // useEffect 3 — SimStats animation
  useEffect(() => {
    if (state !== 'analyzing') return;

    const statsTimer = setInterval(() => {
      setSimStats((s) => ({
        products: Math.min(
          s.products + Math.ceil(Math.random() * PRODUCTS_RANDOM_MAX),
          PRODUCTS_CAP
        ),
        sales: Math.min(s.sales + Math.ceil(Math.random() * SALES_RANDOM_MAX), SALES_CAP),
      }));
    }, STATS_TICK_MS);

    return () => clearInterval(statsTimer);
  }, [state]);

  // useEffect 4 — Complete redirect
  useEffect(() => {
    if (state !== 'complete') return;

    const timer = setTimeout(handleComplete, COMPLETE_DELAY_MS);
    return () => clearTimeout(timer);
  }, [state, handleComplete]);

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
          {/* Logo + Title + Description */}
          <Box style={{ textAlign: 'center' }}>
            <Image
              src={config.logoSrc}
              alt={config.logoAlt}
              width={config.logoWidth ?? 180}
              height={config.logoHeight ?? 180}
            />
            <Title order={2} ta="center">
              {getTitle()}
            </Title>
            <Text size="sm" ta="center" mt="sm">
              {getDescription()}
            </Text>
          </Box>

          {/* Error Alert */}
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

          {/* IDLE state */}
          {state === 'idle' && (
            <Stack gap="lg">
              <Card padding="lg" radius="md" withBorder shadow="sm">
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
                  {config.valuePropCards.map((card) => (
                    <Card key={card.title} withBorder padding="md" radius="md">
                      <Text fw={700} size="sm">
                        {card.emoji} {card.title}
                      </Text>
                      <Text size="sm" c="dimmed">
                        {card.description}
                      </Text>
                    </Card>
                  ))}
                </SimpleGrid>
              </Card>
              <Button
                onClick={handleConnectWithCatch}
                fullWidth
                size="lg"
                color={config.color}
                loading={loading}
                disabled={!canConnect}
              >
                Conectar com {config.providerName}
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

          {/* CONNECTING / ANALYZING state */}
          {(state === 'connecting' || state === 'analyzing') && (
            <Stack gap="md" align="center">
              <Loader size="xl" color={config.color} type="dots" />
              <Progress
                value={progress}
                size="lg"
                color={config.color}
                radius="xl"
                w="100%"
                animated
              />
              <Text size="sm" c="dimmed">
                {Math.round(progress)}% completo
              </Text>
              <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg" style={{ width: '100%' }}>
                <Card withBorder padding="md" radius="md">
                  <Text size="sm">
                    ✓ {simStats.products} {config.itemsLabel} encontrados
                  </Text>
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
                  {config.funFact ??
                    'Lojistas perdem em média R$ 12k por ano em rupturas evitáveis.'}
                </Text>
              </Paper>
            </Stack>
          )}

          {/* COMPLETE state */}
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

          {/* ERROR state */}
          {state === 'error' && (
            <Stack gap="md" align="center">
              <ThemeIcon size={64} radius="xl" color="red" variant="light">
                <AlertCircle size={32} />
              </ThemeIcon>
              <Button onClick={handleConnectWithCatch} fullWidth size="md" color={config.color}>
                Tentar novamente
              </Button>
            </Stack>
          )}
        </Stack>
      </Paper>
    </Container>
  );
}
