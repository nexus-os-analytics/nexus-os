import type { PlanTier } from '@prisma/client';

export interface PlanEntitlements {
  productLimit: number | 'unlimited';
  sync: {
    // null means no automatic sync
    autoIntervalHours: number | null;
    manualAllowed: boolean;
    description: string;
  };
  alerts: {
    criticalEmail: boolean;
    description: string;
  };
  support: {
    channel: 'email' | 'whatsapp';
    priority: boolean;
    description: string;
  };
}

const ENTITLEMENTS: Record<PlanTier, PlanEntitlements> = {
  FREE: {
    productLimit: 30,
    sync: {
      autoIntervalHours: 24,
      manualAllowed: false,
      description: 'Sincronização somente uma vez por dia (automática)',
    },
    alerts: {
      criticalEmail: true,
      description: 'Envio de alertas críticos por e-mail durante a sincronização',
    },
    support: {
      channel: 'email',
      priority: false,
      description: 'Suporte via e-mail',
    },
  },
  PRO: {
    productLimit: 'unlimited',
    sync: {
      autoIntervalHours: 1,
      manualAllowed: true,
      description: 'Sincronização manual e automática a cada hora',
    },
    alerts: {
      criticalEmail: true,
      description: 'Envio de alertas críticos por e-mail durante a sincronização',
    },
    support: {
      channel: 'whatsapp',
      priority: true,
      description: 'Suporte prioritário via WhatsApp',
    },
  },
};

export function getPlanEntitlements(plan: PlanTier): PlanEntitlements {
  return ENTITLEMENTS[plan];
}

export function getPlanFeatureStrings(plan: PlanTier): string[] {
  const e = ENTITLEMENTS[plan];
  const productDesc =
    e.productLimit === 'unlimited' ? 'Produtos ilimitados' : `Até ${e.productLimit} produtos`;
  return [productDesc, e.sync.description, e.alerts.description, e.support.description];
}

// Backwards-compatible simple limits API used in some screens
export interface PlanLimits {
  products: number | 'unlimited';
}

export function getPlanLimits(plan: PlanTier): PlanLimits {
  const e = ENTITLEMENTS[plan];
  return { products: e.productLimit };
}
