import type { BlingRuptureRisk } from '@prisma/client';

export const ruptureRiskLabel: Record<BlingRuptureRisk, string> = {
  CRITICAL: 'Crítico',
  HIGH: 'Alto',
  MEDIUM: 'Médio',
  LOW: 'Baixo',
};
