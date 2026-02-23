'use client';

import {
  Alert,
  Button,
  Container,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import { IconAlertCircle, IconCheck, IconClock, IconX } from '@tabler/icons-react';
import Link from 'next/link';
import { useParams, useRouter } from 'next/navigation';
import { useCallback, useEffect, useState } from 'react';
import type { PixPaymentStatus } from '@prisma/client';

interface PaymentStatusData {
  id: string;
  status: PixPaymentStatus;
  amount: number;
  pixExternalId: string;
  createdAt: string;
  updatedAt: string;
}

const STATUS_CONFIG: Record<
  string,
  { label: string; color: string; icon: React.ReactNode }
> = {
  AGUARDANDO_PAGAMENTO: {
    label: 'Aguardando confirmação',
    color: 'yellow',
    icon: <IconClock size={48} />,
  },
  PAGAMENTO_CONFIRMADO: {
    label: 'Pagamento confirmado',
    color: 'green',
    icon: <IconCheck size={48} />,
  },
  PAGAMENTO_RECUSADO: {
    label: 'Pagamento não confirmado',
    color: 'red',
    icon: <IconX size={48} />,
  },
  EXPIRADO: {
    label: 'Expirado',
    color: 'gray',
    icon: <IconClock size={48} />,
  },
};

export default function PagamentoPixStatusPage() {
  const params = useParams();
  const router = useRouter();
  const id = params.id as string;
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [data, setData] = useState<PaymentStatusData | null>(null);

  const fetchStatus = useCallback(async () => {
    if (!id) return;
    setError(null);
    try {
      const res = await fetch(`/api/payments/pix/${id}`);
      if (res.status === 401) {
        router.push('/login');
        return;
      }
      if (res.status === 404 || !res.ok) {
        setError('Pagamento não encontrado.');
        setData(null);
        return;
      }
      const result = (await res.json()) as PaymentStatusData;
      setData(result);
    } catch {
      setError('Erro ao carregar status.');
      setData(null);
    } finally {
      setLoading(false);
    }
  }, [id, router]);

  useEffect(() => {
    fetchStatus();
  }, [fetchStatus]);

  if (loading && !data) {
    return (
      <Container size="sm" py="xl">
        <Stack align="center" gap="md">
          <Text c="dimmed">Carregando status do pagamento...</Text>
        </Stack>
      </Container>
    );
  }

  if (error && !data) {
    return (
      <Container size="sm" py="xl">
        <Alert icon={<IconAlertCircle size={20} />} color="red" title="Erro">
          {error}
        </Alert>
        <Button component={Link} href="/pagamento/pix" mt="md">
          Gerar novo pagamento PIX
        </Button>
      </Container>
    );
  }

  if (!data) {
    return null;
  }

  const config = STATUS_CONFIG[data.status] ?? {
    label: data.status,
    color: 'gray',
    icon: <IconClock size={48} />,
  };
  const formatCurrency = (value: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);

  return (
    <Container size="sm" py="xl">
      <Stack gap="lg" align="center">
        <Title order={2}>Status do pagamento PIX</Title>
        <Alert color={config.color} title={config.label} icon={config.icon} w="100%">
          <Stack gap="xs">
            <Text size="sm">Valor: {formatCurrency(data.amount)}</Text>
            <Text size="xs" c="dimmed">
              ID: {data.pixExternalId}
            </Text>
          </Stack>
        </Alert>
        {data.status === 'PAGAMENTO_CONFIRMADO' && (
          <Text size="sm" c="dimmed" ta="center">
            Seu plano PRO está ativo. Você receberá um e-mail de confirmação.
          </Text>
        )}
        <Stack gap="xs" w="100%" maw={320}>
          <Button component={Link} href="/dashboard" color="brand">
            Ir para o Dashboard
          </Button>
          <Button component={Link} href="/minha-conta" variant="outline" color="brand">
            Minha conta
          </Button>
          <Button component={Link} href="/precos" variant="subtle" color="gray">
            Voltar aos preços
          </Button>
        </Stack>
      </Stack>
    </Container>
  );
}
