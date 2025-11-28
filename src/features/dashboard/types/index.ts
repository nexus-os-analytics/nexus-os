export type AlertType = 'RUPTURE' | 'DEAD_STOCK' | 'OPPORTUNITY';
export type AlertTypeLabel = 'Ruptura' | 'Dinheiro parado' | 'Oportunidade';

export type RuptureRisk =
  | 'CRITICAL' // mapeia BlingRuptureRisk.CRITICAL
  | 'HIGH' // mapeia BlingRuptureRisk.HIGH
  | 'MEDIUM' // mapeia BlingRuptureRisk.MEDIUM
  | 'LOW'; // mapeia BlingRuptureRisk.LOW

export type RecommendationRiskLabel = 'alto' | 'médio' | 'baixo' | 'crítico';

export interface Product {
  // internal
  id: string;
  blingProductId?: number; // id externo do Bling (numérico) — útil para relookup
  sku?: string;
  name: string;
  imageUrl?: string | null;
  shortDescription?: string | null;
  categoryName?: string | null;

  // preços / estoque (valores numéricos crus)
  costPrice?: number | null; // custo unitário
  salePrice?: number | null; // preço de venda atual
  stock?: number; // total em estoque local (inteiro)
  avgMonthlySales?: number | null; // se disponível
  lastSaleDate?: string | null; // ISO string

  // metadados
  integrationId?: string; // id da integração (opcional)
  productSettings?: {
    leadTimeDays?: number;
    safetyDays?: number;
    recoveryTarget?: number;
    opportunityGrowthThreshold?: number;
    liqdationIdleThresholdDays?: number;
    minSalesForOpportunity?: number;
    newProductMinDays?: number;
  } | null;
}

// Métricas calculadas (engine)
export interface AlertMetrics {
  // tempo sem venda
  idleDays: number; // número de dias sem venda (9999 para 'nenhuma venda registrada')

  // giro/estoque
  stockCoverageDays: number; // quantos dias o estoque atual cobre (considerando VVD real)
  stockTurnover: number; // média mensal / estoque (ex.: 0.4)
  daysWithStock?: number; // número de dias com estoque > 0 no período analisado
  totalDaysAnalyzed?: number; // total de dias considerados no cálculo (ex.: 30)

  // vendas por dia
  vvd?: number; // VVD real (dias com estoque)
  vvdSimple?: number; // VVD simplificada (total / totalDias) — opcional
  vvd7?: number;
  vvd30?: number;
  vvd90?: number;

  // tendência
  trend?: number; // -1..+inf (ex.: 0.25 = +25%)

  // financeiro
  capitalStuck?: number; // R$ empatado = stock * costPrice

  // confiança dos dados (0..1)
  dataConfidence?: number;
}

// Resultado do motor de precificação (V2)
export interface PricingScenario {
  price: number;
  recoveryAmount: number; // valor R$ recuperado nesse cenário
  recoveryPercentOfCapital?: number; // % do capital recuperado
  probabilityOfSale?: number; // 0..1
  daysToExecute?: number;
}

export interface PricingRecommendation {
  optimalPrice?: number;
  capitalRecoveryPercent?: number; // 0..1
  probabilityOfSale?: number; // 0..1
  recommendedDays?: number; // horizonte ideal
  discountPercent?: number; // 0..100
  expectedRevenue?: number; // R$
  scenarios?: PricingScenario[];
  feasible?: boolean;
  reasonNotFeasible?: string | null;
}

// Estrutura de recomendação final e lista de recomendações "to persist"
export interface FinalRecommendation {
  action?: string; // texto já em português, pronto para mostrar
  justification?: string; // justificativa em português
  estimatedFinancialImpact?: string; // texto com R$
  executionTime?: string; // texto, ex: "15 dias (lead time)"
  risk?: RuptureRisk | 'low' | 'medium' | 'high'; // mantém compatibilidade com engine
  riskLabel?: RecommendationRiskLabel; // mapeado para exibição (pt)
}

// Estrutura completa do alert que a  receberá
export interface ProductAlert {
  // Alert (bling_alerts)
  id: string; // ud do alerta
  productId: string; // ud interno do produto
  blingProductId?: number; // id numérico do bling (se disponível)
  type: AlertType; // tipo técnico (não traduzir; usado em lógica)
  typeLabel: AlertTypeLabel; // label em português para exibição
  risk?: RuptureRisk | null; // nível técnico (CRITICAL/HIGH/MEDIUM/LOW)
  riskLabel?: RecommendationRiskLabel | null; // label pt (alto/médio/baixo/crítico)

  // Conteúdo humano para exibição
  recommendationsStrings: string[]; // array de textos (já em pt)
  finalRecommendation?: FinalRecommendation | null;

  // Produto embutido (facilita consumo no front)
  product: Product;

  // Métricas calculadas pela engine
  metrics: AlertMetrics;

  // Pricing engine
  pricingRecommendation?: PricingRecommendation | null;

  // Sinalizadores / flags
  acknowledged?: boolean; // se o usuário reconheceu
  executedAt?: string | null; // ISO when an automated execution was run
  generatedAt: string; // ISO (quando o alerta foi gerado)
  createdAt?: string;
  updatedAt?: string;
}

// Resposta para endpoint de infinite scroll
export interface InfiniteAlertsResponse {
  data: ProductAlert[];
  // cursor: usar generatedAt ou id para próxima página (cursor-based)
  nextCursor?: string | null; // por exemplo: last generatedAt ISO ou last alert.id
  hasMore: boolean;
  total?: number; // opcional: total aproximado (se disponível)
}
