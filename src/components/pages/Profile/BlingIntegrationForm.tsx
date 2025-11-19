'use client';
import { Alert, Button, Card, Divider, Group, Stack, Text, Title } from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { useRouter } from 'next/navigation';
import { useBlingIntegration } from '@/hooks/useBlingIntegration';

export default function BlingIntegrationForm() {
  const { status, loading, disconnect } = useBlingIntegration();
  const router = useRouter();

  const handleDisconnect = async () => {
    await disconnect();
    notifications.show({
      title: 'Desconectado',
      message: 'A integração com o Bling foi desconectada com sucesso.',
      color: 'green',
    });
  };

  const handleConnect = () => {
    router.push('/bling');
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
      </Stack>
    </Card>
  );
}
