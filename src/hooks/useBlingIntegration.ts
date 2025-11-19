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

export function useBlingIntegration() {
  const { data: session } = useSession();
  const [status, setStatus] = useState<BlingIntegrationStatus | null>(null);
  const [loading, setLoading] = useState(true);

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
    } catch (error) {
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
    loading,
    connect,
    disconnect,
    refresh: checkStatus,
  };
}
