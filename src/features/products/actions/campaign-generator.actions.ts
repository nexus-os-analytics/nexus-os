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

  const { product, strategy, toneOfVoice, customInstructions } = data;

  const system = [
    'Você é um assistente de marketing especializado em varejo brasileiro.',
    'Gere três textos curtos e objetivos em PT-BR para campanha:',
    '- instagram: post para Instagram ou Facebook (máx ~500 caracteres).',
    '- email: ASSUNTO de email marketing curto (máx ~80 caracteres).',
    '- remarketing: texto para banner/ads com escassez e CTA (máx ~200 caracteres).',
    'Responda APENAS com um objeto JSON com as chaves {"instagram","email","remarketing"}.',
  ].join('\n');

  const user = [
    `Produto: ${product.name} (SKU: ${product.sku})`,
    product.categoryName ? `Categoria: ${product.categoryName}` : undefined,
    `Preço de venda: R$ ${product.salePrice.toFixed(2)}`,
    `Preço de custo: R$ ${product.costPrice.toFixed(2)}`,
    product.currentStock != null ? `Estoque atual: ${product.currentStock}` : undefined,
    `Estratégia: ${strategy}`,
    `Tom de voz: ${toneOfVoice}`,
    customInstructions ? `Instruções adicionais: ${customInstructions}` : undefined,
    'Inclua números/percentuais quando fizer sentido. Evite informações falsas. Não use links reais.',
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
