'use client';

import { useCallback, useEffect } from 'react';
import { useStripeCheckout } from '@/features/billing/services';
import {
  ConnectPage,
  type ConnectPageConfig,
} from '@/features/integrations/components/ConnectPage';
import { useQueryString } from '@/hooks';
import { useBlingIntegration } from '@/hooks/useBlingIntegration';

const BLING_CONFIG: ConnectPageConfig = {
  color: 'green.9',
  logoSrc: '/img/bling-logo.png',
  logoAlt: 'Bling Logo',
  providerName: 'Bling',
  successParam: 'bling_connected',
  analysisLabel: 'produtos',
  itemsLabel: 'produtos',
  funFact: 'Lojistas perdem em média R$ 12k por ano em rupturas evitáveis.',
  valuePropCards: [
    {
      emoji: '🔴',
      title: 'Nunca mais perca vendas por estoque zerado',
      description: 'Receba alertas inteligentes de ruptura antes que aconteçam',
    },
    {
      emoji: '💰',
      title: 'Recupere até R$ 15k em capital parado',
      description: 'Veja quanto está travado + preço ideal de liquidação',
    },
    {
      emoji: '🚀',
      title: 'Identifique produtos em explosão de vendas',
      description: 'Aumente estoque antes de perder oportunidade',
    },
  ],
};

export function BlingConnect({ canConnect = false }: { canConnect?: boolean }) {
  const { loading, connect } = useBlingIntegration();
  const { getQueryParam } = useQueryString();
  const planParam = (getQueryParam('plan') || '').toUpperCase();
  const { mutateAsync: stripeCheckout } = useStripeCheckout();

  const handleStripeCheckout = useCallback(async () => {
    try {
      const { url } = await stripeCheckout();
      if (url) window.location.href = url;
    } catch (error) {
      console.error('Erro ao iniciar o checkout do Stripe:', error);
    }
  }, [stripeCheckout]);

  useEffect(() => {
    if (planParam === 'PRO') {
      handleStripeCheckout();
    }
  }, [planParam, handleStripeCheckout]);

  return (
    <ConnectPage
      config={BLING_CONFIG}
      canConnect={canConnect}
      loading={loading}
      onConnect={connect}
    />
  );
}
