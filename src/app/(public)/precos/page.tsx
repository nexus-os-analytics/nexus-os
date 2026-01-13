import type { Metadata } from 'next';
import { APP_NAME } from '@/lib/constants';

export const metadata: Metadata = {
  title: 'Preços',
  description:
    'Planos e preços do Nexus OS: escolha a melhor opção para otimizar estoque e reduzir custos.',
  openGraph: {
    title: `${APP_NAME} — Preços`,
    description:
      'Planos e preços do Nexus OS: escolha a melhor opção para otimizar estoque e reduzir custos.',
    url: '/precos',
  },
  alternates: { canonical: '/precos' },
};

import { Pricing } from '@/components/pages/Pricing';

export default function PricingPage() {
  return <Pricing />;
}
