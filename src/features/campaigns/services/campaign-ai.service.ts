/**
 * Campaign AI Generation Service
 *
 * Generates campaign copy using OpenAI based on PRD v2.0 specifications
 * Produces 3 variations for A/B testing
 */

import type { BlingProduct, BlingAlert, CampaignType } from '@prisma/client';
import type { ToneOfVoice, AdVariation } from '../types';
import { generateText } from '@/lib/openai';
import { randomUUID } from 'crypto';

interface GenerateCampaignParams {
  type: CampaignType;
  product: BlingProduct & { alert: BlingAlert | null };
  discountPercentage?: number;
  increasePercentage?: number;
  toneOfVoice: ToneOfVoice;
  customInstructions?: string;
}

interface AIResponse {
  variations: Array<{
    title: string;
    body: string;
    cta: string;
  }>;
}

/**
 * Generate campaign variations using AI
 */
export async function generateCampaignVariations(
  params: GenerateCampaignParams
): Promise<AdVariation[]> {
  const prompt = buildPromptForType(params);

  try {
    const result = await generateText(
      [
        {
          role: 'system',
          content:
            'Você é um copywriter expert em e-commerce brasileiro. Responda APENAS com JSON válido no formato especificado. Não adicione texto fora do JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      {
        temperature: 0.3,
        maxTokens: 2000,
      }
    );

    // Parse JSON response
    const parsed = JSON.parse(result) as AIResponse;

    // Add IDs to variations
    return parsed.variations.map((variation) => ({
      id: randomUUID(),
      ...variation,
    }));
  } catch (error) {
    console.error('Error generating campaign:', error);
    throw new Error('Falha ao gerar campanha. Tente novamente.');
  }
}

/**
 * Build prompt based on campaign type
 */
function buildPromptForType(params: GenerateCampaignParams): string {
  const { type } = params;

  if (type === 'LIQUIDATION') {
    return buildLiquidationPrompt(params);
  } else {
    return buildOpportunityPrompt(params);
  }
}

/**
 * Build prompt for LIQUIDATION campaigns
 */
function buildLiquidationPrompt(params: GenerateCampaignParams): string {
  const { product, discountPercentage, toneOfVoice, customInstructions } = params;

  const alert = product.alert;
  if (!alert) {
    throw new Error('Alert data required for liquidation campaign');
  }

  const originalPrice = product.salePrice;
  const finalPrice = originalPrice * (1 - discountPercentage! / 100);
  const savings = originalPrice - finalPrice;

  const alertContext =
    alert.type === 'DEAD_STOCK'
      ? `Dias sem venda: ${alert.daysSinceLastSale}
Capital parado: R$ ${alert.capitalStuck.toFixed(2)}`
      : `Excesso de estoque: ${alert.excessPercentage?.toFixed(0)}%
Capital em excesso: R$ ${alert.excessCapital.toFixed(2)}`;

  return `
Você é um copywriter expert em e-commerce especializado em campanhas de liquidação.

CONTEXTO:
Produto: ${product.name}
SKU: ${product.sku}
Situação: ${alert.type === 'DEAD_STOCK' ? 'Capital Parado (sem vendas)' : 'Excesso de Estoque'}
Preço original: R$ ${originalPrice.toFixed(2)}
Desconto aplicado: ${discountPercentage}%
Preço final: R$ ${finalPrice.toFixed(2)}
Economia: R$ ${savings.toFixed(2)}
${alertContext}
Tom de voz: ${getToneDescription(toneOfVoice)}

${customInstructions ? `INSTRUÇÕES ADICIONAIS:\n${customInstructions}\n` : ''}

OBJETIVO:
Criar anúncio persuasivo para liquidar este produto e recuperar capital parado.

DIRETRIZES:
1. Destaque o desconto de forma atrativa (use ${discountPercentage}%)
2. Crie senso de urgência ("tempo limitado", "estoque limitado", "últimas unidades")
3. Enfatize a economia em reais (R$ ${savings.toFixed(2)} de economia)
4. Use emojis moderadamente (2-3 por texto máximo)
5. CTA forte e direto ("COMPRAR AGORA", "APROVEITAR OFERTA", "GARANTIR O MEU")
6. Máximo 150 palavras por variação
7. Adapte o tom para: ${getToneDescription(toneOfVoice)}

ESTRUTURA:
- Título chamativo com desconto
- Preço (de-por) com destaque
- Benefícios do produto (2-4 itens curtos)
- Senso de urgência
- CTA impactante

IMPORTANTE: Gere 3 VARIAÇÕES DIFERENTES para teste A/B. Cada variação deve ter abordagem única.

Formato JSON (OBRIGATÓRIO):
{
  "variations": [
    {
      "title": "Título da variação 1",
      "body": "Corpo do anúncio da variação 1 com detalhes do produto e benefícios",
      "cta": "CTA da variação 1"
    },
    {
      "title": "Título da variação 2",
      "body": "Corpo do anúncio da variação 2 com abordagem diferente",
      "cta": "CTA da variação 2"
    },
    {
      "title": "Título da variação 3",
      "body": "Corpo do anúncio da variação 3 com outra abordagem",
      "cta": "CTA da variação 3"
    }
  ]
}
`;
}

/**
 * Build prompt for OPPORTUNITY campaigns
 */
function buildOpportunityPrompt(params: GenerateCampaignParams): string {
  const { product, increasePercentage, toneOfVoice, customInstructions } = params;

  const alert = product.alert;
  if (!alert) {
    throw new Error('Alert data required for opportunity campaign');
  }

  const originalPrice = product.salePrice;
  const finalPrice = originalPrice * (1 + increasePercentage! / 100);

  return `
Você é um copywriter expert em e-commerce especializado em produtos de alta demanda.

CONTEXTO:
Produto: ${product.name}
SKU: ${product.sku}
Situação: OPORTUNIDADE (Alta demanda e crescimento)
Crescimento: ${alert.growthTrend?.toFixed(0)}%
VVD (Velocidade de Venda Diária): ${alert.vvdReal.toFixed(1)} unidades/dia
Preço original: R$ ${originalPrice.toFixed(2)}
Novo preço: R$ ${finalPrice.toFixed(2)} (+${increasePercentage}%)
Tom de voz: ${getToneDescription(toneOfVoice)}

${customInstructions ? `INSTRUÇÕES ADICIONAIS:\n${customInstructions}\n` : ''}

OBJETIVO:
Criar anúncio que posicione este produto como exclusivo/premium e justifique o preço pela alta demanda.

DIRETRIZES:
1. Enfatize exclusividade e alta procura ("Produto mais procurado", "Best-seller", "Em alta")
2. Justifique o preço pela qualidade, demanda e escassez
3. Crie FOMO (fear of missing out) - "Pode acabar", "Últimas unidades", "Alta procura"
4. Destaque diferenciais únicos do produto
5. Use social proof sutil ("Favorito dos clientes", "Alta avaliação")
6. Use emojis moderadamente (2-3 por texto máximo)
7. Máximo 150 palavras por variação
8. Adapte o tom para: ${getToneDescription(toneOfVoice)}

ESTRUTURA:
- Título que destaca popularidade/exclusividade
- Preço com contexto de valor ("investimento", "qualidade premium")
- Diferenciais únicos (3-5 bullet points)
- Social proof ou escassez
- CTA com urgência

IMPORTANTE: NÃO mencione o aumento de preço. Apresente como preço justo pela qualidade/demanda.
Gere 3 VARIAÇÕES DIFERENTES para teste A/B. Cada variação deve ter abordagem única.

Formato JSON (OBRIGATÓRIO):
{
  "variations": [
    {
      "title": "Título da variação 1",
      "body": "Corpo do anúncio da variação 1 focando em exclusividade",
      "cta": "CTA da variação 1"
    },
    {
      "title": "Título da variação 2",
      "body": "Corpo do anúncio da variação 2 focando em demanda/escassez",
      "cta": "CTA da variação 2"
    },
    {
      "title": "Título da variação 3",
      "body": "Corpo do anúncio da variação 3 focando em qualidade premium",
      "cta": "CTA da variação 3"
    }
  ]
}
`;
}

/**
 * Get tone description for prompt
 */
function getToneDescription(tone: ToneOfVoice): string {
  switch (tone) {
    case 'urgent':
      return 'URGENTE - Use palavras de ação imediata, crie urgência extrema, linguagem direta e imperativa';
    case 'promotional':
      return 'PROMOCIONAL - Foque em benefícios e economia, entusiástico mas profissional, destaque a oferta';
    case 'professional':
      return 'PROFISSIONAL - Tom sério e confiável, informativo, sem exageros, focado em fatos e qualidade';
    case 'friendly':
      return 'AMIGÁVEL - Tom casual e próximo, como conversa com amigo, use "você", seja acessível e simpático';
    default:
      return 'EQUILIBRADO - Tom neutro, profissional mas acessível';
  }
}
