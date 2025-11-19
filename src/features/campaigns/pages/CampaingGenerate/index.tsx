'use client';

import {
  Badge,
  Box,
  Button,
  Card,
  Group,
  Image,
  Loader,
  Paper,
  Select,
  SimpleGrid,
  Stack,
  Text,
  Textarea,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { ArrowLeft, Sparkles } from 'lucide-react';
import { useParams, useRouter } from 'next/navigation';
import { useState } from 'react';
import { campaignStrategies, mockProducts, toneOfVoiceOptions } from '@/mock';
import type { CampaignStrategy, ToneOfVoice } from '@/types';

export function CampaignGenerate() {
  const [selectedStrategy, setSelectedStrategy] =
    useState<CampaignStrategy>('aggressive-liquidation');
  const [toneOfVoice, setToneOfVoice] = useState<ToneOfVoice>('urgent-direct');
  const [customInstructions, setCustomInstructions] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);

  const params = useParams();
  const router = useRouter();
  const { productId } = params;
  const product = mockProducts.find((p) => p.id === productId) || null;

  const handleGenerate = () => {
    setIsGenerating(true);
    const queryParams = new URLSearchParams({
      strategy: selectedStrategy,
      toneOfVoice: toneOfVoice,
    }).toString();

    router.push(`/campaign/${productId}/results?${queryParams}`, {
      scroll: true,
    });
  };

  const selectedStrategyData = campaignStrategies.find((s) => s.value === selectedStrategy);

  return (
    <Stack gap="xl">
      <Group h="100%">
        <Button
          variant="subtle"
          color="gray"
          leftSection={<ArrowLeft size={16} />}
          onClick={() => router.push('/dashboard')}
        >
          Voltar para o Dashboard
        </Button>
      </Group>
      <Card padding="xl" radius="md" withBorder shadow="sm" style={{ background: '#FFFFFF' }}>
        <Stack gap="xl">
          {/* Header */}
          <Box>
            <Group mb="xs">
              <ThemeIcon size={32} radius="md" variant="filled" color="gold">
                <Sparkles size={18} />
              </ThemeIcon>
              <Title order={2} style={{ color: '#2E2E2E' }}>
                Gerador de Campanha com IA
              </Title>
            </Group>
            <Text c="#6E6E6E" size="sm">
              Escolha a estratégia de liquidação para transformar seu estoque parado em lucro.
            </Text>
          </Box>

          {/* Product Info */}
          {product && (
            <Paper p="md" radius="md" withBorder style={{ backgroundColor: '#F5F5F5' }}>
              <SimpleGrid cols={{ base: 1, sm: 2 }}>
                {product.imageUrl && (
                  <Image
                    src={product.imageUrl}
                    alt={product.productName}
                    fallbackSrc="/product_placeholder.webp"
                    width={80}
                    height={480}
                    radius="md"
                    fit="cover"
                  />
                )}
                <Box style={{ flex: 1 }}>
                  <Group justify="space-between" mb="xs">
                    <Text size="sm" c="#6E6E6E">
                      Produto Selecionado
                    </Text>
                    <Badge color="orange" variant="light">
                      Dinheiro Parado
                    </Badge>
                  </Group>
                  <Text style={{ color: '#2E2E2E' }} mb={4}>
                    {product.productName}
                  </Text>
                  <Text size="sm" c="#6E6E6E" mb={4}>
                    SKU: {product.sku}
                  </Text>
                  <Text size="sm" c="#6E6E6E" mb={4}>
                    Categoria: {product.category}
                  </Text>
                  <Group gap="md">
                    <Text size="sm" c="#6E6E6E">
                      Custo: R$ {product.costPrice?.toFixed(2)}
                    </Text>
                    <Text size="sm" c="#6E6E6E">
                      Venda: R$ {product.sellingPrice?.toFixed(2)}
                    </Text>
                  </Group>
                  <Text size="sm" c="orange">
                    Capital Parado: R${' '}
                    {product.capitalTied?.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </Text>
                </Box>
              </SimpleGrid>
            </Paper>
          )}

          {/* Strategy Selection */}
          <Stack gap="sm">
            <Text style={{ color: '#2E2E2E' }}>Estratégia de Campanha</Text>
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
                    borderColor: selectedStrategy === strategy.value ? '#C7A446' : undefined,
                    backgroundColor: selectedStrategy === strategy.value ? '#f9f5e9' : '#FFFFFF',
                    transition: 'all 0.2s ease',
                  }}
                  onClick={() => setSelectedStrategy(strategy.value)}
                >
                  <Text mb="xs" style={{ color: '#2E2E2E' }}>
                    {strategy.label}
                  </Text>
                  <Text size="sm" c="#6E6E6E" mb="xs">
                    {strategy.description}
                  </Text>
                  <Badge color="brand" variant="light" size="sm">
                    {strategy.pricingSuggestion}
                  </Badge>
                </Paper>
              ))}
            </Box>
          </Stack>

          {/* Tone of Voice */}
          <Stack gap="xs">
            <Text style={{ color: '#2E2E2E' }}>Tom de Voz</Text>
            <Select
              data={toneOfVoiceOptions}
              value={toneOfVoice}
              onChange={(value) => setToneOfVoice(value as ToneOfVoice)}
              placeholder="Selecione o tom de voz"
            />
          </Stack>

          {/* Custom Instructions */}
          <Stack gap="xs">
            <Text style={{ color: '#2E2E2E' }}>Instruções Adicionais (Opcional)</Text>
            <Textarea
              placeholder="Ex: Mencionar frete grátis, destacar características específicas do produto, público-alvo..."
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.currentTarget.value)}
              rows={3}
            />
          </Stack>

          {/* Pricing Suggestion Info */}
          {selectedStrategyData && (
            <Paper
              p="md"
              radius="md"
              style={{ backgroundColor: '#f9f5e9', border: '1px solid #C7A446' }}
            >
              <Text size="sm" c="#2E2E2E" mb="xs">
                💡 Sugestão de Precificação
              </Text>
              <Text size="sm" c="#6E6E6E">
                {selectedStrategyData.pricingSuggestion}
              </Text>
            </Paper>
          )}

          {/* Generate Button */}
          <Button
            onClick={handleGenerate}
            disabled={isGenerating}
            fullWidth
            size="lg"
            color="gold"
            leftSection={isGenerating ? <Loader size="xs" color="white" /> : <Sparkles size={20} />}
            style={{
              background: '#C7A446',
            }}
            styles={{
              root: {
                '&:hover': {
                  background: '#A8872A',
                },
              },
            }}
          >
            {isGenerating ? 'Gerando Campanhas com GPT-3.5...' : 'Gerar Campanhas com IA'}
          </Button>

          <Text size="xs" c="#6E6E6E" ta="center">
            🤖 Powered by GPT-4.1 | 💾 Resultado será salvo em cache
          </Text>
        </Stack>
      </Card>
    </Stack>
  );
}
