import { useSession } from 'next-auth/react';
import { useBlingIntegration } from './useBlingIntegration';
import { useMeliIntegration } from './useMeliIntegration';
import { useShopeeIntegration } from './useShopeeIntegration';

/**
 * Generic integration hook that automatically detects and returns the active provider.
 * Use this in components that need to be provider-agnostic.
 */
export function useActiveIntegration() {
  const { data: session } = useSession();
  const activeProvider = (session?.user as any)?.activeIntegrationProvider;

  const blingIntegration = useBlingIntegration();
  const meliIntegration = useMeliIntegration();
  const shopeeIntegration = useShopeeIntegration();

  if (activeProvider === 'MERCADO_LIVRE') {
    return {
      ...meliIntegration,
      provider: 'MERCADO_LIVRE' as const,
    };
  }

  if (activeProvider === 'SHOPEE') {
    return {
      ...shopeeIntegration,
      provider: 'SHOPEE' as const,
    };
  }

  // Default to Bling for backward compatibility
  return {
    ...blingIntegration,
    provider: 'BLING' as const,
  };
}
