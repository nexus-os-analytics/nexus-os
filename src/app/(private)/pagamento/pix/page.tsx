'use client';

import { Alert, Box, Button, Card, Container, CopyButton, Stack, Text, Title } from '@mantine/core';
import { IconAlertCircle, IconCheck, IconCopy } from '@tabler/icons-react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';

interface PixPaymentData {
  id: string;
  qrCodeBase64: string;
  paymentsEmail: string;
}

export default function PagamentoPixPage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PixPaymentData | null>(null);

  const createPayment = useCallback(async () => {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch('/api/payments/pix', { method: 'POST' });
      if (res.status === 401) {
        router.push('/login?plan=PRO');
        return;
      }
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.error ?? 'Não foi possível gerar o pagamento PIX.');
        return;
      }
      const result = (await res.json()) as {
        id: string;
        qrCodeBase64: string;
        paymentsEmail: string;
      };
      setData({
        id: result.id,
        qrCodeBase64: result.qrCodeBase64,
        paymentsEmail: result.paymentsEmail,
      });
    } catch {
      setError('Erro de conexão. Tente novamente.');
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    createPayment();
  }, [createPayment]);

  if (loading && !data) {
    return (
      <Container size="sm" py="xl">
        <Card withBorder radius="md" p="xl">
          <Stack align="center" gap="md">
            <Text c="dimmed">Gerando QR Code PIX...</Text>
          </Stack>
        </Card>
      </Container>
    );
  }

  if (error && !data) {
    return (
      <Container size="sm" py="xl">
        <Alert icon={<IconAlertCircle size={20} />} color="red" title="Erro">
          {error}
        </Alert>
        <Stack mt="md">
          <Button variant="light" component={Link} href="/precos">
            Voltar aos preços
          </Button>
        </Stack>
      </Container>
    );
  }

  if (!data) {
    return null;
  }

  return (
    <Container size="sm" py="xl">
      <Stack gap="lg">
        <Title order={2}>Pagamento via PIX Manual</Title>
        <Card withBorder radius="md" p="xl">
          <Stack align="center" gap="md">
            <Text fw={500}>Valor: R$ 109,00</Text>
            <Box
              component="img"
              src={data.qrCodeBase64}
              alt="QR Code PIX"
              w={256}
              h={256}
              style={{ objectFit: 'contain' }}
            />
            <Stack gap={4} align="center">
              <Text size="sm" c="dimmed">
                Código PIX (copie e cole no app do seu banco):
              </Text>
              <CopyButton value="00020126330014BR.GOV.BCB.PIX0111457678938455204000053039865406109.005802BR5901N6001C62140510NEXUSOSPRO63040003">
                {({ copied, copy }) => (
                  <Button
                    variant="light"
                    size="sm"
                    leftSection={copied ? <IconCheck size={16} /> : <IconCopy size={16} />}
                    onClick={copy}
                  >
                    {copied ? 'Copiado' : 'Copiar chave PIX'}
                  </Button>
                )}
              </CopyButton>
              <Text
                size="xs"
                c="dimmed"
                ta="center"
                ff="monospace"
                style={{ wordBreak: 'break-all' }}
              >
                00020126330014BR.GOV.BCB.PIX0111457678938455204000053039865406109.005802BR5901N6001C62140510NEXUSOSPRO63040003
              </Text>
            </Stack>
          </Stack>
        </Card>

        <Alert title="Envio do comprovante" color="blue">
          <Stack gap="xs">
            <Text size="sm">
              Após realizar o pagamento, envie o comprovante para o e-mail abaixo. Nossa equipe
              confirmará e ativará seu plano PRO.
            </Text>
            <CopyButton value={data.paymentsEmail}>
              {({ copied, copy }) => (
                <Button variant="subtle" size="xs" onClick={copy}>
                  {copied ? 'E-mail copiado' : data.paymentsEmail}
                </Button>
              )}
            </CopyButton>
          </Stack>
        </Alert>

        <Stack gap="xs">
          <Button component={Link} href={`/pagamento/pix/${data.id}`} color="brand">
            Ver status deste pagamento
          </Button>
          <Button component={Link} href="/precos" variant="outline" color="gray">
            Voltar aos preços
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}
