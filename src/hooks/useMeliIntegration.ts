import type { MeliSyncStatus } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { useCallback, useEffect, useState } from 'react';
import { getPlanEntitlements } from '@/features/billing/entitlements';

export interface MeliIntegrationStatus {
  connected: boolean;
  valid: boolean;
  syncStatus: MeliSyncStatus | null;
  integration?: {
    connected_at: Date;
    meliUserId: string;
  };
}

export type MeliConnectionState = 'disconnected' | 'connected' | 'invalid-credentials';

export function useMeliIntegration() {
  const { data: session } = useSession();
  const [status, setStatus] = useState<MeliIntegrationStatus | null>(null);
  const [connectionState, setConnectionState] = useState<MeliConnectionState>('disconnected');
  const [loading, setLoading] = useState(true);

  const connect = async (): Promise<string> => {
    try {
      setLoading(true);
      const response = await fetch('/api/integrations/meli/connect');
      const data = await response.json();
      setLoading(false);
      return data.authUrl;
    } catch (error) {
      setLoading(false);
      console.error('Error connecting to Mercado Livre integration:', error);
      throw error;
    }
  };

  const disconnect = async (): Promise<void> => {
    try {
      setLoading(true);
      await fetch('/api/integrations/meli/disconnect', {
        method: 'POST',
      });
      setStatus({ connected: false, syncStatus: null, valid: false });
      setConnectionState('disconnected');
      setLoading(false);
    } catch (error) {
      console.error('Error disconnecting Mercado Livre integration:', error);
      setLoading(false);
    }
  };

  const refresh = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/integrations/meli/status');
      const data = await response.json();
      setStatus(data);

      if (!data.connected) {
        setConnectionState('disconnected');
      } else if (data.connected && !data.valid) {
        setConnectionState('invalid-credentials');
      } else if (data.connected && data.valid) {
        setConnectionState('connected');
      }
    } catch (error) {
      setConnectionState('disconnected');
      console.error('Error checking Mercado Livre status:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const sync = async (): Promise<void> => {
    try {
      setLoading(true);
      const resp = await fetch('/api/integrations/meli/sync', { method: 'POST' });
      if (!resp.ok) {
        const err = await resp.json().catch(() => ({ error: 'Erro ao iniciar sync' }));
        throw new Error(err.error ?? 'Erro ao iniciar sincronização');
      }
      await refresh();
    } catch (error) {
      console.error('Error triggering Mercado Livre sync:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      refresh();
    }
  }, [session, refresh]);

  return {
    status,
    connectionState,
    loading,
    manualSyncAllowed: getPlanEntitlements(session?.user?.planTier === 'PRO' ? 'PRO' : 'FREE').sync
      .manualAllowed,
    connect,
    disconnect,
    refresh,
    sync,
  };
}
