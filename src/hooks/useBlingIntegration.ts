import type { BlingSyncStatus } from '@prisma/client';
import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export interface BlingIntegrationStatus {
  connected: boolean;
  valid: boolean;
  syncStatus: BlingSyncStatus | null;
  integration?: {
    connected_at: Date;
    scope: string;
  };
}

export type BlingConnectionState = 'disconnected' | 'connected' | 'invalid-credentials';

export function useBlingIntegration() {
  const { data: session } = useSession();
  const [status, setStatus] = useState<BlingIntegrationStatus | null>(null);
  const [connectionState, setConnectionState] = useState<BlingConnectionState>('disconnected');
  const [loading, setLoading] = useState(true);

  const connect = async (): Promise<string> => {
    try {
      setLoading(true);
      const response = await fetch('/api/integrations/bling/connect');
      const data = await response.json();
      setLoading(false);
      return data.authUrl;
    } catch (error) {
      setLoading(false);
      console.error('Error connecting to Bling integration:', error);
      throw error;
    }
  };

  const disconnect = async (): Promise<void> => {
    try {
      setLoading(true);
      await fetch('/api/integrations/bling/disconnect', {
        method: 'POST',
      });
      setStatus({ connected: false, syncStatus: null, valid: false });
      setConnectionState('disconnected');
      setLoading(false);
    } catch (error) {
      console.error('Error disconnecting Bling integration:', error);
      setLoading(false);
    }
  };

  const refresh = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/integrations/bling/status');
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
      console.error('Error checking Bling status:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (session?.user?.id) {
      refresh();
    }
  }, [session]);

  return {
    status,
    connectionState,
    loading,
    connect,
    disconnect,
    refresh,
  };
}
