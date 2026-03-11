/**
 * Sync Status Indicator Component
 *
 * Displays the current sync status with appropriate styling
 *
 * @module components/integrations/SyncStatusIndicator
 */

'use client';

import { Alert, Badge, Loader } from '@mantine/core';
import { IconAlertCircle, IconCheck } from '@tabler/icons-react';
import { SyncStatus, type IntegrationProvider } from '@/types/integrations';
import { getProviderDisplayName } from '@/lib/integrations/utils';

export interface SyncStatusIndicatorProps {
  /** Current sync status */
  status: SyncStatus;
  /** Integration provider */
  provider: IntegrationProvider;
}

/**
 * Displays sync status with appropriate icon and styling
 *
 * Shows loading state, completion badge, or error alert based on status
 */
export function SyncStatusIndicator({ status, provider }: SyncStatusIndicatorProps) {
  const providerName = getProviderDisplayName(provider);

  switch (status) {
    case SyncStatus.SYNCING:
      return (
        <Alert icon={<Loader size={16} />} color="blue" variant="light">
          Sincronizando produtos do {providerName}...
        </Alert>
      );

    case SyncStatus.COMPLETED:
      return (
        <Badge color="green" size="lg" leftSection={<IconCheck size={14} />}>
          Sincronizado
        </Badge>
      );

    case SyncStatus.FAILED:
      return (
        <Alert icon={<IconAlertCircle size={16} />} color="red" variant="light">
          Erro na sincronização. Tente reconectar.
        </Alert>
      );

    case SyncStatus.IDLE:
    default:
      return null;
  }
}
