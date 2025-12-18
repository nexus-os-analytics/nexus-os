'use client';
import {
  Alert,
  Box,
  Button,
  Container,
  List,
  Loader,
  Paper,
  Progress,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { AlertCircle, CheckCircle2 } from 'lucide-react';
import Image from 'next/image';
import { useRouter, useSearchParams } from 'next/navigation';
import { useEffect, useState } from 'react';
import { useBlingIntegration } from '@/hooks/useBlingIntegration';

type ConnectionState = 'idle' | 'connecting' | 'analyzing' | 'complete' | 'error';

export function BlingConnect() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { status, loading, connect } = useBlingIntegration();

  const [state, setState] = useState<ConnectionState>('idle');
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);

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
      setProgress(50);
    }
  }, [searchParams]);

  // Verificar se já está conectado
  useEffect(() => {
    if (status?.syncStatus === 'COMPLETED' && state === 'idle') {
      setState('complete');
      setProgress(100);
    }
  }, [status, state]);

  const handleComplete = () => {
    router.push('/visao-geral');
  };

  useEffect(() => {
    if (state === 'analyzing') {
      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setState('complete');
            return 100;
          }
          return prev + 10;
        });
      }, 200);
      return () => clearInterval(interval);
    }

    if (state === 'complete') {
      const timer = setTimeout(() => {
        handleComplete();
      }, 1500);
      return () => clearTimeout(timer);
    }
  }, [state]);

  const handleConnect = async () => {
    try {
      setState('connecting');
      setError(null);
      setProgress(25);

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
            <Stack gap="md">
              <Paper p="md" withBorder>
                <Text size="sm" mb="xs" c="brand">
                  O que você ganhará:
                </Text>
                <List size="sm" spacing="xs">
                  <List.Item>
                    🚨 Alertas de risco de ruptura de estoque (VVD simplificada)
                  </List.Item>
                  <List.Item>💰 Identificação de capital parado e dias sem vender</List.Item>
                  <List.Item>📈 Oportunidades de vendas (produtos em alta)</List.Item>
                  <List.Item>🤖 Gerador de campanhas com IA</List.Item>
                </List>
              </Paper>
              <Paper
                p="sm"
                withBorder
                style={{ backgroundColor: 'rgba(199, 164, 70, 0.1)', borderColor: '#C7A446' }}
              >
                <Text size="xs" c="brand">
                  🔒 <strong>Conexão segura via OAuth 2.0</strong> - Não pedimos sua chave de API. A
                  autenticação é feita diretamente com o Bling.
                </Text>
              </Paper>
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
