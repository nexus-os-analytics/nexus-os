'use client';
import {
  ConnectPage,
  type ConnectPageConfig,
} from '@/features/integrations/components/ConnectPage';

const OLIST_CONFIG: ConnectPageConfig = {
  color: 'blue',
  logoSrc: '/img/olist-logo.png',
  logoAlt: 'Olist Logo',
  providerName: 'Olist',
  successParam: 'olist_connected',
  analysisLabel: 'produtos',
  itemsLabel: 'produtos',
  funFact: 'Lojistas que monitoram estoque em tempo real vendem até 30% mais no Olist.',
  valuePropCards: [
    {
      emoji: '🔴',
      title: 'Evite pausas involuntárias nos seus anúncios',
      description: 'Receba alertas antes que o estoque zerado pause seus produtos no Olist',
    },
    {
      emoji: '💰',
      title: 'Descubra quanto capital está travado',
      description: 'Identifique produtos encalhados e o preço ideal para girar o estoque',
    },
    {
      emoji: '🚀',
      title: 'Capitalize nos seus produtos mais vendidos',
      description: 'Reabasteça a tempo e aproveite os picos de demanda sem perder vendas',
    },
  ],
};

export function OlistConnect({ canConnect = false }: { canConnect?: boolean }) {
  return (
    <ConnectPage
      config={OLIST_CONFIG}
      canConnect={canConnect}
      loading={false}
      onConnect={async () => {
        throw new Error('Integração Olist em breve. Fique atento às novidades!');
      }}
    />
  );
}
