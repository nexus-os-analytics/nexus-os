import { useSession } from 'next-auth/react';
import { useEffect, useState } from 'react';

export interface BlingIntegrationStatus {
  connected: boolean;
  valid: boolean;
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

  // ...

  useEffect(() => {
    if (session?.user?.id) {
      checkStatus();
    }
  }, [session]);

  const checkStatus = async () => {
    try {
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

  const connect = async (): Promise<string> => {
    const response = await fetch('/api/integrations/bling/connect');
    const data = await response.json();
    return data.authUrl;
  };

  const disconnect = async (): Promise<void> => {
    await fetch('/api/integrations/bling/disconnect', {
      method: 'POST',
    });
    await checkStatus(); // Atualizar status
  };

  return {
    status,
    connectionState,
    loading,
    connect,
    disconnect,
    refresh: checkStatus,
  };
}
