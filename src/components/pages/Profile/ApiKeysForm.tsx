import { Button, Card, CopyButton, Divider, Group, Stack, Table, Text, Title } from '@mantine/core';
import { IconCopy, IconKey } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { API_KEY_EXPIRES_THRESHOLD } from '@/lib/constants';

type ApiKey = {
  id: string;
  key: string;
  scopes: string[];
  expiresAt: string;
  revoked: boolean;
};

export default function ApiKeysForm() {
  const [apiKeys, setApiKeys] = useState<ApiKey[]>([]);

  async function revokeApiKey(id: string) {
    setApiKeys((prev) => prev.map((k) => (k.id === id ? { ...k, revoked: true } : k)));
    // POST /api/api-keys/:id/revoke
  }

  async function createApiKey() {
    // scopes: string[], ttlDays = 30
    // POST /api/api-keys create
    // show secret once. copy to clipboard. store hashed key in db.
  }

  useEffect(() => {
    // Fetch API keys from /api/api-keys
    setApiKeys([
      {
        id: '1',
        key: 'abcd1234efgh5678ijkl9012mnop3456',
        scopes: ['read:user'],
        expiresAt: new Date(Date.now() + API_KEY_EXPIRES_THRESHOLD).toISOString(),
        revoked: false,
      },
    ]);
  }, []);

  return (
    <Card shadow="sm">
      <Title id="api-keys" order={4}>
        Chaves de API
      </Title>
      <Divider my="sm" />
      <Stack>
        <Group>
          <Text>Gerencie chaves de API. A chave será mostrada apenas uma vez.</Text>
          <Button
            leftSection={<IconKey size={16} />}
            // onClick={() => createApiKey(['read:user'], 30)}
            onClick={createApiKey}
          >
            Gerar chave
          </Button>
        </Group>

        <Table>
          <thead>
            <tr>
              <th>Key</th>
              <th>Scopes</th>
              <th>Expira</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {apiKeys.map((k) => (
              <tr key={k.id}>
                <td>
                  <Group>
                    <Text size="sm" truncate style={{ maxWidth: 200 }}>
                      {k.key}
                    </Text>
                    <CopyButton value={k.key} timeout={2000}>
                      {({ copied, copy }) => (
                        <Button
                          variant={copied ? 'filled' : 'outline'}
                          size="xs"
                          onClick={copy}
                          leftSection={<IconCopy size={14} />}
                        >
                          {copied ? 'Copiado' : 'Copiar'}
                        </Button>
                      )}
                    </CopyButton>
                  </Group>
                </td>
                <td>{k.scopes.join(', ')}</td>
                <td>{new Date(k.expiresAt).toLocaleDateString()}</td>
                <td>
                  <Button size="xs" color="red" onClick={() => revokeApiKey(k.id)}>
                    Revogar
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Stack>
    </Card>
  );
}
