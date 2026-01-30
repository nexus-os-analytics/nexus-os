/**
 * Módulo de métricas para cálculo de indicadores de gestão de estoque
 * Todas as funções são puras, stateless e thread-safe
 */

// Bundle constants to reduce magic numbers and centralize defaults
const CONSTANTS = {
  DAYS_IN_30: 30,
  DAYS_IN_7: 7,
  MS_PER_DAY: 1000 * 60 * 60 * 24,
  PERCENT: 100,
  DEFAULTS: {
    CRIT_DAYS: 7,
    HIGH_DAYS: 15,
    MEDIUM_DAYS: 30,
    LEAD_TIME: 15,
    SAFETY: 5,
    GROWTH_THRESHOLD: 0.5,
    DEAD_CAPITAL: 5000,
    LIQUIDATION_EXCESS: 2000,
    CAPITAL_OPTIMIZATION: 10000,
    LIQUIDATION_DISCOUNT: 0.3,
    OPPORTUNITY_SECONDARY_GROWTH: 20,
  },
} as const;

import type { BlingAlertType, BlingRuptureRisk } from '@prisma/client';
import type {
  BlingProductData,
  BlingProductSettingsType,
  BlingSalesHistoryType,
} from './bling-types';

/**
 * Calcula a Velocidade de Venda Diária (VVD) real
 * Considera apenas os dias em que houve efetivamente venda
 *
 * @param totalSales - Total de unidades vendidas no período
 * @param daysWithSales - Quantidade de dias em que ocorreram vendas
 * @returns VVD real (unidades por dia)
 *
 * @example
 * // Para 28 vendas em 11 dias com venda
 * calculateRealVVD(28, 11) // retorna 2.545...
 */
// Base metric helpers
export const calc = {
  vvdReal: (totalSales: number, daysWithSales: number) =>
    daysWithSales > 0 ? totalSales / daysWithSales : 0,
  vvdPeriod: (totalSales: number, periodDays: number, effectiveDays?: number) =>
    totalSales / (effectiveDays && effectiveDays > 0 ? effectiveDays : periodDays),
  daysRemaining: (stock: number, vvd: number) => (vvd > 0 ? stock / vvd : stock > 0 ? Infinity : 0),
  reorderPoint: (vvd: number, lead: number = 5, safety: number = 15) => vvd * (lead + safety),
  growth: (vvd7: number, vvd30: number) =>
    vvd30 === 0 ? 0 : ((vvd7 - vvd30) / vvd30) * CONSTANTS.PERCENT,
  capitalStuck: (cost: number, stock: number) => cost * stock,
  daysSince: (lastSale: Date | null, ref: Date = new Date()) =>
    !lastSale ? 0 : Math.ceil(Math.abs(ref.getTime() - lastSale.getTime()) / CONSTANTS.MS_PER_DAY),
};

export function calculateRealVVD(totalSales: number, daysWithSales: number): number {
  return calc.vvdReal(totalSales, daysWithSales);
}

/**
 * Calcula a Velocidade de Venda Diária (VVD) dos últimos 30 dias
 * Considera todos os dias do período, mesmo sem venda
 *
 * @param totalLast30DaysSales - Total de vendas dos últimos 30 dias
 * @returns VVD dos últimos 30 dias (unidades por dia)
 *
 * @example
 * // Para 28 vendas nos últimos 30 dias
 * calculate30DaysVVD(28) // retorna 0.933...
 */
export function calculate30DaysVVD(
  totalLast30DaysSales: number,
  daysWithSalesWithinLast30?: number
): number {
  return calc.vvdPeriod(totalLast30DaysSales, CONSTANTS.DAYS_IN_30, daysWithSalesWithinLast30);
}

/**
 * Calcula a Velocidade de Venda Diária (VVD) dos últimos 7 dias
 *
 * @param totalLast7DaysSales - Total de vendas dos últimos 7 dias
 * @returns VVD dos últimos 7 dias (unidades por dia)
 *
 * @example
 * // Para 15 vendas nos últimos 7 dias
 * calculate7DaysVVD(15) // retorna 2.142...
 */
export function calculate7DaysVVD(
  totalLast7DaysSales: number,
  daysWithSalesWithinLast7?: number
): number {
  return calc.vvdPeriod(totalLast7DaysSales, CONSTANTS.DAYS_IN_7, daysWithSalesWithinLast7);
}

/**
 * Calcula quantos dias o estoque atual durará
 * baseado na velocidade atual de vendas
 *
 * @param currentStock - Quantidade atual em estoque
 * @param vvdReal - VVD real (unidades por dia)
 * @returns Dias restantes até o estoque zerar
 *
 * @example
 * // Para 12 unidades em estoque e VVD de 2.5
 * calculateDaysRemaining(12, 2.5) // retorna 4.8
 */
export function calculateDaysRemaining(currentStock: number, vvdReal: number): number {
  return calc.daysRemaining(currentStock, vvdReal);
}

/**
 * Calcula o ponto de pedido (reorder point) para estoque
 * Considera lead time de 5 dias e estoque de segurança de 15 dias
 *
 * @param vvdReal - VVD real (unidades por dia)
 * @param leadTime - Tempo de entrega do fornecedor em dias (padrão: 5)
 * @param safetyStockDays - Dias de estoque de segurança (padrão: 15)
 * @returns Ponto de pedido (quantidade mínima para acionar reposição)
 *
 * @example
 * // Para VVD de 2.5 unidades/dia
 * calculateReorderPoint(2.5) // retorna 50
 */
export function calculateReorderPoint(
  vvdReal: number,
  leadTime: number = 5,
  safetyStockDays: number = 15
): number {
  return calc.reorderPoint(vvdReal, leadTime, safetyStockDays);
}

/**
 * Calcula a tendência de crescimento ou queda nas vendas
 * Compara VVD dos últimos 7 dias com VVD dos últimos 30 dias
 *
 * @param vvd7 - VVD dos últimos 7 dias
 * @param vvd30 - VVD dos últimos 30 dias
 * @returns Percentual de crescimento (positivo) ou queda (negativo)
 *          Retorna 0 se vvd30 for 0
 *
 * @example
 * // Para crescimento de 2.14 vs 0.93
 * calculateGrowthTrend(2.14, 0.93) // retorna 130.1
 * // Para queda
 * calculateGrowthTrend(0.5, 2.0) // retorna -75
 */
export function calculateGrowthTrend(vvd7: number, vvd30: number): number {
  return calc.growth(vvd7, vvd30);
}

/**
 * Calcula o capital parado em estoque
 * Baseado no preço de custo das unidades em estoque
 *
 * @param costPrice - Preço de custo unitário
 * @param currentStock - Quantidade atual em estoque
 * @returns Valor total do capital parado em estoque
 *
 * @example
 * // Para 65 unidades a R$ 85 cada
 * calculateCapitalStuck(85, 65) // retorna 5525
 */
export function calculateCapitalStuck(costPrice: number, currentStock: number): number {
  return calc.capitalStuck(costPrice, currentStock);
}

/**
 * Calcula quantos dias se passaram desde a última venda
 *
 * @param lastSaleDate - Data da última venda
 * @param referenceDate - Data de referência para cálculo (padrão: data atual)
 * @returns Dias desde a última venda
 *
 * @example
 * // Para última venda em 2025-11-19 e referência em 2025-11-29
 * calculateDaysSinceLastSale(new Date('2025-11-19'), new Date('2025-11-29'))
 * // retorna 10
 */
// Overloads: calculate days since last sale from sales array or a given date
export function calculateDaysSinceLastSale(orders: BlingSalesHistoryType[]): number;
export function calculateDaysSinceLastSale(lastSaleDate: Date | null, referenceDate?: Date): number;
export function calculateDaysSinceLastSale(
  ordersOrDate: BlingSalesHistoryType[] | Date | null,
  referenceDate: Date = new Date()
): number {
  if (Array.isArray(ordersOrDate)) {
    const orders = ordersOrDate;
    if (orders.length === 0) return 999;
    const sorted = [...orders].sort(
      (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
    );
    const lastSale = new Date(sorted[0].date);
    const diffTime = referenceDate.getTime() - lastSale.getTime();
    return Math.floor(diffTime / CONSTANTS.MS_PER_DAY);
  }
  return calc.daysSince(ordersOrDate, referenceDate);
}

/**
 * Calcula o preço sugerido para liquidação
 *
 * @param salePrice - Preço de venda original
 * @param discountPercentage - Percentual de desconto (ex: 0.3 para 30%)
 * @returns Preço de liquidação sugerido
 *
 * @example
 * // Para preço de R$ 179.90 com 30% de desconto
 * calculateSuggestedLiquidationPrice(179.90, 0.3) // retorna 125.93
 */
export function calculateSuggestedLiquidationPrice(
  salePrice: number,
  discountPercentage: number
): number {
  return salePrice * (1 - discountPercentage);
}

/**
 * Calcula quantos dias até o estoque atual se esgotar
 *
 * @param currentStock - Quantidade atual em estoque
 * @param vvdReal - VVD real (unidades por dia)
 * @returns Prazo estimado em dias
 *
 * @example
 * // Para 65 unidades em estoque e VVD de 2.5
 * calculateEstimatedDeadline(65, 2.5) // retorna 26
 */
export function calculateEstimatedDeadline(currentStock: number, vvdReal: number): number {
  return calc.daysRemaining(currentStock, vvdReal);
}

/**
 * Calcula o valor recuperável em uma liquidação
 *
 * @param currentStock - Quantidade atual em estoque
 * @param liquidationPrice - Preço de liquidação por unidade
 * @returns Valor total recuperável
 *
 * @example
 * // Para 65 unidades a R$ 125.93 cada
 * calculateRecoverableAmount(65, 125.93) // retorna 8185.45
 */
export function calculateRecoverableAmount(currentStock: number, liquidationPrice: number): number {
  return currentStock * liquidationPrice;
}

/**
 * Calcula estoque ideal com base em VVD real, lead time e dias de segurança
 */
export function calculateIdealStock(
  vvdReal: number,
  leadTime: number = 5,
  safetyDays: number = 15
): number {
  return vvdReal * (leadTime + safetyDays);
}

/**
 * Calcula unidades em excesso (acima do ideal)
 */
export function calculateExcessUnits(
  currentStock: number,
  vvdReal: number,
  leadTime: number = 5,
  safetyDays: number = 15
): number {
  const ideal = calculateIdealStock(vvdReal, leadTime, safetyDays);
  return Math.max(Math.ceil(currentStock - ideal), 0);
}

/**
 * Calcula capital parado em excesso
 */
export function calculateExcessCapital(excessUnits: number, costPrice: number): number {
  return excessUnits * costPrice;
}

/**
 * Calcula vendas estimadas para a janela de cobertura
 * Fórmula: vvdReal x (leadTime + safetyDays)
 */
export function calculateEstimatedSalesCover(
  vvdReal: number,
  leadTime: number = CONSTANTS.DEFAULTS.LEAD_TIME,
  safetyDays: number = CONSTANTS.DEFAULTS.SAFETY
): number {
  return vvdReal * (leadTime + safetyDays);
}

/**
 * Calcula unidades em excesso com base nas vendas estimadas na janela de cobertura
 * Fórmula: currentStock - vendasEstimadas (limitado a mínimo 0)
 */
export function calculateExcessUnitsFromCover(
  currentStock: number,
  estimatedSalesCover: number
): number {
  // Arredonda para o inteiro mais próximo para evitar excesso fracionário
  return Math.max(Math.round(currentStock - estimatedSalesCover), 0);
}

/**
 * Calcula o percentual de excesso em relação às vendas estimadas
 * Fórmula: (excesso / vendasEstimadas) x 100
 */
export function calculateExcessPercentage(
  excessUnits: number,
  estimatedSalesCover: number
): number {
  if (estimatedSalesCover <= 0) return 0;
  return (excessUnits / estimatedSalesCover) * CONSTANTS.PERCENT;
}

/**
 * Calcula quantos dias o produto ficou sem estoque
 *
 * @param lastSaleDate - Data da última venda (quando zerou o estoque)
 * @param referenceDate - Data de referência (padrão: data atual)
 * @returns Total de dias com estoque zerado
 *
 * @example
 * // Para produto que zerou em 2025-11-10
 * calculateDaysOutOfStock(new Date('2025-11-10'), new Date('2025-11-29'))
 * // retorna 19
 */
// Overloads: calculate stock-out days from orders or fallback to date-based
export function calculateDaysOutOfStock(
  orders: BlingSalesHistoryType[],
  currentStock: number,
  periodDays: number
): number;
export function calculateDaysOutOfStock(lastSaleDate: Date, referenceDate?: Date): number;
export function calculateDaysOutOfStock(
  ordersOrDate: BlingSalesHistoryType[] | Date,
  currentStockOrRef: number | Date = new Date(),
  periodDays?: number
): number {
  // Array-based implementation per spec
  if (Array.isArray(ordersOrDate)) {
    const orders = ordersOrDate;
    const currentStock = typeof currentStockOrRef === 'number' ? currentStockOrRef : 0;
    const days = typeof periodDays === 'number' ? periodDays : CONSTANTS.DAYS_IN_30;
    if (currentStock > 0 && orders.length > 0) {
      return 0;
    }
    if (currentStock === 0 && orders.length > 0) {
      const sorted = [...orders].sort(
        (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
      );
      const lastSaleDate = new Date(sorted[0].date);
      const today = new Date();
      const diffTime = today.getTime() - lastSaleDate.getTime();
      const daysSinceLastSale = Math.floor(diffTime / CONSTANTS.MS_PER_DAY);
      return Math.min(daysSinceLastSale, days);
    }
    if (currentStock === 0 && orders.length === 0) {
      return days;
    }
    return 0;
  }
  // Date-based fallback
  if (ordersOrDate instanceof Date) {
    const referenceDate = currentStockOrRef instanceof Date ? currentStockOrRef : new Date();
    return calculateDaysSinceLastSale(ordersOrDate, referenceDate);
  }
  return 0;
}

/**
 * Calcula as vendas perdidas estimadas devido à falta de estoque
 *
 * @param vvdReal - VVD real quando havia estoque (unidades por dia)
 * @param daysOutOfStock - Dias com estoque zerado
 * @returns Quantidade estimada de vendas perdidas
 *
 * @example
 * // Para VVD de 2.5 e 19 dias sem estoque
 * calculateEstimatedLostSales(2.5, 19) // retorna 47.5
 */
export function calculateEstimatedLostSales(vvdReal: number, daysOutOfStock: number): number {
  return vvdReal * daysOutOfStock;
}

/**
 * Calcula a receita perdida estimada devido à falta de estoque
 *
 * @param estimatedLostSales - Vendas perdidas estimadas
 * @param salePrice - Preço de venda unitário
 * @returns Valor estimado de receita perdida
 *
 * @example
 * // Para 47.5 vendas perdidas a R$ 179.90 cada
 * calculateEstimatedLostAmount(47.5, 179.90) // retorna 8545.25
 */
export function calculateEstimatedLostAmount(
  estimatedLostSales: number,
  salePrice: number
): number {
  return estimatedLostSales * salePrice;
}

/**
 * Determina o nível de risco baseado em dias restantes de estoque
 *
 * @param daysRemaining - Dias restantes de estoque
 * @param daysOutOfStock - Dias com estoque zerado (se aplicável)
 * @returns Nível de risco: 'LOW', 'MEDIUM', 'HIGH', 'CRITICAL'
 *
 * @example
 * // Para 4.8 dias restantes
 * determineRiskLevel(4.8) // retorna 'CRITICAL'
 * // Para produto zerado
 * determineRiskLevel(0, 19) // retorna 'CRITICAL'
 */
export function determineRiskLevel(
  daysRemaining: number,
  daysOutOfStock: number,
  leadTime: number
): BlingRuptureRisk {
  if (daysOutOfStock > 0) return 'CRITICAL';
  if (daysRemaining <= 2) return 'CRITICAL';
  if (daysRemaining <= 7) return 'HIGH';
  if (daysRemaining <= leadTime) return 'MEDIUM';
  return 'LOW';
}

/**
 * Determina o tipo de situação do produto
 *
 * @param growthTrend - Tendência de crescimento (%)
 * @param riskLevel - Nível de risco
 * @param capitalStuck - Capital parado
 * @param vvdReal - VVD real
 * @returns Tipo de situação: 'FINE', 'OPPORTUNITY', 'RUPTURE'
 *
 * @example
 * // Para crescimento de 130% e risco médio
 * determineProductType(130, 'MEDIUM', 1000, 2.5) // retorna 'OPPORTUNITY'
 */
export function determineProductType(params: {
  riskLevel: BlingRuptureRisk;
  growthTrend: number;
  excessCapital: number;
  capitalStuck: number;
  vvdReal: number;
  daysSinceLastSale: number;
  daysRemaining: number;
  leadTime: number;
  safetyDays: number;
  excessPercentage: number;
}): BlingAlertType {
  const {
    riskLevel,
    growthTrend,
    excessCapital: _excessCapital,
    capitalStuck: _capitalStuck,
    vvdReal,
    daysSinceLastSale,
    daysRemaining,
    leadTime,
    safetyDays,
    excessPercentage,
  } = params;

  if (daysSinceLastSale > 90) return 'DEAD_STOCK';
  if (riskLevel === 'CRITICAL' || daysRemaining < leadTime + safetyDays) return 'RUPTURE';
  if (growthTrend > 50 && vvdReal >= 1) return 'OPPORTUNITY';
  if (excessPercentage > 200 && daysSinceLastSale < 90) return 'LIQUIDATION';
  return 'FINE';
}

/**
 * Gera mensagens descritivas baseadas no status do produto
 *
 * @param riskLevel - Nível de risco
 * @param daysRemaining - Dias restantes de estoque
 * @param daysOutOfStock - Dias com estoque zerado
 * @param productType - Tipo de situação do produto
 * @returns Mensagem descritiva
 *
 * @example
 * generateStatusMessage('CRITICAL', 4.8, 0, 'RUPTURE')
 * // retorna "URGENTE: Apenas 5 dias de estoque. Repor AGORA!"
 */
export function generateStatusMessage(
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL',
  daysRemaining: number,
  daysOutOfStock: number,
  productType: BlingAlertType
): string {
  if (daysOutOfStock > 0)
    return `CRÍTICO: Produto sem estoque há ${daysOutOfStock} dias! Repor IMEDIATAMENTE`;
  if (riskLevel === 'CRITICAL')
    return `URGENTE: Apenas ${Math.ceil(daysRemaining)} dias de estoque. Repor AGORA!`;
  if (riskLevel === 'HIGH') return `Ponto de pedido atingido. Repor nos próximos dias`;
  if (productType === 'OPPORTUNITY') return `OPORTUNIDADE: Produto em crescimento rápido`;
  if ((productType as unknown as string) === 'LIQUIDATION')
    return `ALTO: Excesso de estoque — considere liquidação`;
  if (productType === 'FINE') return `Estoque saudável`;
  return `Monitorar estoque`;
}

/**
 * Gera recomendações baseadas no status do produto
 *
 * @param productType - Tipo de situação do produto
 * @param growthTrend - Tendência de crescimento (%)
 * @param capitalStuck - Capital parado
 * @returns Array de recomendações
 *
 * @example
 * generateRecommendations('OPPORTUNITY', 130, 1000)
 * // retorna ["Aumentar estoque urgentemente (crescimento forte)", ...]
 */
export function generateRecommendations(
  productType: BlingAlertType,
  growthTrend: number,
  capitalStuck: number,
  thresholds?: {
    opportunityGrowthThresholdPct: number;
    capitalOptimizationThreshold: number;
  }
): string[] {
  const rec: string[] = [];
  const defaults = CONSTANTS.DEFAULTS;
  const growthMinPct =
    (thresholds?.opportunityGrowthThresholdPct ?? defaults.GROWTH_THRESHOLD) * CONSTANTS.PERCENT;

  if (productType === 'OPPORTUNITY' && growthTrend > growthMinPct)
    rec.push(
      'Aumentar estoque urgentemente',
      'Aumentar preço em até 15%',
      'Criar campanha de anúncios'
    );

  if (productType === 'RUPTURE')
    rec.push(
      'Repor estoque imediatamente',
      'Revisar ponto de pedido',
      'Negociar prazos com fornecedor'
    );

  if ((productType as unknown as string) === 'LIQUIDATION')
    rec.push('Aplicar desconto de 20–30%', 'Criar campanha de liquidação', 'Evitar novas compras');

  const capOpt = thresholds?.capitalOptimizationThreshold ?? defaults.CAPITAL_OPTIMIZATION;
  if (productType === 'FINE' && capitalStuck > capOpt)
    rec.push('Reduzir estoque para liberar capital', 'Avaliar alinhamento com giro de vendas');

  if (!rec.length) rec.push('Manter monitoramento regular');
  return rec;
}

/**
 * Mapeia o tipo de alerta para rótulos em português usados na UI/relatórios
 */
export function mapAlertTypeToPtLabel(type: BlingAlertType): string {
  switch (type as unknown as string) {
    case 'RUPTURE':
      return 'RUPTURA';
    case 'OPPORTUNITY':
      return 'OPORTUNIDADE';
    case 'LIQUIDATION':
      return 'LIQUIDAÇÃO';
    case 'DEAD_STOCK':
      return 'CAPITAL_PARADO';
    case 'FINE':
    default:
      return 'OBSERVAR';
  }
}

/**
 * Calcula o número de dias únicos com vendas a partir do histórico de vendas
 * @param sales - Histórico de vendas do produto
 * @returns Número de dias únicos com vendas
 */
export function getDaysWithSales(sales: BlingSalesHistoryType[]): number {
  const uniqueDays = new Set<string>();
  for (const sale of sales) {
    const saleDate = new Date(sale.date).toISOString().split('T')[0];
    uniqueDays.add(saleDate);
  }
  return uniqueDays.size;
}

/**
 * Calcula o total de vendas a partir do histórico de vendas
 * @param sales - Histórico de vendas do produto
 * @returns Total de vendas
 */
export function getTotalSales(sales: BlingSalesHistoryType[]): number {
  return sales.reduce((total, sale) => total + (sale.quantity || 0), 0);
}

/**
 * Obtém a data da última venda a partir do histórico de vendas
 * @param sales - Histórico de vendas do produto
 * @returns Data da última venda ou null se não houver vendas
 */
export function getLastSaleDate(sales: BlingSalesHistoryType[]): Date | null {
  if (sales.length === 0) return null;
  const sortedSales = [...sales].sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );
  return new Date(sortedSales[0].date);
}

/**
 * Calcula o total de vendas nos últimos 'days' dias
 * @param sales - Histórico de vendas do produto
 * @param days - Dias para considerar no cálculo
 * @returns Total de vendas nos últimos 'days' dias
 */
export function getTotalLastSales(sales: BlingSalesHistoryType[], days: number): number {
  const now = new Date();
  const pastDate = new Date(now);
  pastDate.setDate(now.getDate() - days);

  return sales
    .filter((sale) => new Date(sale.date) >= pastDate)
    .reduce((total, sale) => total + (sale.quantity || 0), 0);
}

/**
 * Calcula todas as métricas de um produto em uma única função
 *
 * @param productData - Dados do produto para cálculo
 * @param settings - Configurações específicas do produto
 * @returns Objeto com todas as métricas calculadas
 */
export function calculateAllMetrics(
  productData: BlingProductData,
  settings: BlingProductSettingsType | null
): {
  vvdReal: number;
  vvd30: number;
  vvd7: number;
  daysRemaining: number;
  reorderPoint: number;
  growthTrend: number;
  capitalStuck: number;
  daysSinceLastSale: number;
  suggestedPrice: number;
  estimatedDeadline: number;
  recoverableAmount: number;
  daysOutOfStock: number;
  estimatedLostSales: number;
  estimatedLostAmount: number;
  idealStock: number;
  excessUnits: number;
  excessPercentage: number;
  excessCapital: number;
  risk: BlingRuptureRisk;
  type: BlingAlertType;
  message: string;
  recommendations: string[];
} {
  const {
    totalSales,
    // daysWithSales,
    totalLast30DaysSales,
    totalLast7DaysSales,
    currentStock,
    costPrice,
    salePrice,
    lastSaleDate,
    hasStockOut,
    stockOutDate,
    // daysWithSalesWithinLast30,
    // daysWithSalesWithinLast7,
  } = productData;

  // Cálculos básicos
  // Days since last sale and stock-out aware VVD calculations
  const daysSinceLastSale = calc.daysSince(lastSaleDate);
  const daysOutOfStock30 =
    currentStock === 0 ? Math.min(daysSinceLastSale, CONSTANTS.DAYS_IN_30) : 0;
  const daysWithStock30 = CONSTANTS.DAYS_IN_30 - daysOutOfStock30;
  const vvdReal = daysWithStock30 > 0 ? totalSales / daysWithStock30 : 0;
  const vvd30 = totalLast30DaysSales / Math.max(daysWithStock30, 1);
  const daysOutOfStock7 = currentStock === 0 ? Math.min(daysSinceLastSale, CONSTANTS.DAYS_IN_7) : 0;
  const daysWithStock7 = CONSTANTS.DAYS_IN_7 - daysOutOfStock7;
  const vvd7 = totalLast7DaysSales / Math.max(daysWithStock7, 1);
  const daysRemaining = calc.daysRemaining(currentStock, vvdReal);
  const reorderPoint = calc.reorderPoint(vvdReal, settings?.leadTimeDays, settings?.safetyDays);
  const growthTrend = calc.growth(vvd7, vvd30);
  const capitalStuck = calc.capitalStuck(costPrice, currentStock);
  // Cobertura e excesso conforme fórmulas solicitadas
  const leadTime = settings?.leadTimeDays ?? CONSTANTS.DEFAULTS.LEAD_TIME;
  const safetyDays = settings?.safetyDays ?? CONSTANTS.DEFAULTS.SAFETY;
  const idealStock = vvdReal * (leadTime + safetyDays);
  const excessUnits = Math.max(0, currentStock - idealStock);
  const excessPercentage = idealStock > 0 ? (excessUnits / idealStock) * CONSTANTS.PERCENT : 0;
  const excessCapital = excessUnits * costPrice;

  // Cálculos de liquidação
  const suggestedPrice = calculateSuggestedLiquidationPrice(
    salePrice,
    settings?.liquidationDiscount ?? CONSTANTS.DEFAULTS.LIQUIDATION_DISCOUNT
  );
  const estimatedDeadline = calc.daysRemaining(currentStock, vvdReal);
  const recoverableAmount = calculateRecoverableAmount(currentStock, suggestedPrice);

  // Cálculos de ruptura
  const daysOutOfStock = hasStockOut && stockOutDate ? calculateDaysOutOfStock(stockOutDate) : 0;
  const estimatedLostSales = hasStockOut ? calculateEstimatedLostSales(vvdReal, daysOutOfStock) : 0;
  const estimatedLostAmount = hasStockOut
    ? calculateEstimatedLostAmount(estimatedLostSales, salePrice)
    : 0;

  // Classificações
  const risk = determineRiskLevel(daysRemaining, daysOutOfStock, leadTime);
  const type = determineProductType({
    riskLevel: risk,
    growthTrend,
    excessCapital,
    capitalStuck,
    vvdReal,
    daysSinceLastSale,
    daysRemaining,
    leadTime,
    safetyDays,
    excessPercentage,
  });
  const message = generateStatusMessage(risk, daysRemaining, daysOutOfStock, type);
  const recommendations = generateRecommendations(type, growthTrend, capitalStuck, {
    opportunityGrowthThresholdPct:
      settings?.opportunityGrowthThresholdPct ?? CONSTANTS.DEFAULTS.GROWTH_THRESHOLD,
    capitalOptimizationThreshold:
      settings?.capitalOptimizationThreshold ?? CONSTANTS.DEFAULTS.CAPITAL_OPTIMIZATION,
  });

  // Guards and integer casting for Prisma Int fields
  const safeDaysRemaining = Number.isFinite(daysRemaining) ? Math.floor(daysRemaining) : 0;
  const safeEstimatedDeadline = Number.isFinite(estimatedDeadline)
    ? Math.floor(estimatedDeadline)
    : 0;
  const safeDaysOutOfStock = Number.isFinite(daysOutOfStock) ? Math.round(daysOutOfStock) : 0;
  const safeEstimatedLostSales = Number.isFinite(estimatedLostSales)
    ? Math.round(estimatedLostSales)
    : 0;
  const safeExcessUnits = Number.isFinite(excessUnits) ? Math.round(excessUnits) : 0;

  return {
    vvdReal: Number.isFinite(vvdReal) ? Number.parseFloat(vvdReal.toFixed(2)) : 0,
    vvd30: Number.isFinite(vvd30) ? Number.parseFloat(vvd30.toFixed(2)) : 0,
    vvd7: Number.isFinite(vvd7) ? Number.parseFloat(vvd7.toFixed(2)) : 0,
    daysRemaining: safeDaysRemaining,
    reorderPoint: Math.ceil(reorderPoint),
    growthTrend: Number.isFinite(growthTrend) ? Number.parseFloat(growthTrend.toFixed(1)) : 0,
    capitalStuck: Number.isFinite(capitalStuck) ? Number.parseFloat(capitalStuck.toFixed(2)) : 0,
    daysSinceLastSale,
    suggestedPrice: Number.isFinite(suggestedPrice)
      ? Number.parseFloat(suggestedPrice.toFixed(2))
      : 0,
    estimatedDeadline: safeEstimatedDeadline,
    recoverableAmount: Number.isFinite(recoverableAmount)
      ? Number.parseFloat(recoverableAmount.toFixed(2))
      : 0,
    daysOutOfStock: safeDaysOutOfStock,
    estimatedLostSales: safeEstimatedLostSales,
    estimatedLostAmount: Number.isFinite(estimatedLostAmount)
      ? Number.parseFloat(estimatedLostAmount.toFixed(2))
      : 0,
    idealStock: Number.isFinite(idealStock) ? Number.parseFloat(idealStock.toFixed(2)) : 0,
    excessUnits: safeExcessUnits,
    excessPercentage: Number.isFinite(excessPercentage)
      ? Number.parseFloat(excessPercentage.toFixed(1))
      : 0,
    excessCapital: Number.isFinite(excessCapital) ? Number.parseFloat(excessCapital.toFixed(2)) : 0,
    risk,
    type,
    message,
    recommendations,
  };
}
