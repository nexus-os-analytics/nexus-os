import type { BlingRuptureRisk } from '@prisma/client';

export const toneOfVoiceOptions = [
  { value: 'urgent-direct' as const, label: 'Urgente e Direto' },
  { value: 'friendly-casual' as const, label: 'Amigável e Casual' },
  { value: 'professional-technical' as const, label: 'Profissional e Técnico' },
  { value: 'enthusiastic-emotional' as const, label: 'Entusiasta e Emocional' },
];

export const campaignStrategies = [
  {
    value: 'aggressive-liquidation' as const,
    label: 'Liquidação Agressiva',
    description: 'Venda com descontos agressivos para recuperar capital de giro rapidamente',
    pricingSuggestion: 'Desconto de 30-40%',
  },
  {
    value: 'strategic-combo' as const,
    label: 'Combo Estratégico',
    description:
      'Aumentar ticket médio oferecendo o produto como brinde ou desconto na compra de um campeão',
    pricingSuggestion: 'Produto encalhado + Campeão de vendas',
  },
  {
    value: 'checkout-upsell' as const,
    label: 'Upsell na Finalização',
    description: 'Oferecer com desconto menor no checkout para clientes que já estão comprando',
    pricingSuggestion: 'Desconto de 15-25%',
  },
];

export const ruptureRiskLabel: Record<BlingRuptureRisk, string> = {
  CRITICAL: 'Crítico',
  HIGH: 'Alto',
  MEDIUM: 'Médio',
  LOW: 'Baixo',
};
