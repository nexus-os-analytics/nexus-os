import { useQuery } from '@tanstack/react-query';
import { IntegrationProvider, SyncStatus } from '@/types/integrations';

interface SyncStatusResponse {
  syncStatus: SyncStatus;
}

interface UseSyncStatusPollingParams {
  provider: IntegrationProvider;
  enabled: boolean;
}

export interface UseSyncStatusPollingResult {
  syncStatus: SyncStatus | undefined;
  isPolling: boolean;
  isSyncing: boolean;
  isCompleted: boolean;
  isFailed: boolean;
}

export function useSyncStatusPolling({
  provider,
  enabled,
}: UseSyncStatusPollingParams): UseSyncStatusPollingResult {
  const query = useQuery<SyncStatusResponse>({
    queryKey: ['sync-status', provider],
    queryFn: async () => {
      const res = await fetch(`/api/integrations/sync-status?provider=${provider}`);
      return res.json() as Promise<SyncStatusResponse>;
    },
    staleTime: 0,
    enabled,
    refetchInterval: (q) => (q.state.data?.syncStatus === SyncStatus.SYNCING ? 3000 : false),
  });

  const syncStatus = query.data?.syncStatus;

  return {
    syncStatus,
    isPolling: query.isFetching,
    isSyncing: syncStatus === SyncStatus.SYNCING,
    isCompleted: syncStatus === SyncStatus.COMPLETED,
    isFailed: syncStatus === SyncStatus.FAILED,
  };
}
