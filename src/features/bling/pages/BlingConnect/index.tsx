'use client';
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Divider,
  Group,
  List,
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
  const [simStats, setSimStats] = useState({ products: 0, sales: 0 });

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
          return prev + 7;
        });
      }, 220);

      const stats = setInterval(() => {
        setSimStats((s) => ({
          products: Math.min(s.products + Math.ceil(Math.random() * 12), 127),
          sales: Math.min(s.sales + Math.ceil(Math.random() * 40), 847),
        }));
      }, 180);

      return () => {
        clearInterval(interval);
        clearInterval(stats);
      };
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
            <Stack gap="lg">
              {/* Hero value props */}
              <Card padding="lg" radius="md" withBorder shadow="sm">
                <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="xl">
                  <Stack gap={6}>
                    <Text>
                      <strong>🔴 Nunca mais perca vendas por estoque zerado</strong>
                    </Text>
                    <Text c="dimmed">→ Alertas 3 dias antes de zerar</Text>
                    <Divider my="sm" />
                    <Text>
                      <strong>💰 Recupere até R$ 15k em capital parado</strong>
                    </Text>
                    <Text c="dimmed">→ Veja quanto está travado + preço ideal de liquidação</Text>
                    <Divider my="sm" />
                    <Text>
                      <strong>🚀 Identifique produtos em explosão de vendas</strong>
                    </Text>
                    <Text c="dimmed">→ Aumente estoque antes de perder oportunidade</Text>
                    <Divider my="sm" />
                    <Text>
                      <strong>⚡ Tudo em 30 segundos</strong> (não em 5 horas de planilha)
                    </Text>
                  </Stack>
                  <Stack gap={8}>
                    <Group gap={12} wrap="nowrap">
                      <Badge color="teal" variant="light">
                        ⏱️ Setup: 2 minutos
                      </Badge>
                      <Badge color="gray" variant="light">
                        ✓ Sem cartão de crédito
                      </Badge>
                      <Badge color="gray" variant="light">
                        ✓ Cancele quando quiser
                      </Badge>
                    </Group>
                    <Paper p="md" radius="md" withBorder>
                      <Text fw={700}>🔒 100% Seguro</Text>
                      <List size="sm" spacing={4} mt={6}>
                        <List.Item>Nunca pedimos sua senha</List.Item>
                        <List.Item>Autorização oficial Bling</List.Item>
                        <List.Item>Você pode revogar a qualquer momento</List.Item>
                      </List>
                    </Paper>
                  </Stack>
                </SimpleGrid>
              </Card>

              {/* First impact preview before connect */}
              <Card padding="lg" radius="md" withBorder shadow="md">
                <Title order={4} mb="md">
                  👀 Veja o que você vai descobrir
                </Title>
                <SimpleGrid cols={{ base: 1, sm: 3 }} spacing="lg">
                  <Card withBorder padding="md" radius="md">
                    <Text fw={700} size="lg">
                      💰 R$ 18.450
                    </Text>
                    <Text size="sm" c="dimmed">
                      parados em 23 prods
                    </Text>
                  </Card>
                  <Card withBorder padding="md" radius="md">
                    <Text fw={700} size="lg">
                      ⚠️ 3 produtos
                    </Text>
                    <Text size="sm" c="dimmed">
                      em risco de ruptura
                    </Text>
                  </Card>
                  <Card withBorder padding="md" radius="md">
                    <Text fw={700} size="lg">
                      🚀 2 oportunidades
                    </Text>
                    <Text size="sm" c="dimmed">
                      de crescimento
                    </Text>
                  </Card>
                </SimpleGrid>

                <Divider my="lg" />

                <Paper p="md" radius="md" withBorder>
                  <Group justify="center" mb="sm">
                    <Image src="/img/logo.png" alt="Nexus" width={120} height={40} />
                  </Group>
                  <Text ta="center" mb="sm">
                    🔄 Analisando seu estoque...
                  </Text>
                  <Progress value={65} size="lg" radius="xl" animated />
                  <Text size="xs" c="dimmed" ta="center" mt={4}>
                    ████████████░░░░░░░ 65%
                  </Text>
                  <Stack gap={4} mt="sm">
                    <Text size="sm">✓ 127 produtos encontrados</Text>
                    <Text size="sm">✓ 847 vendas analisadas</Text>
                    <Text size="sm">⏳ Calculando VVD...</Text>
                  </Stack>
                  <Paper p="sm" radius="sm" mt="md" withBorder>
                    <Text size="sm" fw={700}>
                      💡 Você sabia?
                    </Text>
                    <Text size="xs" c="dimmed">
                      Lojistas perdem em média R$ 12k por ano em rupturas evitáveis.
                    </Text>
                  </Paper>
                </Paper>
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
