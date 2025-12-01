import { BlingAlertType, BlingRuptureRisk, BlingSyncStatus } from '@prisma/client';
import pino from 'pino';
import { evaluateAllProducts } from '@/lib/bling';
import type {
  Product as EngineProduct,
  SalesHistory as EngineSale,
  StockBalance as EngineStock,
  ProductEvaluation,
  ProductSettings,
} from '@/lib/bling/bling-types';
import prisma from '@/lib/prisma';
import { inngest } from '../../client';

const logger = pino();

// =============================================
// TIPOS INTERNOS
// =============================================

interface AlertGenerationResult {
  alertsGenerated: number;
  errorsCount: number;
  totalProducts: number;
}

interface DatabaseData {
  products: any[];
  sales: any[];
  stockBalances: any[];
}

interface EngineData {
  products: EngineProduct[];
  salesBySku: Record<string, EngineSale[]>;
  stockBalances: EngineStock[];
  productSettings: Record<number, ProductSettings>;
}

interface IdMappings {
  skuToBlingId: Record<string, number>;
  dbIdToBlingId: Record<string, number>;
  blingIdToDbId: Record<number, string>;
}

// =============================================
// FUNÇÕES DE MAPEAMENTO DE DADOS
// =============================================

/**
 * Mapeia produto do Prisma para formato do motor
 */
function mapProductToEngine(product: any): EngineProduct {
  const blingIdNum = Number(product.blingProductId) || 0;

  return {
    id: blingIdNum,
    name: product.name,
    sku: product.sku,
    costPrice: product.costPrice ?? 0,
    salePrice: product.salePrice ?? 0,
    stock: product.stock ?? 0,
    image: product.image ?? null,
    shortDescription: product.shortDescription ?? null,
    avgMonthlySales: product.avgMonthlySales ?? 0,
    lastSaleDate: product.lastSaleDate ? product.lastSaleDate.toISOString() : null,
    categoryId: null,
    replenishmentTime: product.replenishmentTime ?? undefined,
    safetyStock: product.safetyStock ?? undefined,
    capitalCostRate: product.capitalCostRate ?? undefined,
    storageCostRate: product.storageCostRate ?? undefined,
    isActive: product.isActive ?? true,
  };
}

/**
 * Mapeia venda do Prisma para formato do motor
 */
function mapSaleToEngine(sale: any, skuToBlingId: Record<string, number>): EngineSale | null {
  const sku = sale.productSku ?? 'unknown';
  if (sku === 'unknown') return null;

  const blingProductId = skuToBlingId[sku] ?? 0;
  if (blingProductId === 0) return null;

  return {
    id: Number(sale.blingSaleId) || Date.now() + Math.random(),
    date: sale.date.toISOString(),
    productId: blingProductId,
    productSku: sku,
    quantity: sale.quantity,
    totalValue: sale.totalValue,
  };
}

/**
 * Mapeia estoque do Prisma para formato do motor
 */
function mapStockBalanceToEngine(
  stockBalance: any,
  dbIdToBlingId: Record<string, number>
): EngineStock | null {
  const blingId = dbIdToBlingId[stockBalance.productId] ?? 0;
  if (blingId === 0) return null;

  return {
    productId: blingId,
    productSku: stockBalance.productSku,
    stock: stockBalance.stock,
  };
}

/**
 * Mapeia configurações do produto do Prisma
 */
function mapProductSettings(settings: any): ProductSettings {
  return {
    leadTimeDays: settings.leadTimeDays,
    safetyDays: settings.safetyDays,
    recoveryTarget: settings.recoveryTarget,
    opportunityGrowthThreshold: settings.opportunityGrowthThreshold,
    liquidationIdleThresholdDays: settings.liquidationIdleThresholdDays,
    liquidationMaxDays: settings.liquidationMaxDays,
    minSalesForOpportunity: settings.minSalesForOpportunity,
    newProductMinDays: settings.newProductMinDays,
    minHistoryDaysForDecision: settings.minHistoryDaysForDecision,
  };
}

// =============================================
// FUNÇÕES DE PROCESSAMENTO DE DADOS
// =============================================

/**
 * Carrega dados do banco para uma integração
 */
async function loadDatabaseData(integrationId: string): Promise<DatabaseData> {
  const products = await prisma.blingProduct.findMany({
    where: { integrationId },
    include: {
      stockBalances: true,
      settings: true,
    },
  });

  if (!products || products.length === 0) {
    throw new Error(`No products found for integration ${integrationId}`);
  }

  const productDbIds = products.map((p) => p.id);

  const [sales, stockBalances] = await Promise.all([
    prisma.blingSalesHistory.findMany({
      where: { productId: { in: productDbIds } },
      orderBy: { date: 'asc' },
    }),
    prisma.blingStockBalance.findMany({
      where: { productId: { in: productDbIds } },
    }),
  ]);

  return { products, sales, stockBalances };
}

/**
 * Constrói mapeamentos de IDs
 */
function buildIdMappings(products: any[]): IdMappings {
  const skuToBlingId: Record<string, number> = {};
  const dbIdToBlingId: Record<string, number> = {};
  const blingIdToDbId: Record<number, string> = {};

  for (const product of products) {
    const blingIdNum = Number(product.blingProductId) || 0;
    skuToBlingId[product.sku] = blingIdNum;
    dbIdToBlingId[product.id] = blingIdNum;
    if (blingIdNum) blingIdToDbId[blingIdNum] = product.id;
  }

  return { skuToBlingId, dbIdToBlingId, blingIdToDbId };
}

/**
 * Prepara dados para o motor de avaliação
 */
function prepareEngineData(dbData: DatabaseData, idMappings: IdMappings): EngineData {
  const { products, sales, stockBalances } = dbData;
  const { skuToBlingId, dbIdToBlingId } = idMappings;

  // Mapear produtos
  const engineProducts = products.map(mapProductToEngine);

  // Mapear vendas por SKU
  const salesBySku: Record<string, EngineSale[]> = {};
  sales.forEach((sale) => {
    const engineSale = mapSaleToEngine(sale, skuToBlingId);
    if (!engineSale) return;

    const sku = engineSale.productSku;
    if (!salesBySku[sku]) salesBySku[sku] = [];
    salesBySku[sku].push(engineSale);
  });

  // Ordenar vendas por data
  Object.values(salesBySku).forEach((salesArray) => {
    salesArray.sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());
  });

  // Mapear estoques
  const engineStockBalances = stockBalances
    .map((stock) => mapStockBalanceToEngine(stock, dbIdToBlingId))
    .filter(Boolean) as EngineStock[];

  // Mapear configurações
  const productSettings: Record<number, ProductSettings> = {};
  products.forEach((product) => {
    if (product.settings) {
      const blingId = Number(product.blingProductId);
      if (blingId) {
        productSettings[blingId] = mapProductSettings(product.settings);
      }
    }
  });

  return {
    products: engineProducts,
    salesBySku,
    stockBalances: engineStockBalances,
    productSettings,
  };
}

// =============================================
// FUNÇÕES DE PERSISTÊNCIA
// =============================================

/**
 * Mapeia risco para enum do Prisma
 */
function mapToRiskEnum(risk?: 'low' | 'medium' | 'high'): BlingRuptureRisk {
  if (!risk) return BlingRuptureRisk.LOW;
  if (risk === 'high') return BlingRuptureRisk.CRITICAL;
  if (risk === 'medium') return BlingRuptureRisk.HIGH;
  return BlingRuptureRisk.LOW;
}

/**
 * Mapeia risco para label legível
 */
function mapToRiskLabel(risk?: 'low' | 'medium' | 'high'): string {
  if (!risk) return 'baixo';
  if (risk === 'high') return 'crítico';
  if (risk === 'medium') return 'alto';
  return 'baixo';
}

/**
 * Determina tipo de alerta baseado na avaliação
 */
function mapToAlertType(evaluation: ProductEvaluation): BlingAlertType {
  const { action = '', justification = '' } = evaluation.recommendation || {};
  const actionLower = action.toLowerCase();
  const justificationLower = justification.toLowerCase();

  if (actionLower.includes('repor') || justificationLower.includes('ruptura')) {
    return BlingAlertType.RUPTURE;
  }

  if (
    actionLower.includes('capital parado') ||
    actionLower.includes('liquidar') ||
    actionLower.includes('desconto') ||
    justificationLower.includes('sem vendas')
  ) {
    return BlingAlertType.DEAD_STOCK;
  }

  if (actionLower.includes('oportunidade') || actionLower.includes('testar')) {
    return BlingAlertType.OPPORTUNITY;
  }

  // Fallback baseado em métricas
  if (evaluation.metrics.idleDays >= 90) return BlingAlertType.DEAD_STOCK;
  if (evaluation.metrics.daysRemaining !== null && evaluation.metrics.daysRemaining <= 10) {
    return BlingAlertType.RUPTURE;
  }

  return BlingAlertType.OPPORTUNITY;
}

/**
 * Sanitiza métricas para JSON
 */
function sanitizeMetrics(metrics: any): any {
  if (!metrics || typeof metrics !== 'object') return metrics;

  const sanitized: Record<string, any> = {};
  for (const [key, value] of Object.entries(metrics)) {
    if (typeof value === 'number') {
      sanitized[key] = Number.isFinite(value) ? value : null;
    } else {
      sanitized[key] = value;
    }
  }
  return sanitized;
}

/**
 * Persiste avaliação como alerta no banco
 */
async function persistEvaluationAsAlert(
  evaluation: ProductEvaluation,
  blingIdToDbId: Record<number, string>,
  jobId?: string
): Promise<string | null> {
  const internalProductId = blingIdToDbId[evaluation.productId];
  if (!internalProductId) {
    logger.warn(
      `No internal product ID for bling ID ${evaluation.productId}, SKU: ${evaluation.productSku}`
    );
    return null;
  }

  const alertType = mapToAlertType(evaluation);
  const riskEnumValue = mapToRiskEnum(evaluation.recommendation?.risk);
  const riskLabel = mapToRiskLabel(evaluation.recommendation?.risk);

  const sanitizedMetrics = sanitizeMetrics(evaluation.metrics);
  const sanitizedRecommendation = evaluation.recommendation
    ? {
        ...evaluation.recommendation,
        financialImpactValue: Number.isFinite(evaluation.recommendation.financialImpactValue)
          ? evaluation.recommendation.financialImpactValue
          : 0,
      }
    : null;

  const result = await prisma.blingAlert.upsert({
    where: { productId: internalProductId },
    create: {
      productId: internalProductId,
      type: alertType,
      risk: riskEnumValue,
      riskLabel,
      recommendations: JSON.stringify(evaluation.recommendationsStrings),
      finalRecommendation: JSON.stringify(sanitizedRecommendation),
      metrics: JSON.stringify(sanitizedMetrics),
      pricing: JSON.stringify(null),
      generatedAt: new Date(),
      jobId: jobId ?? null,
      acknowledged: false,
    },
    update: {
      type: alertType,
      risk: riskEnumValue,
      riskLabel,
      recommendations: JSON.stringify(evaluation.recommendationsStrings),
      finalRecommendation: JSON.stringify(sanitizedRecommendation),
      metrics: JSON.stringify(sanitizedMetrics),
      pricing: JSON.stringify(null),
      generatedAt: new Date(),
      jobId: jobId ?? null,
      acknowledged: false,
    },
  });

  logger.debug(
    `Upserted alert for product ${evaluation.productSku}, type: ${alertType}, risk: ${riskEnumValue}`
  );
  return result.id;
}

// =============================================
// FUNÇÃO PRINCIPAL
// =============================================

export const generateAlerts = inngest.createFunction(
  {
    id: 'bling/generate-alerts',
    concurrency: 1,
  },
  { event: 'bling/generate-alerts' },
  async ({ event, step }) => {
    const { integrationId, userId, jobId } = event.data;
    const result: AlertGenerationResult = {
      alertsGenerated: 0,
      errorsCount: 0,
      totalProducts: 0,
    };

    logger.info(
      `Starting alert generation for integration ${integrationId}, user ${userId}, job ${jobId}`
    );

    try {
      // 1. CARREGAR DADOS
      logger.info(`Loading database data for integration ${integrationId}`);
      const dbData = await loadDatabaseData(integrationId);
      result.totalProducts = dbData.products.length;

      logger.info(
        `Loaded ${dbData.products.length} products, ${dbData.sales.length} sales, ${dbData.stockBalances.length} stock balances`
      );

      // 2. PREPARAR DADOS
      const idMappings = buildIdMappings(dbData.products);
      const engineData = prepareEngineData(dbData, idMappings);

      const productsWithSales = engineData.products.filter(
        (p) => engineData.salesBySku[p.sku]?.length > 0
      );
      logger.info(
        `${productsWithSales.length}/${engineData.products.length} products have sales history`
      );

      // 3. EXECUTAR MOTOR
      logger.info(`Running price engine for ${engineData.products.length} products`);
      const evaluations = await evaluateAllProducts(
        engineData.products,
        engineData.salesBySku,
        engineData.stockBalances
      );
      logger.info(`Engine completed, generated ${evaluations.length} evaluations`);

      // 4. PERSISTIR ALERTAS
      const upserted: string[] = [];
      const errors: string[] = [];

      for (const evaluation of evaluations) {
        try {
          const alertId = await persistEvaluationAsAlert(
            evaluation,
            idMappings.blingIdToDbId,
            jobId
          );
          if (alertId) upserted.push(alertId);
        } catch (error) {
          const errorMsg = `Failed to persist alert for ${evaluation.productSku}: ${typeof error === 'string' ? error : (error as Error).message}`;
          logger.error({ error, productSku: evaluation.productSku }, errorMsg);
          errors.push(errorMsg);
        }
      }

      result.alertsGenerated = upserted.length;
      result.errorsCount = errors.length;

      logger.info(`Persisted ${upserted.length} alerts with ${errors.length} errors`);

      if (errors.length > 0) {
        logger.warn({ errors: errors.slice(0, 5) }, `First 5 errors during alert generation`);
      }

      // 5. ATUALIZAR STATUS E EMITIR EVENTO
      await step.sendEvent('bling/sync:complete', {
        name: 'bling/sync:complete',
        data: {
          userId,
          integrationId,
          jobId,
          ...result,
        },
      });

      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: { blingSyncStatus: BlingSyncStatus.COMPLETED },
        });
      }

      logger.info(`Alert generation completed successfully for integration ${integrationId}`);
      return result;
    } catch (error) {
      logger.error({ error, integrationId, jobId }, 'Alert generation failed');

      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: { blingSyncStatus: BlingSyncStatus.FAILED },
        });
      }

      throw error;
    }
  }
);
