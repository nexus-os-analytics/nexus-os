import type { PlanTier } from '@prisma/client';

export type FeatureKey = 'bling_advanced' | 'alerts_advanced' | 'reports' | 'priority_support';

export interface FeatureDescriptor {
  key: FeatureKey;
  label: string;
  description?: string;
}

export interface PlanLimits {
  products: number | 'unlimited';
  alerts: number | 'unlimited';
  integrations: number | 'unlimited';
}

export const FEATURE_DEFINITIONS: FeatureDescriptor[] = [
  {
    key: 'bling_advanced',
    label: 'Integração avançada com Bling',
    description: 'Sincronização completa e recursos premium de integração.',
  },
  {
    key: 'alerts_advanced',
    label: 'Alertas avançados',
    description: 'Alertas por e-mail e regras inteligentes.',
  },
  {
    key: 'reports',
    label: 'Relatórios personalizados',
    description: 'Exportação e relatórios sob demanda.',
  },
  {
    key: 'priority_support',
    label: 'Suporte prioritário',
    description: 'Atendimento prioritário por e-mail.',
  },
];

const PLAN_FEATURES: Record<PlanTier, Record<FeatureKey, boolean>> = {
  FREE: {
    bling_advanced: false,
    alerts_advanced: false,
    reports: false,
    priority_support: false,
  },
  PRO: {
    bling_advanced: true,
    alerts_advanced: true,
    reports: true,
    priority_support: true,
  },
};

const PLAN_LIMITS: Record<PlanTier, PlanLimits> = {
  FREE: { products: 30, alerts: 10, integrations: 1 },
  PRO: { products: 'unlimited', alerts: 'unlimited', integrations: 'unlimited' },
};

export function isFeatureAvailable(plan: PlanTier, feature: FeatureKey): boolean {
  return PLAN_FEATURES[plan][feature];
}

export function getPlanFeatures(plan: PlanTier): Array<FeatureDescriptor & { available: boolean }> {
  return FEATURE_DEFINITIONS.map((f) => ({ ...f, available: PLAN_FEATURES[plan][f.key] }));
}

export function getPlanLimits(plan: PlanTier): PlanLimits {
  return PLAN_LIMITS[plan];
}

export const FEATURE_LIST_ORDER: FeatureKey[] = FEATURE_DEFINITIONS.map((f) => f.key);
