'use client';
import {
  Alert,
  Box,
  Button,
  Container,
  Loader,
  Paper,
  Progress,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import { useShopeeIntegration } from '@/hooks/useShopeeIntegration';

type ConnectionState = 'idle' | 'connecting' | 'analyzing' | 'complete' | 'error';

const PROGRESS_INITIAL = 50;
const PROGRESS_COMPLETE = 100;
const PROGRESS_CONNECTING = 25;
const PROGRESS_INCREMENT = 7;
const ANALYZE_TICK_MS = 220;
const COMPLETE_DELAY_MS = 1500;

export function ShopeeConnect({ canConnect = false }: { canConnect?: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loading, connect } = useShopeeIntegration();
  const [state, setState] = useState<ConnectionState>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const handleComplete = useCallback(() => {
    router.push('/visao-geral');
  }, [router]);

  const handleConnect = async () => {
    try {
      if (!canConnect && searchParams.get('activated') !== '1') {
        setError('Confirme seu e-mail para conectar ao Shopee. Verifique sua caixa de entrada.');
        return;
      }
      setState('connecting');
      setError(null);
      setProgress(PROGRESS_CONNECTING);

      const authUrl = await connect();
      window.location.href = authUrl;
    } catch (err) {
      console.error('Error connecting to Shopee:', err);
      setState('error');
      setError('Erro ao iniciar conexão com o Shopee. Tente novamente.');
    }
  };

  const getTitle = () => {
    if (state === 'idle') return 'Conectar com Shopee';
    if (state === 'connecting') return 'Conectando...';
    if (state === 'analyzing') return 'Analisando produtos...';
    if (state === 'error') return 'Erro na conexão';
    return 'Tudo pronto!';
  };

  const getDescription = () => {
    if (state === 'idle')
      return 'Conecte sua conta Shopee para começar a análise inteligente do seu estoque.';
    if (state === 'connecting') return 'Redirecionando para o Shopee...';
    if (state === 'analyzing')
      return 'Analisando produtos ⏳ | Importando dados dos últimos 30 dias para gerar valor rápido...';
    if (state === 'error') return 'Houve um problema ao conectar com o Shopee. Tente novamente.';
    return 'Conexão bem-sucedida! Seu dashboard estará pronto em breve. Você será notificado por e-mail.';
  };

  // Detect success after OAuth callback
  useEffect(() => {
    if (searchParams.get('success') === 'shopee_connected' && state === 'idle') {
      setState('analyzing');
      setProgress(PROGRESS_INITIAL);
    }
  }, [searchParams, state]);

  // Progress simulation during analysis
  useEffect(() => {
    if (state !== 'analyzing') return;
    const progressTimer = setInterval(() => {
      setProgress((prev) => {
        if (prev >= PROGRESS_COMPLETE) {
          clearInterval(progressTimer);
          return PROGRESS_COMPLETE;
        }
        return prev + PROGRESS_INCREMENT;
      });
    }, ANALYZE_TICK_MS);
    return () => clearInterval(progressTimer);
  }, [state]);

  // Complete transition
  useEffect(() => {
    if (progress >= PROGRESS_COMPLETE && state === 'analyzing') {
      const timer = setTimeout(() => {
        setState('complete');
      }, COMPLETE_DELAY_MS);
      return () => clearTimeout(timer);
    }
  }, [progress, state]);

  return (
    <Container size="sm" py="xl">
      <Stack align="center" gap="xl">
        <Box>
          <Image
            src="/assets/shopee-logo.png"
            alt="Shopee"
            width={120}
            height={40}
            style={{ objectFit: 'contain' }}
          />
        </Box>

        <Paper shadow="sm" p="xl" radius="md" w="100%">
          <Stack gap="md">
            <Title order={2} ta="center">
              {getTitle()}
            </Title>
            <Text c="dimmed" ta="center" size="sm">
              {getDescription()}
            </Text>

            {(state === 'analyzing' || state === 'connecting') && (
              <Stack align="center" gap="xs">
                <Loader size="sm" />
                <Progress value={progress} w="100%" animated />
              </Stack>
            )}

            {state === 'complete' && (
              <Stack align="center" gap="xs">
                <CheckCircle2 color="green" size={48} />
                <Button onClick={handleComplete} color="green" size="md">
                  Ver meu Dashboard
                </Button>
              </Stack>
            )}

            {error && (
              <Alert icon={<AlertCircle size={16} />} color="red" variant="light">
                {error}
              </Alert>
            )}

            {state === 'idle' && (
              <Button onClick={handleConnect} loading={loading} color="orange" size="md" fullWidth>
                Conectar com Shopee
              </Button>
            )}

            {state === 'error' && (
              <Button onClick={() => setState('idle')} variant="outline" size="md" fullWidth>
                Tentar novamente
              </Button>
            )}
          </Stack>
        </Paper>
      </Stack>
    </Container>
  );
}
