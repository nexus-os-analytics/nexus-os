'use client';
import {
  ConnectPage,
  type ConnectPageConfig,
} from '@/features/integrations/components/ConnectPage';
import { useMeliIntegration } from '@/hooks/useMeliIntegration';

const MELI_CONFIG: ConnectPageConfig = {
  color: 'yellow',
  logoSrc: '/img/meli-logo.png',
  logoAlt: 'Mercado Livre Logo',
  providerName: 'Mercado Livre',
  successParam: 'meli_connected',
  analysisLabel: 'anúncios',
  itemsLabel: 'anúncios',
  funFact: 'Lojistas perdem em média R$ 12k por ano em rupturas evitáveis.',
  valuePropCards: [
    {
      emoji: '🔴',
      title: 'Nunca mais perca vendas por falta de estoque',
      description: 'Receba alertas inteligentes antes de ficar sem produtos ativos',
    },
    {
      emoji: '💰',
      title: 'Recupere capital travado em produtos parados',
      description: 'Identifique anúncios com estoque encalhado e preço ideal de liquidação',
    },
    {
      emoji: '🚀',
      title: 'Identifique anúncios em explosão de vendas',
      description: 'Aumente estoque antes de perder oportunidade',
    },
  ],
};

export function MeliConnect({ canConnect = false }: { canConnect?: boolean }) {
  const { loading, connect } = useMeliIntegration();
  return (
    <ConnectPage
      config={MELI_CONFIG}
      canConnect={canConnect}
      loading={loading}
      onConnect={connect}
    />
  );
}
