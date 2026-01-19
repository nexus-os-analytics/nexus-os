'use client';
import {
  Alert,
  Badge,
  Button,
  Card,
  Code,
  Divider,
  Group,
  Loader,
  Stack,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { useBlingIntegration } from '@/hooks/useBlingIntegration';

interface MethodResult {
  status: number;
  data: unknown;
}

interface HomologationSteps {
  get?: MethodResult;
  post?: MethodResult;
  put?: MethodResult;
  patch?: MethodResult;
  delete?: MethodResult;
}

interface HomologationResult {
  success: boolean;
  steps: HomologationSteps;
}

export default function BlingIntegrationForm() {
  const HTTP_OK_MIN = 200;
  const HTTP_OK_MAX = 299;
  const [result, setResult] = useState<HomologationResult | null>(null);
  const [isRunning, setIsRunning] = useState(false);
  const { user } = useAuth();
  const { status, loading, disconnect, refresh } = useBlingIntegration();
  const router = useRouter();

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

      const json = (await res.json()) as
        | HomologationResult
        | { success?: boolean; steps?: HomologationSteps };
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
    } catch (_error) {
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

        {user?.role === 'SUPER_ADMIN' && status?.connected && (
          <>
            <Group justify="space-between" align="center">
              <Stack gap={0}>
                <Title order={5}>Teste de Homologação</Title>
                <Text size="sm" color="dimmed">
                  Execute o teste de homologação necessário para enviar o Nexus OS para a revisão do
                  Bling.
                </Text>
              </Stack>
              <Button
                onClick={handleRunHomologation}
                disabled={!status?.connected || isRunning}
                loading={isRunning}
              >
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
                </Group>

                <Table withTableBorder withColumnBorders highlightOnHover>
                  <Table.Thead>
                    <Table.Tr>
                      <Table.Th>Método</Table.Th>
                      <Table.Th>Status</Table.Th>
                      <Table.Th>Dados</Table.Th>
                    </Table.Tr>
                  </Table.Thead>
                  <Table.Tbody>
                    {(['get', 'post', 'put', 'patch', 'delete'] as const)
                      .filter((m) => (result.steps ?? {})[m] !== undefined)
                      .map((m) => {
                        const steps = result.steps ?? {};
                        const r = steps[m];
                        if (!r) return null;
                        const ok = r.status >= HTTP_OK_MIN && r.status <= HTTP_OK_MAX;
                        return (
                          <Table.Tr key={m}>
                            <Table.Td>
                              <Text size="sm" fw={500} tt="uppercase">
                                {m}
                              </Text>
                            </Table.Td>
                            <Table.Td>
                              <Badge color={ok ? 'green' : 'red'} variant="light">
                                {r.status}
                              </Badge>
                            </Table.Td>
                            <Table.Td>
                              <Code block>{JSON.stringify(r.data, null, 2)}</Code>
                            </Table.Td>
                          </Table.Tr>
                        );
                      })}
                  </Table.Tbody>
                </Table>
              </Stack>
            )}
          </>
        )}
      </Stack>
    </Card>
  );
}
