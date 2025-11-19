import {
  Button,
  Card,
  Divider,
  Group,
  Select,
  Stack,
  Switch,
  Text,
  Textarea,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { IconDownload } from '@tabler/icons-react';
import { useState } from 'react';
import { AccountRemoveModal } from './AccountRemoveModal';

export default function PrivacyDataForm() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  async function requestDataExport() {
    // Backend: create export job, store audit log, email link or make available in user portal
    notifications.show({
      title: 'Pedido de exportação criado',
      message: 'Você receberá um link seguro por e-mail quando pronto.',
      color: 'green',
    });
    // Example: POST /api/user/export-data
  }

  return (
    <>
      <Card shadow="sm">
        <Title id="privacy-data" order={4}>
          Privacidade & Dados (LGPD / GDPR)
        </Title>
        <Divider my="sm" />
        <Stack>
          <Text size="sm">
            Solicitações de portabilidade, exclusão e retenção. Todas as ações são auditadas.
          </Text>

          <Group grow>
            <Button leftSection={<IconDownload size={16} />} onClick={() => requestDataExport()}>
              Exportar meus dados
            </Button>
            <Button color="yellow" onClick={() => setShowDeleteModal(true)}>
              Solicitar exclusão (soft-delete)
            </Button>
          </Group>

          <Divider />

          <Text w={700}>Configuração de retenção</Text>
          <Text size="sm">
            Defina por quanto tempo os dados serão mantidos após solicitação de exclusão.
          </Text>
          <Group>
            <Select
              data={[
                { value: '30', label: '30 dias' },
                { value: '90', label: '90 dias' },
                { value: '365', label: '1 ano' },
              ]}
              placeholder="Escolha"
            />
            <Button onClick={() => {}}>Salvar política</Button>
          </Group>

          <Divider />

          <Text w={700}>Consentimentos</Text>
          <Stack>
            <Group>
              <Text>Uso de dados para anúncios</Text>
              <Switch />
            </Group>
            <Group>
              <Text>Compartilhamento com parceiros</Text>
              <Switch />
            </Group>
          </Stack>

          <Divider />

          <Text w={700}>Registro de auditoria / incidentes</Text>
          <Textarea
            readOnly
            value={
              'Acesso ao histórico de auditoria e incidentes está disponível via API /admin/audit-logs'
            }
          />
        </Stack>
      </Card>

      <AccountRemoveModal opened={showDeleteModal} toggle={() => setShowDeleteModal(false)} />
    </>
  );
}
