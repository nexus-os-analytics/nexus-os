'use server';

import {
  type GenerateProductCampaignInput,
  GenerateProductCampaignSchema,
} from '@/features/products/schemas/product-campaign-generator.schema';
import type { CampaignOutput } from '@/features/products/types';
import { generateText } from '@/lib/openai';

function extractJson(content: string): Record<string, unknown> {
  // Remove Markdown code fences if present
  const cleaned = content
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```\s*$/i, '')
    .trim();
  try {
    return JSON.parse(cleaned) as Record<string, unknown>;
  } catch {
    // Try to find the first JSON object substring
    const match = cleaned.match(/\{[\s\S]*\}/);
    if (match) {
      return JSON.parse(match[0]) as Record<string, unknown>;
    }
    throw new Error('Failed to parse JSON from OpenAI response');
  }
}

export async function generateProductCampaignAction(input: unknown): Promise<CampaignOutput> {
  const data = GenerateProductCampaignSchema.parse(input as GenerateProductCampaignInput);

  const { product, strategy, toneOfVoice, customInstructions, alert } = data;

  const system = [
    'Você é um assistente de marketing especializado em varejo brasileiro.',
    'Gere três textos curtos e objetivos em PT-BR para campanha:',
    '- instagram: post para Instagram ou Facebook (máx ~500 caracteres).',
    '- email: ASSUNTO de email marketing curto (máx ~80 caracteres).',
    '- remarketing: texto para banner/ads com escassez e CTA (máx ~200 caracteres).',
    'Responda APENAS com um objeto JSON com as chaves {"instagram","email","remarketing"}.',
  ].join('\n');

  // Compute margin (approx.)
  const PERCENT_BASE = 100;
  const marginPct =
    product.salePrice > 0
      ? Number(
          (((product.salePrice - product.costPrice) / product.salePrice) * PERCENT_BASE).toFixed(2)
        )
      : 0;

  // Calculate suggested promotional price based on alert type and default rules
  let suggestedPrice = product.salePrice;
  let discountPct = 0;
  let priceIncreasePct = 0;

  if (alert?.type === 'OPPORTUNITY') {
    // OPPORTUNITY: 10% above current sale price (unless custom instructions override)
    priceIncreasePct = 10;
    suggestedPrice = product.salePrice * 1.1;
  } else if (alert?.type === 'LIQUIDATION') {
    // LIQUIDATION: 10% discount (unless custom instructions override)
    discountPct = typeof alert?.discountPct === 'number' ? alert.discountPct : 10;
    suggestedPrice = product.salePrice * (1 - discountPct / PERCENT_BASE);
  } else if (alert?.type === 'DEAD_STOCK') {
    // DEAD_STOCK: 30-40% discount (use alert discount or default to 35%)
    discountPct = typeof alert?.discountPct === 'number' ? alert.discountPct : 35;
    suggestedPrice = product.salePrice * (1 - discountPct / PERCENT_BASE);
  } else if (typeof alert?.discountPct === 'number') {
    // Use alert discount if available for other types
    discountPct = alert.discountPct;
    suggestedPrice = product.salePrice * (1 - discountPct / PERCENT_BASE);
  }

  const user = [
    `Produto: ${product.name} (SKU: ${product.sku})`,
    product.categoryName ? `Categoria: ${product.categoryName}` : undefined,
    `Preço atual: R$ ${product.salePrice.toFixed(2)}`,
    `Preço de custo: R$ ${product.costPrice.toFixed(2)}`,
    product.currentStock != null ? `Estoque atual: ${product.currentStock}` : undefined,
    `Margem estimada: ${marginPct}%`,
    alert?.type ? `Tipo de alerta: ${alert.type}` : undefined,
    // Pricing rules based on alert type
    alert?.type === 'OPPORTUNITY'
      ? `REGRA DE PREÇO: Aumentar 10% sobre o preço atual (R$ ${suggestedPrice.toFixed(2)}). Objetivo: maximizar margem com alta demanda.`
      : undefined,
    alert?.type === 'LIQUIDATION'
      ? `REGRA DE PREÇO: Aplicar ${discountPct}% de desconto (R$ ${suggestedPrice.toFixed(2)}). Objetivo: liquidar excesso de estoque.`
      : undefined,
    alert?.type === 'DEAD_STOCK'
      ? `REGRA DE PREÇO: Aplicar ${discountPct}% de desconto (30-40% recomendado: R$ ${suggestedPrice.toFixed(2)}). Objetivo: recuperar capital parado.`
      : undefined,
    discountPct > 0 && alert?.type !== 'OPPORTUNITY'
      ? `Desconto aplicado: ${discountPct}% (Economia de R$ ${(product.salePrice - suggestedPrice).toFixed(2)})`
      : undefined,
    priceIncreasePct > 0
      ? `Acréscimo aplicado: ${priceIncreasePct}% (por alta demanda e baixo estoque)`
      : undefined,
    `Preço promocional sugerido: R$ ${suggestedPrice.toFixed(2)}`,
    // Urgency and performance signals
    typeof alert?.daysRemaining === 'number' ? `Dias restantes: ${alert.daysRemaining}` : undefined,
    typeof alert?.estimatedDeadline === 'number'
      ? `Prazo estimado (dias): ${alert.estimatedDeadline}`
      : undefined,
    typeof alert?.growthTrend === 'number'
      ? `Tendência de crescimento: ${alert.growthTrend}`
      : undefined,
    typeof alert?.vvd7 === 'number' ? `VVD7: ${alert.vvd7}` : undefined,
    typeof alert?.vvd30 === 'number' ? `VVD30: ${alert.vvd30}` : undefined,
    typeof alert?.daysSinceLastSale === 'number'
      ? `Dias sem venda: ${alert.daysSinceLastSale}`
      : undefined,
    typeof alert?.capitalStuck === 'number'
      ? `Capital parado (R$): ${alert.capitalStuck}`
      : undefined,
    typeof alert?.excessUnits === 'number'
      ? `Excesso de unidades: ${alert.excessUnits}`
      : undefined,
    typeof alert?.excessPercentage === 'number'
      ? `Excesso (%): ${alert.excessPercentage}`
      : undefined,
    typeof alert?.excessCapital === 'number'
      ? `Excesso de capital (R$): ${alert.excessCapital}`
      : undefined,
    `Estratégia: ${strategy}`,
    `Tom de voz: ${toneOfVoice}`,
    customInstructions
      ? `INSTRUÇÕES PERSONALIZADAS (seguir obrigatoriamente): ${customInstructions}`
      : undefined,
    '',
    'DIRETRIZES DE PREÇO (use o preço promocional sugerido, exceto se instruções personalizadas indicarem diferente):',
    '- OPPORTUNITY: sempre mencione o aumento de 10% e destaque a alta demanda',
    '- LIQUIDATION: sempre mencione o desconto de 10% e crie senso de urgência',
    '- DEAD_STOCK (Capital Parado): sempre mencione desconto de 30-40% e urgência máxima para liquidar',
    '',
    'DIRETRIZES DE CONTEÚDO:',
    '- Use o preço promocional sugerido nos textos (já calculado acima)',
    '- Inclua números/percentuais quando fizer sentido',
    '- Para OPPORTUNITY: destaque benefícios, qualidade, escassez e valorize o produto',
    '- Para LIQUIDATION: destaque o desconto e crie urgência moderada',
    '- Para DEAD_STOCK: destaque o grande desconto e crie urgência máxima ("últimas unidades", "queima de estoque")',
    '- Evite informações falsas. Não use links reais.',
  ]
    .filter(Boolean)
    .join('\n');

  const content = await generateText(
    [
      { role: 'system', content: system },
      { role: 'user', content: user },
    ],
    { temperature: 0.3, maxTokens: 700 }
  );

  const json = extractJson(content);
  const instagram = (json.instagram ?? '') as string;
  const email = (json.email ?? '') as string;
  const remarketing = (json.remarketing ?? '') as string;

  if (!instagram || !email || !remarketing) {
    throw new Error('OpenAI response missing required fields');
  }

  return { instagram, email, remarketing };
}
