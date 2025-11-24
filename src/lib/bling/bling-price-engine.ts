/**
 * Rules Engine for Nexus OS v2
 *
 * - Calculates VVD for windows (7, 30, 90 days) using days-with-sales method (VVD_real).
 * - Classifies rupture risk.
 * - Detects "money stuck" (idle / encalhado).
 * - Detects opportunities (VVD7 >> VVD30).
 * - Returns a single RecommendationResult per product plus the raw recommendation strings array.
 */
import { type BlingProductSettings, BlingRuptureRisk } from '@prisma/client';
import prisma from '../prisma';
import type {
  AlertMetrics,
  Product,
  ProductEvaluation,
  RecommendationResult,
  SalesHistory,
  StockBalance,
} from './bling-types';
import {
  calculateCapitalStuck,
  calculateIdleDays,
  calculateStockCoverageDays,
  calculateTrend,
  classifyRuptureRisk,
  computeLastSaleDate,
  computeVVD,
  daysAgoDate,
  filterHistoryInRange,
  sumQuantity,
} from './bling-utils';

/* ---------- Config (tweakable / move to config file) ---------- */
const LEAD_TIME_DAYS = 15;
const SAFETY_DAYS = 5;
const RECOVERY_TARGET = 0.8; // 80% recovery target for quick heuristic
const OPPORTUNITY_GROWTH_THRESHOLD = 0.3; // 30% growth (VVD7 > 1.3 * VVD30)
const LIQUIDATION_IDLE_THRESHOLD_DAYS = 90; // product idle >= 90d -> encalhado
const LIQUIDATION_MAX_DAYS = 30; // horizon to attempt liquidation
const MIN_SALES_FOR_OPPORTUNITY = 3; // minimum sales in windows to trust trend
const NEW_PRODUCT_MIN_DAYS = 30; // product younger than this with low sales -> "new launch"
// const MIN_HISTORY_DAYS_FOR_DECISION = 7; // if less than this, be conservative

/**
 * Get Bling product settings from DB
 * @param blingId - Bling product ID
 * @returns Bling product settings or null
 */
export async function getProductSettings(blingId: number): Promise<BlingProductSettings | null> {
  try {
    const product = await prisma.blingProduct.findUnique({
      where: { blingProductId: String(blingId) },
    });

    if (!product) return null;

    const settings = await prisma.blingProductSettings.findUnique({
      where: { productId: product.id },
    });
    return settings;
  } catch (error) {
    console.error('Error fetching Bling product settings:', error);
    return null;
  }
}

/**
 * Calculate reorder quantity (simple): (vvd * (lead + safety)) - currentStock
 * returns ceil of needed units, min 0.
 * @param vvd - average daily sales (VVD)
 * @param currentStock - current stock level
 * @param leadTime - lead time in days
 * @param safety - safety stock in days
 * @returns Reorder quantity
 */
function calculateReorderQty(
  vvd: number,
  currentStock: number,
  leadTime = LEAD_TIME_DAYS,
  safety = SAFETY_DAYS
) {
  if (vvd <= 0) return 0;
  const reorderPoint = vvd * (leadTime + safety);
  const needed = Math.max(0, Math.ceil(reorderPoint - currentStock));
  return needed;
}

/**
 * Simple liquidation estimator:
 * - capital = costPrice * stock
 * - targetValue = capital * RECOVERY_TARGET
 * - if stock == 0 -> null
 * - pricePerUnitNeeded = targetValue / stock
 * - if pricePerUnitNeeded >= salePrice -> not feasible
 * - else compute discount and suggestedPrice
 * @param product - Product object
 * @param stock - Current stock level
 * @returns Liquidation estimate or null
 */
function estimateLiquidation(
  product: Product,
  stock: number,
  recoveryTarget: number = RECOVERY_TARGET
) {
  const costPrice = product.costPrice ?? 0;
  const salePrice = product.salePrice ?? 0;
  const capital = calculateCapitalStuck(stock, costPrice);

  if (stock <= 0) return null;

  const targetValue = capital * recoveryTarget;
  if (targetValue <= 0)
    return {
      feasible: false,
      reason: 'sem capital ou dados de preço',
      capital,
    };

  const pricePerUnitNeeded = targetValue / stock;

  if (pricePerUnitNeeded >= salePrice) {
    return {
      feasible: false,
      reason: 'preço necessário >= preço de venda atual',
      capital,
      pricePerUnitNeeded,
    };
  }

  // compute discount but clamp to reasonable bounds
  let discount = 1 - pricePerUnitNeeded / salePrice;
  if (discount < 0.02) discount = 0.02;
  if (discount > 0.8) discount = 0.8;

  const suggestedPrice = Number((salePrice * (1 - discount)).toFixed(2));
  const estimatedRecovery = Number((suggestedPrice * stock).toFixed(2));

  return {
    feasible: true,
    suggestedPrice,
    discountPercent: Math.round(discount * 100),
    estimatedRecovery,
    capital,
  };
}

/**
 * Evaluate single product given its history and optional stock override.
 * @param product - Product object
 * @param salesHistory - Sales history array
 * @param stockOverride - Optional stock balance override
 * @returns ProductEvaluation object
 */
export async function evaluateProduct(
  product: Product,
  salesHistory: SalesHistory[] = [],
  stockOverride?: StockBalance | null
): Promise<ProductEvaluation> {
  // Fetch product settings
  const settings = await getProductSettings(product.id);

  // normalize stock
  const stock =
    stockOverride && typeof stockOverride.stock === 'number'
      ? stockOverride.stock
      : (product.stock ?? 0);

  // derive windows
  const today = new Date().toISOString().split('T')[0];
  const start7 = daysAgoDate(7);
  const start30 = daysAgoDate(30);
  const start90 = daysAgoDate(90);

  const hist7 = filterHistoryInRange(salesHistory, start7, today);
  const hist30 = filterHistoryInRange(salesHistory, start30, today);
  const hist90 = filterHistoryInRange(salesHistory, start90, today);

  const vvd7 = computeVVD(hist7);
  const vvd30 = computeVVD(hist30);
  const overallVvd = computeVVD(salesHistory);

  // last sale date (computed safely)
  const lastSaleDate = computeLastSaleDate(product, salesHistory);
  const idleDays = lastSaleDate ? calculateIdleDays(lastSaleDate) : Number.POSITIVE_INFINITY;

  // trend: reuse calculateTrend if enough data
  const trend = salesHistory && salesHistory.length >= 2 ? calculateTrend(salesHistory) : 0;

  // capitalStuck: pass salePrice as fallback
  const capitalStuck = calculateCapitalStuck(stock, product.costPrice ?? 0, product.salePrice ?? 0);

  // stock coverage using safer function (returns Infinity when VVD==0)
  const stockCoverageDays =
    overallVvd > 0 ? calculateStockCoverageDays(stock, overallVvd) : Infinity;

  // stock turnover: prefer product.avgMonthlySales, fallback to total in last 30 days (interpreted as monthly)
  const monthlySalesFallback = sumQuantity(hist30); // total sold in last 30 days
  const monthlyAvgSales =
    product.avgMonthlySales && product.avgMonthlySales > 0
      ? product.avgMonthlySales
      : monthlySalesFallback;
  const stockTurnover = stock > 0 ? monthlyAvgSales / stock : 0;

  const metrics: AlertMetrics = {
    idleDays: Number.isFinite(idleDays) ? Math.round(idleDays) : 9999,
    stockTurnover,
    stockCoverageDays: Number.isFinite(stockCoverageDays) ? Number(stockCoverageDays) : Infinity,
    trend,
    capitalStuck,
  };

  const recommendationsStrings: string[] = [];
  const detailed: RecommendationResult[] = [];

  // Decision rules in priority order (one final recommendation):
  // 1) Rupture critical -> Reorder
  // 2) Opportunity -> Opportunity card (price test / stock increase)
  // 3) Capital stuck (encalhado) -> Liquidate / bundle
  // 4) New product with insufficient history -> No card / Monitor
  // 5) Giro lento e consistente -> Monitor
  // 6) Default -> Monitor

  // 1) Rupture evaluation (use vvd30 or overallVvd fallback)
  const vvdForRupture = vvd30 > 0 ? vvd30 : overallVvd;
  const coverageDaysForRupture = vvdForRupture > 0 ? stock / vvdForRupture : Infinity;
  const ruptureRisk = classifyRuptureRisk(coverageDaysForRupture);

  if (ruptureRisk === BlingRuptureRisk.CRITICAL || ruptureRisk === BlingRuptureRisk.HIGH) {
    const reorderQty = calculateReorderQty(
      vvdForRupture,
      stock,
      settings?.leadTimeDays,
      settings?.safetyDays
    );
    const estCost = reorderQty * (product.costPrice || product.salePrice || 0);
    const action = `Repor ${reorderQty} unidades`;
    const justification = `Risco de ruptura ${ruptureRisk}. Cobertura de estoque estimada ${
      coverageDaysForRupture === Infinity ? '∞' : coverageDaysForRupture.toFixed(1)
    } dias, VVD ${vvdForRupture.toFixed(2)} u/dia.`;
    const estimatedImpact =
      reorderQty > 0
        ? `Evite perda de vendas; custo estimado de reposição R$ ${estCost.toFixed(2)}`
        : `Verifique fornecedores / prazo de entrega`;
    recommendationsStrings.push(`${action} — ${justification}`);
    detailed.push({
      id: product.id,
      action,
      justification,

      estimatedFinancialImpact: estimatedImpact,
      executionTime: `${settings?.leadTimeDays} days (lead time)`,
      risk: ruptureRisk === BlingRuptureRisk.CRITICAL ? 'high' : 'medium',
    });
  }

  // 2) Opportunity detection: VVD7 >> VVD30 and stock ok
  // require minimum data confidence
  const salesCount30 = sumQuantity(hist30);
  if (
    vvd30 > 0 &&
    vvd7 > vvd30 * (1 + (settings?.opportunityGrowthThreshold || OPPORTUNITY_GROWTH_THRESHOLD)) &&
    stock > 15 &&
    salesCount30 >= (settings?.minSalesForOpportunity || MIN_SALES_FOR_OPPORTUNITY)
  ) {
    const increasePct = 10;
    const newPrice = Number((product.salePrice * (1 + increasePct / 100)).toFixed(2));
    const action = `Oportunidade: testar preço +${increasePct}% ou aumentar estoque`;
    const justification = `VVD7 (${vvd7.toFixed(2)}) > VVD30 (${vvd30.toFixed(2)}) em ${(
      (vvd7 / vvd30 - 1) * 100
    ).toFixed(0)}%. Estoque suficiente (${stock} unidades) para teste.`;
    const estimatedImpact = `Potencial aumento de margem; novo preço exemplo R$ ${newPrice}`;
    recommendationsStrings.push(`${action} — ${justification}`);
    detailed.push({
      id: product.id,
      action,
      justification,
      estimatedFinancialImpact: estimatedImpact,
      executionTime: `7 days (A/B test)`,
      risk: 'low',
    });
  }

  // 3) Capital stuck / encalhado detection
  // If no sales in last 90 days OR idleDays >= LIQUIDATION_IDLE_THRESHOLD_DAYS -> encalhado
  const soldLast90 = sumQuantity(hist90) > 0;
  if (
    !soldLast90 &&
    (metrics.idleDays >=
      (settings?.liquidationIdleThresholdDays || LIQUIDATION_IDLE_THRESHOLD_DAYS) ||
      !isFinite(metrics.idleDays))
  ) {
    // Encalhado
    const liq = estimateLiquidation(product, stock, settings?.recoveryTarget || RECOVERY_TARGET);
    if (liq && liq.feasible) {
      const action = `Liquidar por R$ ${liq.suggestedPrice} (≈ -${liq.discountPercent}%)`;
      const justification = `Sem vendas nos últimos ${settings?.liquidationIdleThresholdDays || LIQUIDATION_IDLE_THRESHOLD_DAYS} dias. Capital parado ${liq.capital.toFixed(
        2
      )}. Recuperação sugerida ≈ R$ ${liq.estimatedRecovery}.`;
      recommendationsStrings.push(`${action} — ${justification}`);
      detailed.push({
        id: product.id,
        action,
        justification,
        estimatedFinancialImpact: `Recuperar ≈ R$ ${liq.estimatedRecovery}`,
        executionTime: `${settings?.liquidationMaxDays || LIQUIDATION_MAX_DAYS} dias`,
        risk: 'medium',
      });
    } else {
      const action = `Marcar como "Capital Parado" — planejar kit ou negociação com fornecedor`;
      const justification = `Sem vendas nos últimos ${settings?.liquidationIdleThresholdDays || LIQUIDATION_IDLE_THRESHOLD_DAYS} dias. Capital parado R$ ${capitalStuck.toFixed(
        2
      )}. Liquidação direta não viável pelo preço.`;
      recommendationsStrings.push(`${action} — ${justification}`);
      detailed.push({
        id: product.id,
        action,
        justification,
        estimatedFinancialImpact: `Recuperação potencial via kit/desconto`,
        executionTime: `7-30 dias`,
        risk: 'medium',
      });
    }
  }

  // 4) New product / insufficient history -> no card
  const totalSalesAll = sumQuantity(salesHistory);
  const firstSaleDate = salesHistory.length
    ? salesHistory.reduce((a, b) => (new Date(a.date) < new Date(b.date) ? a : b)).date
    : null;
  const daysSinceFirstSale = firstSaleDate
    ? Math.floor((Date.now() - new Date(firstSaleDate).getTime()) / (1000 * 60 * 60 * 24))
    : Number.POSITIVE_INFINITY;
  if (
    totalSalesAll < 2 &&
    daysSinceFirstSale < (settings?.newProductMinDays || NEW_PRODUCT_MIN_DAYS)
  ) {
    // New launch: be conservative
    const action = `Novo produto - Monitorar`;
    const justification = `Histórico insuficiente (${totalSalesAll} vendas, ${daysSinceFirstSale} dias desde a primeira venda).`;
    recommendationsStrings.push(`${action} — ${justification}`);
    detailed.push({
      id: product.id,
      action,
      justification,
      estimatedFinancialImpact: `N/A`,
      executionTime: `ongoing`,
      risk: 'low',
    });
  }

  // 5) Giro lento e constante detection: small positive VVD and low trend -> monitor
  // const lowVvdThreshold = 0.1; // arbitrary low but positive
  if (
    overallVvd > 0 &&
    overallVvd <= 1 &&
    Math.abs(metrics.trend) < 0.2 &&
    !(
      detailed.length &&
      detailed.some((d) => d.action?.startsWith('Reorder') || d.action?.startsWith('Liquidate'))
    )
  ) {
    // Only add monitor if nothing higher priority exists
    const action = `Monitorar - giro lento e constante`;
    const justification = `VVD ${overallVvd.toFixed(2)} u/dia, tendência ${(
      metrics.trend * 100
    ).toFixed(0)}%`;
    recommendationsStrings.push(`${action} — ${justification}`);
    detailed.push({
      id: product.id,
      action,
      justification,
      estimatedFinancialImpact: `N/A`,
      executionTime: `ongoing`,
      risk: 'low',
    });
  }

  // If still no detailed recommendation, default to Monitor
  if (detailed.length === 0) {
    const action = `Monitorar`;
    const justification = `Sem ação clara. VVD30 ${vvd30.toFixed(2)}, estoque ${stock}, dias parado ${
      metrics.idleDays === 9999 ? 'nenhuma venda registrada' : metrics.idleDays
    }`;
    recommendationsStrings.push(`${action} — ${justification}`);
    detailed.push({
      id: product.id,
      action,
      justification,
      estimatedFinancialImpact: `N/A`,
      executionTime: `ongoing`,
      risk: 'low',
    });
  }

  // Priority ordering: Reorder > Opportunity > Liquidate > Monitor
  const priority = [
    'Repor',
    'Oportunidade',
    'Liquidar',
    'Capital Parado',
    'Novo produto',
    'Monitorar',
    'giro lento',
  ];
  detailed.sort((a, b) => {
    const aScore = priority.findIndex((p) => (a.action ?? '').includes(p));
    const bScore = priority.findIndex((p) => (b.action ?? '').includes(p));
    return (aScore === -1 ? 99 : aScore) - (bScore === -1 ? 99 : bScore);
  });

  // choose the first as final recommendation
  const final = detailed[0];

  // Compose final RecommendationResult
  const recommendation: RecommendationResult = {
    id: product.id,
    action: final.action,
    justification: final.justification,
    estimatedFinancialImpact: final.estimatedFinancialImpact,
    executionTime: final.executionTime,
    risk: final.risk,
  };

  // Return full evaluation
  return {
    productId: product.id,
    productSku: product.sku,
    productName: product.name,
    metrics,
    recommendationsStrings,
    recommendation,
  };
}

/**
 * Evaluate all products and generate recommendations.
 * @param products - Array of products to evaluate
 * @param salesBySku - Record mapping product SKU to sales history
 * @param stockBalances - Array of stock balance records
 * @returns Array of product evaluation results
 */
export async function evaluateAllProducts(
  products: Product[],
  salesBySku: Record<string, SalesHistory[]>,
  stockBalances: StockBalance[] = []
): Promise<ProductEvaluation[]> {
  // build stock map
  const stockMap: Record<string, StockBalance> = {};
  for (const s of stockBalances) {
    if (s.productSku) stockMap[s.productSku] = s;
  }

  const results: ProductEvaluation[] = [];
  for (const p of products) {
    const sku = p.sku ?? '';
    const history = salesBySku[sku] ?? [];
    const stockOverride = stockMap[sku] ?? null;
    const evalRes = await evaluateProduct(p, history, stockOverride);
    results.push(evalRes);
  }
  return results;
}
