export type ProductAlert = {
  id: string;
  type: 'rupture' | 'dead-stock' | 'opportunity';
  productName: string;
  sku: string;
  imageUrl?: string;
  category: string;

  // Campos comuns
  stockAmount?: number;
  costPrice?: number;
  sellingPrice?: number;
  dataConfidence?: number; // 0-1, confiabilidade dos dados

  // Risco de Ruptura - aprimorado V2
  daysRemaining?: number;
  vvd?: number; // VVD real (considerando apenas dias com estoque)
  vvdSimple?: number; // VVD simplificada (para comparação)
  replenishmentTime?: number;
  safetyDays?: number;
  reorderPoint?: number; // Ponto de pedido calculado
  riskLevel?: 'critical' | 'high' | 'moderate' | 'low';
  riskMessage?: string;
  daysWithStock?: number; // Quantos dias teve estoque no período
  totalDaysAnalyzed?: number; // Total de dias analisados

  // Dinheiro Parado - aprimorado V2
  capitalTied?: number;
  daysSinceLastSale?: number;
  lastSaleDate?: string;

  // Motor de Precificação (novo V2)
  pricingRecommendation?: {
    optimalPrice: number; // Preço ótimo sugerido
    capitalRecovery: number; // % de capital a recuperar
    probabilityOfSale: number; // 0-1, probabilidade de venda
    recommendedDays: number; // Prazo ótimo
    discount: number; // Desconto em %
    expectedRevenue: number; // Receita esperada
    scenarios?: Array<{
      price: number;
      recovery: number;
      probability: number;
      days: number;
    }>;
  };

  // Custos operacionais
  capitalCost?: number; // Custo do capital (% ao mês)
  storageCost?: number; // Custo de armazenamento (% ao mês)

  // Oportunidades - aprimorado V2
  salesGrowth?: number;
  vvdLast7Days?: number;
  vvdPrevious7Days?: number;
  daysOfStockRemaining?: number; // Dias de estoque restante
  isNewProduct?: boolean; // Produto novo (< 30 dias)
  suggestedActions?: string[]; // Ações sugeridas
};

// Configurações do usuário
export type UserSettings = {
  financial: {
    capitalCost: number; // % ao mês (default 3%)
    storageCost: number; // % ao mês (default 0.5%)
  };
  operational: {
    defaultReplenishmentTime: number; // dias (default 15)
    safetyDays: number; // dias (default 5)
  };
  goals: {
    recoveryTarget: number; // % (default 80%)
    maxLiquidationDays: number; // dias (default 30)
  };
};

// Dados do First Impact
export type FirstImpactData = {
  capitalTied: number; // Total de capital parado
  ruptureCount: number; // Produtos em risco de ruptura
  opportunityCount: number; // Oportunidades detectadas
  topActions: Array<{
    productName: string;
    action: string;
    impact: string;
  }>;
};

export type CampaignStrategy = 'aggressive-liquidation' | 'strategic-combo' | 'checkout-upsell';

export type CampaignOutput = {
  instagram: string;
  email: string;
  remarketing: string;
};

export type ToneOfVoice =
  | 'urgent-direct'
  | 'friendly-casual'
  | 'professional-technical'
  | 'enthusiastic-emotional';
