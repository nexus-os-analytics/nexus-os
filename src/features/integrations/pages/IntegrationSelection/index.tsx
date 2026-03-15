'use client';
import {
  Alert,
  Badge,
  Box,
  Button,
  Card,
  Container,
  Loader,
  Modal,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { AlertCircle, ChevronRight, LogOut } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

type ConnectedProviders = { bling: boolean; meli: boolean; shopee: boolean; olist: boolean };
type DisconnectableProvider = 'bling' | 'meli' | 'shopee';

const PROVIDER_NAMES: Record<DisconnectableProvider, string> = {
  bling: 'Bling',
  meli: 'Mercado Livre',
  shopee: 'Shopee',
};

export function IntegrationSelection({
  canConnect = false,
  connectedProviders,
}: {
  canConnect?: boolean;
  connectedProviders: ConnectedProviders;
}) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  const [connected, setConnected] = useState<ConnectedProviders>(connectedProviders);
  const [disconnectingProvider, setDisconnectingProvider] = useState<DisconnectableProvider | null>(
    null
  );
  const [disconnectLoading, setDisconnectLoading] = useState(false);
  const [disconnectError, setDisconnectError] = useState<string | null>(null);

  const handleConnect = (provider: DisconnectableProvider, path: string) => {
    if (connected[provider]) {
      setDisconnectingProvider(provider);
      return;
    }
    if (!canConnect) {
      setError(
        'Confirme seu e-mail para conectar a uma integração. Verifique sua caixa de entrada.'
      );
      return;
    }
    router.push(path);
  };

  const handleDisconnectConfirm = async () => {
    if (!disconnectingProvider) return;
    setDisconnectLoading(true);
    setDisconnectError(null);
    try {
      const res = await fetch(`/api/integrations/${disconnectingProvider}/disconnect`, {
        method: 'POST',
      });
      if (res.ok) {
        setConnected((prev) => ({ ...prev, [disconnectingProvider]: false }));
        setDisconnectingProvider(null);
        notifications.show({
          color: 'green',
          message: `${PROVIDER_NAMES[disconnectingProvider]} desconectado com sucesso.`,
        });
      } else {
        let message = 'Erro ao desconectar. Tente novamente.';
        try {
          const body = (await res.json()) as { message?: string };
          if (body.message) message = body.message;
        } catch {
          // use fallback message
        }
        setDisconnectError(message);
      }
    } catch {
      setDisconnectError('Erro ao desconectar. Tente novamente.');
    } finally {
      setDisconnectLoading(false);
    }
  };

  return (
    <Box
      style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '2rem' }}
    >
      <Container size="lg">
        <Paper shadow="xl" p="xl" radius="md" style={{ maxWidth: 900, margin: '0 auto' }}>
          <Stack gap="xl">
            <Box ta="center">
              <Title order={1} mb="sm" c="dark">
                Escolha sua Integração
              </Title>
              <Text c="dimmed" size="lg">
                Conecte sua conta para começar a análise inteligente do seu estoque
              </Text>
            </Box>

            {error && (
              <Alert icon={<AlertCircle size={16} />} title="Atenção" color="red" radius="md">
                {error}
              </Alert>
            )}

            <SimpleGrid cols={{ base: 1, sm: 2 }} spacing="lg">
              {/* Bling Card */}
              <Card
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
                style={{ cursor: 'pointer', transition: 'all 0.3s' }}
                onClick={() => handleConnect('bling', '/bling')}
              >
                <Card.Section
                  style={{
                    position: 'relative',
                    padding: '2rem',
                    background: '#f8f9fa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Image src="/img/bling-logo.png" alt="Bling Logo" width={150} height={150} />
                  {connected.bling && (
                    <Badge color="green" style={{ position: 'absolute', top: 8, right: 8 }}>
                      Conectado
                    </Badge>
                  )}
                </Card.Section>
                <Stack gap="md" mt="md">
                  <Title order={3} ta="center">
                    Bling ERP
                  </Title>
                  <Text size="sm" c="dimmed" ta="center">
                    Conecte sua conta Bling para sincronizar produtos, categorias, estoque e vendas
                  </Text>
                  {connected.bling ? (
                    <Button
                      fullWidth
                      variant="light"
                      color="red"
                      leftSection={<LogOut size={16} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setDisconnectingProvider('bling');
                      }}
                    >
                      Desconectar Bling
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      variant="light"
                      rightSection={<ChevronRight size={16} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConnect('bling', '/bling');
                      }}
                    >
                      Conectar Bling
                    </Button>
                  )}
                </Stack>
              </Card>

              {/* Mercado Livre Card */}
              <Card
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
                style={{ cursor: 'pointer', transition: 'all 0.3s' }}
                onClick={() => handleConnect('meli', '/meli')}
              >
                <Card.Section
                  style={{
                    position: 'relative',
                    padding: '2rem',
                    background: '#f8f9fa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Image
                    src="/img/meli-logo.png"
                    alt="Mercado Livre Logo"
                    width={150}
                    height={150}
                  />
                  {connected.meli && (
                    <Badge color="green" style={{ position: 'absolute', top: 8, right: 8 }}>
                      Conectado
                    </Badge>
                  )}
                </Card.Section>
                <Stack gap="md" mt="md">
                  <Title order={3} ta="center">
                    Mercado Livre
                  </Title>
                  <Text size="sm" c="dimmed" ta="center">
                    Conecte sua conta Mercado Livre para sincronizar anúncios, estoque e vendas
                  </Text>
                  {connected.meli ? (
                    <Button
                      fullWidth
                      variant="light"
                      color="red"
                      leftSection={<LogOut size={16} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setDisconnectingProvider('meli');
                      }}
                    >
                      Desconectar Mercado Livre
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      variant="light"
                      color="yellow"
                      rightSection={<ChevronRight size={16} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConnect('meli', '/meli');
                      }}
                    >
                      Conectar Mercado Livre
                    </Button>
                  )}
                </Stack>
              </Card>

              {/* Shopee Card */}
              <Card
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
                style={{ cursor: 'pointer', transition: 'all 0.3s' }}
                onClick={() => handleConnect('shopee', '/shopee')}
              >
                <Card.Section
                  style={{
                    position: 'relative',
                    padding: '2rem',
                    background: '#f8f9fa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Image src="/img/shopee-logo.webp" alt="Shopee Logo" width={150} height={150} />
                  {connected.shopee && (
                    <Badge color="green" style={{ position: 'absolute', top: 8, right: 8 }}>
                      Conectado
                    </Badge>
                  )}
                </Card.Section>
                <Stack gap="md" mt="md">
                  <Title order={3} ta="center">
                    Shopee
                  </Title>
                  <Text size="sm" c="dimmed" ta="center">
                    Conecte sua conta Shopee para sincronizar produtos, estoque e pedidos
                  </Text>
                  {connected.shopee ? (
                    <Button
                      fullWidth
                      variant="light"
                      color="red"
                      leftSection={<LogOut size={16} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        setDisconnectingProvider('shopee');
                      }}
                    >
                      Desconectar Shopee
                    </Button>
                  ) : (
                    <Button
                      fullWidth
                      variant="light"
                      color="orange"
                      rightSection={<ChevronRight size={16} />}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleConnect('shopee', '/shopee');
                      }}
                    >
                      Conectar Shopee
                    </Button>
                  )}
                </Stack>
              </Card>

              {/* Olist Card */}
              <Card
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
                style={{ cursor: 'not-allowed', opacity: 0.5, pointerEvents: 'none' }}
              >
                <Card.Section
                  style={{
                    position: 'relative',
                    padding: '2rem',
                    background: '#f8f9fa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Image src="/img/olist-logo.png" alt="Olist Logo" width={150} height={150} />
                  <Badge color="gray" style={{ position: 'absolute', top: 8, right: 8 }}>
                    Em breve
                  </Badge>
                </Card.Section>
                <Stack gap="md" mt="md">
                  <Title order={3} ta="center">
                    Olist
                  </Title>
                  <Text size="sm" c="dimmed" ta="center">
                    Conecte sua conta Olist para sincronizar anúncios, estoque e vendas
                  </Text>
                  <Button fullWidth variant="light" disabled>
                    Em breve
                  </Button>
                </Stack>
              </Card>
            </SimpleGrid>

            {!canConnect && (
              <Alert
                icon={<AlertCircle size={16} />}
                title="Verificação necessária"
                color="yellow"
                radius="md"
              >
                Você precisa confirmar seu e-mail antes de conectar uma integração. Por favor,
                verifique sua caixa de entrada.
              </Alert>
            )}
          </Stack>
        </Paper>
      </Container>

      <Modal
        opened={disconnectingProvider !== null}
        onClose={() => {
          setDisconnectingProvider(null);
          setDisconnectError(null);
        }}
        title={disconnectingProvider ? `Desconectar ${PROVIDER_NAMES[disconnectingProvider]}` : ''}
      >
        <Stack gap="md">
          <Text>
            Os dados já sincronizados serão mantidos, mas a sincronização automática será pausada
            até que você reconecte.
          </Text>
          {disconnectError && (
            <Alert icon={<AlertCircle size={16} />} color="red" radius="md">
              {disconnectError}
            </Alert>
          )}
          <Box style={{ display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            <Button
              variant="default"
              onClick={() => {
                setDisconnectingProvider(null);
                setDisconnectError(null);
              }}
              disabled={disconnectLoading}
            >
              Cancelar
            </Button>
            <Button
              color="red"
              onClick={handleDisconnectConfirm}
              disabled={disconnectLoading}
              leftSection={disconnectLoading ? <Loader size="xs" /> : undefined}
            >
              Desconectar
            </Button>
          </Box>
        </Stack>
      </Modal>
    </Box>
  );
}
