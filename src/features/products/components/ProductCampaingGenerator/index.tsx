'use client';
import {
  Badge,
  Box,
  Button,
  Group,
  Image,
  Loader,
  Paper,
  Select,
  Stack,
  Text,
  Textarea,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { Sparkles } from 'lucide-react';
import { useState } from 'react';
import { generateProductCampaignAction } from '@/features/products/actions/campaign-generator.actions';
import { ProductCampaignResults } from '@/features/products/components/ProductCampaingResults';
import { campaignStrategies, toneOfVoiceOptions } from '@/features/products/constants';
import type { CampaignOutput, CampaignStrategy, ToneOfVoice } from '@/features/products/types';
import type { BlingProductType } from '@/lib/bling';
import { formatCurrency } from '@/lib/utils';

interface ProductCampaingGeneratorProps {
  product: BlingProductType;
}

export function ProductCampaingGenerator({ product }: ProductCampaingGeneratorProps) {
  const [selectedStrategy, setSelectedStrategy] =
    useState<CampaignStrategy>('aggressive-liquidation');
  const [toneOfVoice, setToneOfVoice] = useState<ToneOfVoice>('urgent-direct');
  const [customInstructions, setCustomInstructions] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const [campaigns, setCampaigns] = useState<CampaignOutput | null>(null);

  const alertType = product.alert?.type;
  const baseSalePrice = product.salePrice;
  const discountPct = product.alert?.discount;
  const discountAmount = product.alert?.discountAmount;
  const PERCENT_BASE = 100;
  let promotionalPrice = product.alert?.suggestedPrice ?? baseSalePrice;

  // Adjust price based on alert type
  if (alertType === 'OPPORTUNITY') {
    // Add 10% to incentivize immediate purchase
    const INCREASE_PCT = 0.1;
    promotionalPrice = Number((baseSalePrice * (1 + INCREASE_PCT)).toFixed(2));
  } else if (alertType === 'LIQUIDATION' || alertType === 'DEAD_STOCK') {
    if (typeof discountPct === 'number' && discountPct > 0) {
      promotionalPrice = Number((baseSalePrice * (1 - discountPct / PERCENT_BASE)).toFixed(2));
    } else if (typeof discountAmount === 'number' && discountAmount > 0) {
      promotionalPrice = Number((baseSalePrice - discountAmount).toFixed(2));
    }
  }

  const handleGenerate = async () => {
    try {
      setIsGenerating(true);
      const input = {
        product: {
          name: product.name,
          sku: product.sku,
          categoryName: product.category?.name ?? null,
          // Use promotional/discounted price for campaign generation
          salePrice: promotionalPrice,
          costPrice: product.costPrice,
          currentStock: product.currentStock,
          image: product.image ?? null,
          blingProductId: product.blingProductId,
        },
        strategy: selectedStrategy,
        toneOfVoice,
        customInstructions: customInstructions || undefined,
        alert: product.alert
          ? {
              type: product.alert.type,
              discountPct: product.alert.discount ?? undefined,
              discountAmount: product.alert.discountAmount ?? undefined,
              daysRemaining: product.alert.daysRemaining ?? undefined,
              estimatedDeadline: product.alert.estimatedDeadline ?? undefined,
              growthTrend: product.alert.growthTrend ?? undefined,
              capitalStuck: product.alert.capitalStuck ?? undefined,
              vvdReal: product.alert.vvdReal ?? undefined,
              vvd30: product.alert.vvd30 ?? undefined,
              vvd7: product.alert.vvd7 ?? undefined,
              daysSinceLastSale: product.alert.daysSinceLastSale ?? undefined,
              excessUnits: product.alert.excessUnits ?? undefined,
              excessPercentage: product.alert.excessPercentage ?? undefined,
              excessCapital: product.alert.excessCapital ?? undefined,
            }
          : undefined,
      };
      const result = await generateProductCampaignAction(input);
      setCampaigns(result);
    } catch (_e) {
      // In production, surface a toast; here we simply reset state
      setCampaigns(null);
    } finally {
      setIsGenerating(false);
    }
  };

  if (campaigns) {
    return (
      <ProductCampaignResults
        product={product}
        strategy={selectedStrategy}
        toneOfVoice={toneOfVoice}
        customInstructions={customInstructions}
        campaigns={campaigns}
      />
    );
  }

  const selectedStrategyData = campaignStrategies.find((s) => s.value === selectedStrategy);

  return (
    <Stack gap="xl">
      <Box>
        <Group mb="xs">
          <ThemeIcon size={32} radius="md" variant="filled" color="brand">
            <Sparkles size={18} />
          </ThemeIcon>
          <Title order={2}>Gerador de Campanha com IA</Title>
        </Group>
        <Text size="sm" c="dimmed">
          Escolha a estratégia e o tom. Geraremos textos para Instagram, WhatsApp e Remarketing.
        </Text>
      </Box>

      <Paper p="md" radius="md" withBorder>
        <Group wrap="nowrap" gap="md">
          {/* Coluna da Imagem */}
          {product.image && (
            <Box>
              <Image
                src={product.image}
                alt={product.name}
                width={120}
                height={120}
                radius="md"
                fit="cover"
              />
            </Box>
          )}

          {/* Coluna de Informações */}
          <Box style={{ flex: 1 }}>
            <Group justify="space-between" mb="xs">
              <Text size="sm" c="dimmed">
                Produto Selecionado
              </Text>
              <Badge color="orange" variant="light">
                Dinheiro Parado
              </Badge>
            </Group>
            <Text fw={500} mb={4}>
              {product.name}
            </Text>
            <Group gap="md">
              <Text size="sm" c="dimmed">
                SKU: {product.sku}
              </Text>
              {product.category?.name && (
                <Text size="sm" c="dimmed">
                  Categoria: {product.category.name}
                </Text>
              )}
            </Group>
            <Group gap="md">
              <Text size="sm" c="dimmed">
                Custo: {formatCurrency(product.costPrice)}
              </Text>
              <Text size="sm" c="dimmed">
                Venda (promocional): {formatCurrency(promotionalPrice)}
              </Text>
              {product.salePrice !== promotionalPrice && (
                <Badge color="brand" variant="light">
                  {(() => {
                    if (discountPct != null) {
                      return `Desconto: ${Math.round(discountPct)}%`;
                    }
                    if (discountAmount != null) {
                      return `- ${formatCurrency(discountAmount)}`;
                    }
                    return 'Preço ajustado';
                  })()}
                </Badge>
              )}
            </Group>
          </Box>
        </Group>
      </Paper>

      <Stack gap="sm">
        <Text>Estratégia de Campanha</Text>
        <Box
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
            gap: '1rem',
          }}
        >
          {campaignStrategies.map((strategy) => (
            <Paper
              key={strategy.value}
              p="md"
              radius="md"
              withBorder
              style={{
                cursor: 'pointer',
                borderWidth: 2,
                borderColor:
                  selectedStrategy === strategy.value ? 'var(--mantine-color-brand-5)' : undefined,
                backgroundColor:
                  selectedStrategy === strategy.value
                    ? 'var(--mantine-color-brand-light)'
                    : undefined,
                transition: 'all 0.2s ease',
              }}
              onClick={() => setSelectedStrategy(strategy.value)}
            >
              <Text mb="xs">{strategy.label}</Text>
              <Text size="sm" c="dimmed" mb="xs">
                {strategy.description}
              </Text>
              <Badge color="brand" variant="outline" size="sm">
                {strategy.pricingSuggestion}
              </Badge>
            </Paper>
          ))}
        </Box>
      </Stack>

      <Stack gap="xs">
        <Text>Tom de Voz</Text>
        <Select
          data={toneOfVoiceOptions}
          value={toneOfVoice}
          onChange={(value) => setToneOfVoice((value as ToneOfVoice) ?? 'urgent-direct')}
          placeholder="Selecione o tom de voz"
        />
      </Stack>

      <Stack gap="xs">
        <Text>Instruções Adicionais (Opcional)</Text>
        <Textarea
          placeholder="Ex: mencionar frete grátis, público-alvo, benefícios específicos..."
          value={customInstructions}
          onChange={(e) => setCustomInstructions(e.currentTarget.value)}
          rows={3}
        />
      </Stack>

      {selectedStrategyData && (
        <Paper p="md" radius="md" withBorder>
          <Text size="sm" mb="xs">
            💡 Sugestão de Precificação
          </Text>
          <Text size="sm" c="dimmed">
            {selectedStrategyData.pricingSuggestion}
          </Text>
        </Paper>
      )}

      <Button
        onClick={handleGenerate}
        disabled={isGenerating}
        fullWidth
        size="lg"
        color="brand"
        leftSection={isGenerating ? <Loader size="xs" color="white" /> : <Sparkles size={20} />}
      >
        {isGenerating ? 'Gerando Campanhas...' : 'Gerar Campanhas com IA'}
      </Button>
    </Stack>
  );
}
