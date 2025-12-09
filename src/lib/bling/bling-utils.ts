/**
 * Módulo de métricas para cálculo de indicadores de gestão de estoque
 * Todas as funções são puras, stateless e thread-safe
 */

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
export function calculateRealVVD(totalSales: number, daysWithSales: number): number {
  if (daysWithSales <= 0) return 0;
  return totalSales / daysWithSales;
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
export function calculate30DaysVVD(totalLast30DaysSales: number): number {
  return totalLast30DaysSales / 30;
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
export function calculate7DaysVVD(totalLast7DaysSales: number): number {
  return totalLast7DaysSales / 7;
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
  if (vvdReal <= 0) return currentStock > 0 ? Infinity : 0;
  return currentStock / vvdReal;
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
  return vvdReal * (leadTime + safetyStockDays);
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
  if (vvd30 === 0) return 0;
  return ((vvd7 - vvd30) / vvd30) * 100;
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
  return costPrice * currentStock;
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
export function calculateDaysSinceLastSale(
  lastSaleDate: Date,
  referenceDate: Date = new Date()
): number {
  const diffTime = Math.abs(referenceDate.getTime() - lastSaleDate.getTime());
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
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
  if (vvdReal <= 0) return currentStock > 0 ? Infinity : 0;
  return currentStock / vvdReal;
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
export function calculateDaysOutOfStock(
  lastSaleDate: Date,
  referenceDate: Date = new Date()
): number {
  return calculateDaysSinceLastSale(lastSaleDate, referenceDate);
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
  daysOutOfStock: number = 0
): BlingRuptureRisk {
  if (daysOutOfStock > 0) return 'CRITICAL';
  if (daysRemaining < 7) return 'CRITICAL';
  if (daysRemaining < 15) return 'HIGH';
  if (daysRemaining < 30) return 'MEDIUM';
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
export function determineProductType(
  growthTrend: number,
  riskLevel: BlingRuptureRisk,
  capitalStuck: number,
  vvdReal: number
): BlingAlertType {
  if (riskLevel === 'CRITICAL' || riskLevel === 'HIGH') return 'RUPTURE';
  if (growthTrend > 50 && vvdReal > 1) return 'OPPORTUNITY';
  if (capitalStuck > 5000 && vvdReal < 0.5) return 'DEAD_STOCK'; // Dinheiro parado
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
  if (daysOutOfStock > 0) {
    return `CRÍTICO: Produto sem estoque há ${daysOutOfStock} dias! Repor IMEDIATAMENTE`;
  }

  if (riskLevel === 'CRITICAL') {
    const days = Math.ceil(daysRemaining);
    return `URGENTE: Apenas ${days} dias de estoque. Repor AGORA!`;
  }

  if (riskLevel === 'HIGH') {
    return `Ponto de pedido atingido. Repor nos próximos dias`;
  }

  if (productType === 'OPPORTUNITY') {
    return `OPORTUNIDADE: Produto em crescimento rápido`;
  }

  if (productType === 'FINE') {
    return `Estoque saudável`;
  }

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
  capitalStuck: number
): string[] {
  const recommendations: string[] = [];

  if (productType === 'OPPORTUNITY' && growthTrend > 50) {
    recommendations.push(
      'Aumentar estoque urgentemente (crescimento forte)',
      'Testar aumento de preço em 15% (alta demanda)',
      'Criar campanha de anúncios'
    );
  }

  if (productType === 'RUPTURE' && capitalStuck > 5000) {
    recommendations.push(
      'Liquidar estoque para recuperar capital',
      'Aplicar desconto de 30% para acelerar venda',
      'Verificar possibilidade de troca com fornecedor'
    );
  }

  if (productType === 'RUPTURE' && capitalStuck <= 5000) {
    recommendations.push(
      'Repor estoque imediatamente',
      'Ajustar ponto de pedido para evitar nova ruptura',
      'Negociar lead time mais curto com fornecedor'
    );
  }

  if (productType === 'FINE' && capitalStuck > 10000) {
    recommendations.push(
      'Considerar redução de estoque para liberar capital',
      'Avaliar se estoque atual está alinhado com VVD'
    );
  }

  // Recomendação padrão se não houver outras
  if (recommendations.length === 0) {
    recommendations.push('Manter monitoramento regular');
  }

  return recommendations;
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
  const sortedSales = sales.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
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
  risk: BlingRuptureRisk;
  type: BlingAlertType;
  message: string;
  recommendations: string[];
} {
  const {
    totalSales,
    daysWithSales,
    totalLast30DaysSales,
    totalLast7DaysSales,
    currentStock,
    costPrice,
    salePrice,
    lastSaleDate,
    hasStockOut,
    stockOutDate,
  } = productData;

  // Cálculos básicos
  const vvdReal = calculateRealVVD(totalSales, daysWithSales);
  const vvd30 = calculate30DaysVVD(totalLast30DaysSales);
  const vvd7 = calculate7DaysVVD(totalLast7DaysSales);
  const daysRemaining = calculateDaysRemaining(currentStock, vvdReal);
  const reorderPoint = calculateReorderPoint(vvdReal, settings?.leadTimeDays, settings?.safetyDays);
  const growthTrend = calculateGrowthTrend(vvd7, vvd30);
  const capitalStuck = calculateCapitalStuck(costPrice, currentStock);
  const daysSinceLastSale = calculateDaysSinceLastSale(lastSaleDate);

  // Cálculos de liquidação
  const suggestedPrice = calculateSuggestedLiquidationPrice(salePrice, 0.3);
  const estimatedDeadline = calculateEstimatedDeadline(currentStock, vvdReal);
  const recoverableAmount = calculateRecoverableAmount(currentStock, suggestedPrice);

  // Cálculos de ruptura
  const daysOutOfStock = hasStockOut && stockOutDate ? calculateDaysOutOfStock(stockOutDate) : 0;
  const estimatedLostSales = hasStockOut ? calculateEstimatedLostSales(vvdReal, daysOutOfStock) : 0;
  const estimatedLostAmount = hasStockOut
    ? calculateEstimatedLostAmount(estimatedLostSales, salePrice)
    : 0;

  // Classificações
  const risk = determineRiskLevel(daysRemaining, daysOutOfStock);
  const type = determineProductType(growthTrend, risk, capitalStuck, vvdReal);
  const message = generateStatusMessage(risk, daysRemaining, daysOutOfStock, type);
  const recommendations = generateRecommendations(type, growthTrend, capitalStuck);

  return {
    vvdReal: parseFloat(vvdReal.toFixed(2)),
    vvd30: parseFloat(vvd30.toFixed(2)),
    vvd7: parseFloat(vvd7.toFixed(2)),
    daysRemaining: parseFloat(daysRemaining.toFixed(1)),
    reorderPoint: Math.ceil(reorderPoint),
    growthTrend: parseFloat(growthTrend.toFixed(1)),
    capitalStuck: parseFloat(capitalStuck.toFixed(2)),
    daysSinceLastSale,
    suggestedPrice: parseFloat(suggestedPrice.toFixed(2)),
    estimatedDeadline: parseFloat(estimatedDeadline.toFixed(0)),
    recoverableAmount: parseFloat(recoverableAmount.toFixed(2)),
    daysOutOfStock,
    estimatedLostSales: parseFloat(estimatedLostSales.toFixed(1)),
    estimatedLostAmount: parseFloat(estimatedLostAmount.toFixed(2)),
    risk,
    type,
    message,
    recommendations,
  };
}
