import type { BlingProductAlertType, BlingProductType } from '@/lib/bling/bling-types';

interface RecommendationAction {
  primary: boolean;
  label: string;
  details: string[];
}

export interface RecommendationText {
  title: string;
  subtitle?: string;
  description?: string;
  actions: RecommendationAction[];
  warning?: string;
}

function formatCurrencyBR(value: number): string {
  return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
}

function formatPercentInt(value: number): string {
  return `${Math.round(value)}%`;
}

export function getRecommendationText(
  alert: BlingProductAlertType,
  product?: BlingProductType
): RecommendationText | null {
  const salePrice = alert.suggestedPrice ?? alert.product?.salePrice ?? product?.salePrice ?? 0;
  const currentSalePrice = alert.product?.salePrice ?? product?.salePrice ?? 0;
  const discountPct = alert.discount ?? 0;
  const recoverableStr = formatCurrencyBR(alert.recoverableAmount ?? 0);

  switch (alert.type) {
    case 'DEAD_STOCK': {
      const currentStock = product?.currentStock ?? alert.product?.currentStock ?? 0;
      const capitalStr = formatCurrencyBR(alert.capitalStuck ?? 0);

      return {
        title: '🟧 CAPITAL PARADO',
        subtitle: `${capitalStr}`,
        description: 'Produto nunca vendeu em 30 dias',
        actions: [
          {
            primary: true,
            label: 'Liquidar com Desconto',
            details: [
              `Liquidar ${currentStock} unidades`,
              `Preço: ${formatCurrencyBR(currentSalePrice)} → ${formatCurrencyBR(salePrice)}`,
              `Desconto: ${Math.round(discountPct)}%`,
              `Recuperar: ${recoverableStr}`,
            ],
          },
          {
            primary: false,
            label: 'Devolver ao Fornecedor',
            details: ['Negociar devolução', `Recuperar ${capitalStr}`],
          },
        ],
        warning: '⚠️ NÃO REPOR este produto!',
      };
    }

    case 'LIQUIDATION': {
      const excessUnits = alert.excessUnits ?? 0;
      const excessCapitalStr = formatCurrencyBR(alert.excessCapital ?? 0);
      const excessPctStr = formatPercentInt(alert.excessPercentage ?? 0);

      return {
        title: '🟦 EXCESSO DE ESTOQUE',
        subtitle: `${excessPctStr} acima do ideal`,
        description: `Capital em excesso: ${excessCapitalStr}`,
        actions: [
          {
            primary: true,
            label: 'Liquidar com Desconto',
            details: [
              `Liquidar ${excessUnits} unidades`,
              `Preço: ${formatCurrencyBR(currentSalePrice)} → ${formatCurrencyBR(salePrice)}`,
              `Desconto: ${Math.round(discountPct)}%`,
              'Campanha: 15 dias',
              `Recuperar: ${recoverableStr}`,
            ],
          },
        ],
        warning: '⚠️ NÃO REPOR até normalizar estoque',
      };
    }

    case 'FINE': {
      const reorderPoint = alert.reorderPoint ?? 0;
      return {
        title: '🟨 ESTOQUE SAUDÁVEL',
        subtitle: 'Produto com bom giro',
        description: 'Estoque no nível adequado',
        actions: [
          {
            primary: false,
            label: 'Monitorar',
            details: [
              'Produto estável',
              'Monitorar próximos 7 dias',
              `Repor quando atingir ${Math.round(reorderPoint / 2)} unidades`,
            ],
          },
        ],
      };
    }

    default:
      return null;
  }
}
