import {
  Badge,
  Button,
  Card,
  Divider,
  Group,
  Modal,
  PasswordInput,
  Stack,
  Switch,
  Table,
  Text,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';

type LoginActivity = {
  id: string;
  successful: boolean;
  ip: string;
  device?: string;
  geo?: string;
  createdAt: string;
};

export default function SecurityForm() {
  const [loginActivities, setLoginActivities] = useState<LoginActivity[]>([]);
  const [twoFactorModalOpen, setTwoFactorModalOpen] = useState(false);
  const { user } = useAuth();
  const passwordForm = useForm({
    initialValues: { currentPassword: '', newPassword: '', confirmPassword: '' },
    validate: {
      confirmPassword: (v, values) => (v !== values.newPassword ? 'Senhas não batem' : null),
    },
  });

  async function handlePasswordChange() {
    // values: any
    // Call POST /api/user/change-password with currentPassword/newPassword
    // console.log('change pwd', values);
  }

  async function toggleTwoFactor() {
    // enabled: boolean
    // console.log('toggle 2fa', enabled);
    // Backend: generate TOTP secret, show QR only on enable
  }

  async function signOutAllSessions() {
    // POST /api/sessions/revoke-all
    // console.log('sign out all sessions');
  }

  useEffect(() => {
    setLoginActivities([
      {
        id: '1',
        successful: true,
        ip: '192.168.0.1',
        device: 'Chrome',
        geo: 'Brazil',
        createdAt: new Date().toISOString(),
      },
    ]);
  }, []);

  return (
    <>
      <Card withBorder>
        <Title id="security" order={4}>
          Segurança
        </Title>
        <Divider my="sm" />
        <Stack gap="lg">
          <form onSubmit={passwordForm.onSubmit(handlePasswordChange)}>
            <PasswordInput label="Senha atual" {...passwordForm.getInputProps('currentPassword')} />
            <PasswordInput label="Nova senha" {...passwordForm.getInputProps('newPassword')} />
            <PasswordInput
              label="Confirmar nova senha"
              {...passwordForm.getInputProps('confirmPassword')}
            />
            <Group mt="sm">
              <Button type="submit">Alterar senha</Button>
            </Group>
          </form>

          <Group>
            <Text>Autenticação em 2 fatores (TOTP)</Text>
            <Switch
              // TODO: Trazer do endpoint de detalhes do usuário
              checked={user?.required2FA || false}
              // onChange={(e) => toggleTwoFactor(e.currentTarget.checked)}
              onChange={toggleTwoFactor}
            />
          </Group>

          <Group justify="space-between">
            <Text>Atividades de login</Text>
            <Button variant="outline" color="red.7" onClick={() => signOutAllSessions()}>
              Encerrar todas as sessões
            </Button>
          </Group>

          <Table highlightOnHover>
            <Table.Thead>
              <Table.Tr>
                <Table.Th>Horário</Table.Th>
                <Table.Th>IP</Table.Th>
                <Table.Th>Dispositivo</Table.Th>
                <Table.Th>Sucesso</Table.Th>
              </Table.Tr>
            </Table.Thead>
            <Table.Tbody>
              {loginActivities.map((a) => (
                <Table.Tr key={a.id}>
                  <Table.Td>{new Date(a.createdAt).toLocaleString()}</Table.Td>
                  <Table.Td>{a.ip}</Table.Td>
                  <Table.Td>{a.device}</Table.Td>
                  <Table.Td>
                    {a.successful ? (
                      <Badge color="green">OK</Badge>
                    ) : (
                      <Badge color="red">Falha</Badge>
                    )}
                  </Table.Td>
                </Table.Tr>
              ))}
            </Table.Tbody>
            {/* <thead>
              <tr>
                <th>Horário</th>
                <th>IP</th>
                <th>Dispositivo</th>
                <th>Sucesso</th>
              </tr>
            </thead>
            <tbody>
              {loginActivities.map((a) => (
                <tr key={a.id}>
                  <td>{new Date(a.createdAt).toLocaleString()}</td>
                  <td>{a.ip}</td>
                  <td>{a.device}</td>
                  <td>
                    {a.successful ? (
                      <Badge color="green">OK</Badge>
                    ) : (
                      <Badge color="red">Falha</Badge>
                    )}
                  </td>
                </tr>
              ))}
            </tbody> */}
          </Table>
        </Stack>
      </Card>

      <Modal
        opened={twoFactorModalOpen}
        onClose={() => setTwoFactorModalOpen(false)}
        title="Configurar 2FA"
      >
        <Text>
          Ao habilitar 2FA você receberá um QR code e códigos de recuperação. Armazene-os em local
          seguro.
        </Text>
        {/* Show QR code + copy recovery codes here after backend generates secret */}
      </Modal>
    </>
  );
}
