'use client';
import {
  ConnectPage,
  type ConnectPageConfig,
} from '@/features/integrations/components/ConnectPage';
import { useShopeeIntegration } from '@/hooks/useShopeeIntegration';

const SHOPEE_CONFIG: ConnectPageConfig = {
  color: 'orange',
  logoSrc: '/assets/shopee-logo.png',
  logoAlt: 'Shopee Logo',
  logoWidth: 120,
  logoHeight: 40,
  providerName: 'Shopee',
  successParam: 'shopee_connected',
  analysisLabel: 'produtos',
  itemsLabel: 'produtos',
  funFact: 'Vendedores Shopee perdem até 20% das vendas por falta de reposição de estoque.',
  valuePropCards: [
    {
      emoji: '🔴',
      title: 'Nunca mais perca vendas por estoque esgotado',
      description: 'Receba alertas antes que seus produtos fiquem sem estoque na loja',
    },
    {
      emoji: '💰',
      title: 'Identifique produtos parados e libere capital',
      description: 'Descubra itens encalhados e encontre o preço ideal de liquidação',
    },
    {
      emoji: '🚀',
      title: 'Capitalize em produtos com alta demanda',
      description: 'Aumente estoque dos itens em explosão de vendas antes de perder a janela',
    },
  ],
};

export function ShopeeConnect({ canConnect = false }: { canConnect?: boolean }) {
  const { loading, connect } = useShopeeIntegration();
  return (
    <ConnectPage
      config={SHOPEE_CONFIG}
      canConnect={canConnect}
      loading={loading}
      onConnect={connect}
    />
  );
}
