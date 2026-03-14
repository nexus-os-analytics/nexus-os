'use client';
import {
  Alert,
  Box,
  Button,
  Card,
  Container,
  Paper,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { AlertCircle, ChevronRight } from 'lucide-react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { useState } from 'react';

export function IntegrationSelection({ canConnect = false }: { canConnect?: boolean }) {
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);

  const handleSelectBling = () => {
    if (!canConnect) {
      setError(
        'Confirme seu e-mail para conectar a uma integração. Verifique sua caixa de entrada.'
      );
      return;
    }
    router.push('/bling');
  };

  const handleSelectMeli = () => {
    if (!canConnect) {
      setError(
        'Confirme seu e-mail para conectar a uma integração. Verifique sua caixa de entrada.'
      );
      return;
    }
    router.push('/meli');
  };

  const handleSelectShopee = () => {
    if (!canConnect) {
      setError(
        'Confirme seu e-mail para conectar a uma integração. Verifique sua caixa de entrada.'
      );
      return;
    }
    router.push('/shopee');
  };

  const handleSelectOlist = () => {
    if (!canConnect) {
      setError(
        'Confirme seu e-mail para conectar a uma integração. Verifique sua caixa de entrada.'
      );
      return;
    }
    router.push('/olist');
  };

  return (
    <Box
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '2rem',
      }}
    >
      <Container size="lg">
        <Paper
          shadow="xl"
          p="xl"
          radius="md"
          style={{
            maxWidth: 900,
            margin: '0 auto',
          }}
        >
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
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  },
                }}
                onClick={handleSelectBling}
              >
                <Card.Section
                  style={{
                    padding: '2rem',
                    background: '#f8f9fa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Image src="/img/bling-logo.png" alt="Bling Logo" width={150} height={150} />
                </Card.Section>

                <Stack gap="md" mt="md">
                  <Title order={3} ta="center">
                    Bling ERP
                  </Title>
                  <Text size="sm" c="dimmed" ta="center">
                    Conecte sua conta Bling para sincronizar produtos, categorias, estoque e vendas
                  </Text>
                  <Button
                    fullWidth
                    variant="light"
                    rightSection={<ChevronRight size={16} />}
                    onClick={handleSelectBling}
                  >
                    Conectar Bling
                  </Button>
                </Stack>
              </Card>

              {/* Mercado Livre Card */}
              <Card
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  },
                }}
                onClick={handleSelectMeli}
              >
                <Card.Section
                  style={{
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
                </Card.Section>

                <Stack gap="md" mt="md">
                  <Title order={3} ta="center">
                    Mercado Livre
                  </Title>
                  <Text size="sm" c="dimmed" ta="center">
                    Conecte sua conta Mercado Livre para sincronizar anúncios, estoque e vendas
                  </Text>
                  <Button
                    fullWidth
                    variant="light"
                    color="yellow"
                    rightSection={<ChevronRight size={16} />}
                    onClick={handleSelectMeli}
                  >
                    Conectar Mercado Livre
                  </Button>
                </Stack>
              </Card>

              {/* Shopee Card */}
              <Card
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  },
                }}
                onClick={handleSelectShopee}
              >
                <Card.Section
                  style={{
                    padding: '2rem',
                    background: '#f8f9fa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Image src="/img/shopee-logo.webp" alt="Shopee Logo" width={150} height={150} />
                </Card.Section>

                <Stack gap="md" mt="md">
                  <Title order={3} ta="center">
                    Shopee
                  </Title>
                  <Text size="sm" c="dimmed" ta="center">
                    Conecte sua conta Shopee para sincronizar produtos, estoque e pedidos
                  </Text>
                  <Button
                    fullWidth
                    variant="light"
                    color="orange"
                    rightSection={<ChevronRight size={16} />}
                    onClick={handleSelectShopee}
                  >
                    Conectar Shopee
                  </Button>
                </Stack>
              </Card>

              {/* Olist Card */}
              <Card
                shadow="sm"
                padding="lg"
                radius="md"
                withBorder
                style={{
                  cursor: 'pointer',
                  transition: 'all 0.3s',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: '0 8px 16px rgba(0,0,0,0.1)',
                  },
                }}
                onClick={handleSelectOlist}
              >
                <Card.Section
                  style={{
                    padding: '2rem',
                    background: '#f8f9fa',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <Image src="/img/olist-logo.png" alt="Olist Logo" width={150} height={150} />
                </Card.Section>

                <Stack gap="md" mt="md">
                  <Title order={3} ta="center">
                    Olist
                  </Title>
                  <Text size="sm" c="dimmed" ta="center">
                    Conecte sua conta Olist para sincronizar anúncios, estoque e vendas
                  </Text>
                  <Button
                    fullWidth
                    variant="light"
                    color="blue"
                    rightSection={<ChevronRight size={16} />}
                    onClick={handleSelectOlist}
                  >
                    Conectar Olist
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
    </Box>
  );
}
