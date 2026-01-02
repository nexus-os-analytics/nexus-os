'use client';
import { Alert, Badge, Button, Card, Divider, Group, Loader, Stack, Table, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { useBlingIntegration } from '@/hooks/useBlingIntegration';
import { useState } from 'react';

interface HomologationStep {
  step: string;
  method: string;
  url?: string;
  path?: string;
  status: number;
  ok: boolean;
  durationMs: number;
  error?: unknown;
  body?: unknown;
}

interface HomologationResult {
  success: boolean;
  startedAt?: string;
  finishedAt?: string;
  steps: HomologationStep[];
}

export default function BlingIntegrationForm() {
  const { status, loading, disconnect, refresh } = useBlingIntegration();
  const router = useRouter();
  const [isRunning, setIsRunning] = useState(false);
  const [result, setResult] = useState<HomologationResult | null>(null);

  const handleDisconnect = async () => {
    await disconnect();
    await refresh();
    notifications.show({
      title: 'Desconectado',
      message: 'A integração com o Bling foi desconectada com sucesso.',
      color: 'green',
    });
  };

  const handleConnect = () => {
    router.push('/bling');
  };

  const handleRunHomologation = async () => {
    try {
      setIsRunning(true);
      setResult(null);
      const res = await fetch('/api/integrations/bling/homologation', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'same-origin',
      });

      const json = (await res.json()) as HomologationResult | { success?: boolean; steps?: HomologationStep[] };
      if (!res.ok || !('success' in json) || json.success !== true) {
        notifications.show({
          title: 'Homologação falhou',
          message: 'Não foi possível concluir o teste de homologação.',
          color: 'red',
        });
      } else {
        notifications.show({
          title: 'Homologação concluída',
          message: 'Teste de homologação executado com sucesso.',
          color: 'green',
        });
      }
      setResult(json as HomologationResult);
    } catch (error) {
      notifications.show({
        title: 'Erro ao executar homologação',
        message: 'Verifique sua sessão e tente novamente.',
        color: 'red',
      });
    } finally {
      setIsRunning(false);
    }
  };

  return (
    <Card withBorder>
      <Title id="api-keys" order={4}>
        Integração Bling
      </Title>
      <Divider my="sm" />
      <Stack>
        <Group>
          <Text>Gerencie o status da integração com o Bling.</Text>
        </Group>

        <Alert color={status?.connected ? 'green' : 'yellow'} variant="light">
          {status?.connected ? (
            <Text>A integração com o Bling está conectada.</Text>
          ) : (
            <Text>A integração com o Bling não está conectada.</Text>
          )}
        </Alert>

        {status?.connected ? (
          <Button color="red" onClick={handleDisconnect} loading={loading}>
            Desconectar Bling
          </Button>
        ) : (
          <Button color="green" onClick={handleConnect} loading={loading}>
            Conectar Bling
          </Button>
        )}

        <Divider my="md" />
        <Group justify="space-between" align="center">
          <Title order={5}>Teste de Homologação</Title>
          <Button onClick={handleRunHomologation} disabled={!status?.connected || isRunning} loading={isRunning}>
            Executar homologação
          </Button>
        </Group>

        {isRunning && (
          <Alert color="blue" variant="light">
            <Group gap="xs" align="center">
              <Loader size="sm" />
              <Text>Executando homologação...</Text>
            </Group>
          </Alert>
        )}

        {result && (
          <Stack gap="sm">
            <Group>
              <Badge color={result.success ? 'green' : 'red'} variant="filled">
                {result.success ? 'Sucesso' : 'Falha'}
              </Badge>
              {result.startedAt && <Text size="xs">Início: {new Date(result.startedAt).toLocaleString()}</Text>}
              {result.finishedAt && <Text size="xs">Fim: {new Date(result.finishedAt).toLocaleString()}</Text>}
            </Group>

            <Table withTableBorder withColumnBorders highlightOnHover>
              <Table.Thead>
                <Table.Tr>
                  <Table.Th>Etapa</Table.Th>
                  <Table.Th>Método</Table.Th>
                  <Table.Th>Status</Table.Th>
                  <Table.Th>Duração (ms)</Table.Th>
                </Table.Tr>
              </Table.Thead>
              <Table.Tbody>
                {result.steps?.map((s, idx) => (
                  <Table.Tr key={`${s.step}-${idx}`}>
                    <Table.Td>
                      <Stack gap={2}>
                        <Text size="sm" fw={500}>{s.step}</Text>
                        {(s.path || s.url) && (
                          <Text size="xs" c="dimmed">{s.path ?? s.url}</Text>
                        )}
                      </Stack>
                    </Table.Td>
                    <Table.Td>{s.method}</Table.Td>
                    <Table.Td>
                      <Badge color={s.ok ? 'green' : 'red'} variant="light">{s.status}</Badge>
                    </Table.Td>
                    <Table.Td>{s.durationMs}</Table.Td>
                  </Table.Tr>
                ))}
              </Table.Tbody>
            </Table>
          </Stack>
        )}
      </Stack>
    </Card>
  );
}
