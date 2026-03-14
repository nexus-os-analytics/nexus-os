/**
 * Integration Overview Component
 *
 * Main component for displaying integration status and metrics
 * Handles all sync states and notifications
 *
 * @module components/integrations/IntegrationOverview
 */

'use client';

import { useEffect, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { Alert, Button, Container, Loader, Stack, Text, Title } from '@mantine/core';
import { IconAlertCircle, IconCheck, IconPlugConnected } from '@tabler/icons-react';
import { IntegrationProvider, type IntegrationMetrics, SyncStatus } from '@/types/integrations';
import { getProviderDisplayName } from '@/lib/integrations/utils';
import { MetricsDashboard } from './MetricsDashboard';
import { SyncStatusIndicator } from './SyncStatusIndicator';

export interface IntegrationOverviewProps {
  /** Integration provider */
  provider: IntegrationProvider;
  /** Whether user can connect (e.g., email verified) */
  canConnect: boolean;
  /** Initial metrics data from server */
  initialMetrics?: IntegrationMetrics | null;
  /** Initial sync status from server */
  initialSyncStatus?: SyncStatus | string;
  /** Callback when user clicks connect */
  onConnect?: () => void;
  /** Callback when user clicks disconnect */
  onDisconnect?: () => void;
}

/**
 * Generic integration overview component
 *
 * Displays appropriate UI based on sync status:
 * - IDLE: Connect button
 * - SYNCING: Loading state
 * - COMPLETED: Metrics dashboard
 * - FAILED: Error state
 */
export function IntegrationOverview({
  provider,
  canConnect,
  initialMetrics = null,
  initialSyncStatus = SyncStatus.IDLE,
  onConnect,
  onDisconnect,
}: IntegrationOverviewProps) {
  const searchParams = useSearchParams();
  const [metrics] = useState(initialMetrics);
  const [syncStatus] = useState<SyncStatus>(initialSyncStatus as SyncStatus);

  const providerName = getProviderDisplayName(provider);

  // Check for success/error query params
  const successParam = searchParams?.get('success');
  const errorParam = searchParams?.get('error');

  // Auto-refresh page when syncing (optional - can implement polling)
  useEffect(() => {
    if (syncStatus === SyncStatus.SYNCING) {
      // Could implement polling or websocket here
      // For now, user can manually refresh
    }
  }, [syncStatus]);

  return (
    <Container size="lg" py="xl">
      <Stack gap="xl">
        {/* Header */}
        <div>
          <Title order={1}>Integração com {providerName}</Title>
          <Text c="dimmed">
            Conecte sua conta do {providerName} para sincronizar produtos e estoque
          </Text>
        </div>

        {/* Success Notification */}
        {successParam && (
          <Alert
            icon={<IconCheck size={16} />}
            title="Conexão estabelecida!"
            color="green"
            variant="light"
            withCloseButton
          >
            Sua conta do {providerName} foi conectada com sucesso. A sincronização inicial está em
            andamento.
          </Alert>
        )}

        {/* Error Notification */}
        {errorParam && (
          <Alert
            icon={<IconAlertCircle size={16} />}
            title="Erro na conexão"
            color="red"
            variant="light"
            withCloseButton
          >
            {errorParam === 'auth_failed' && 'Falha na autenticação. Tente novamente.'}
            {errorParam === 'invalid_callback' && 'Resposta inválida do servidor.'}
            {errorParam === 'unauthorized' && 'Você precisa estar autenticado.'}
            {errorParam === 'connection_failed' && 'Erro ao conectar. Tente novamente mais tarde.'}
            {errorParam === 'token_exchange_failed' && 'Erro ao trocar token de acesso.'}
            {errorParam === 'config_missing' && 'Configuração do servidor incompleta.'}
          </Alert>
        )}

        {/* Sync Status Indicator */}
        <SyncStatusIndicator status={syncStatus} provider={provider} />

        {/* Main Content based on Status */}
        {syncStatus === SyncStatus.IDLE && (
          <Stack gap="md" align="center" py="xl">
            <IconPlugConnected size={48} stroke={1.5} />
            <Text size="lg" ta="center">
              Você ainda não conectou sua conta do {providerName}
            </Text>
            {canConnect ? (
              <Button size="lg" onClick={onConnect}>
                Conectar {providerName}
              </Button>
            ) : (
              <Alert color="yellow" variant="light">
                Você precisa verificar seu email antes de conectar integrações
              </Alert>
            )}
          </Stack>
        )}

        {syncStatus === SyncStatus.SYNCING && (
          <Stack gap="md" align="center" py="xl">
            <Loader size="xl" />
            <Text size="lg" ta="center">
              Sincronizando seus produtos...
            </Text>
            <Text size="sm" c="dimmed" ta="center">
              Isso pode levar alguns minutos. Você pode fechar esta página e voltar depois.
            </Text>
          </Stack>
        )}

        {syncStatus === SyncStatus.COMPLETED && metrics && (
          <MetricsDashboard metrics={metrics} provider={provider} />
        )}

        {syncStatus === SyncStatus.FAILED && (
          <Stack gap="md" align="center" py="xl">
            <Text size="lg" ta="center" c="red">
              Ocorreu um erro durante a sincronização
            </Text>
            <Button onClick={onConnect} variant="outline">
              Tentar Novamente
            </Button>
          </Stack>
        )}

        {/* Disconnect Button (if connected) */}
        {syncStatus !== SyncStatus.IDLE && onDisconnect && (
          <Button variant="subtle" color="red" onClick={onDisconnect}>
            Desconectar {providerName}
          </Button>
        )}
      </Stack>
    </Container>
  );
}
