import { Button, Group, Modal, Text } from '@mantine/core';

export function AccountRemoveModal({ opened, toggle }: { opened: boolean; toggle: () => void }) {
  async function scheduleAccountDeletion() {
    // Backend: set deletedAt = now(), retentionUntil = now + retentionDays
    // Soft-delete: maintain data for retention policy, make anonymization job queued
    toggle();
    // call DELETE /api/user?soft=true&retentionDays=30
  }

  return (
    <Modal opened={opened} onClose={toggle} title="Confirmar exclusão">
      <Text>
        Ao solicitar exclusão sua conta será marcada para remoção. Durante o período de retenção
        você pode reativar a conta. Após retenção os dados serão anonimizados ou removidos conforme
        política.
      </Text>
      <Group mt="md">
        <Button variant="default" onClick={toggle}>
          Cancelar
        </Button>
        <Button color="red" onClick={scheduleAccountDeletion}>
          Excluir minha conta (30 dias)
        </Button>
      </Group>
    </Modal>
  );
}
