'use client';
import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Card,
  Divider,
  Group,
  Stack,
  Text,
  Textarea,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { ArrowLeft, Check, Copy, Image as ImageIcon, Instagram, Mail } from 'lucide-react';
import { useParams, useRouter, useSearchParams } from 'next/navigation';
import { useState } from 'react';
import { mockProducts } from '@/mock';
import type { CampaignStrategy, ProductAlert, ToneOfVoice } from '@/types';

const generateCampaignTexts = (
  product: ProductAlert | null,
  strategy: CampaignStrategy,
  toneOfVoice: ToneOfVoice
) => {
  if (!product) return { instagram: '', email: '', remarketing: '' };

  const productName = product.productName;
  const category = product.category;
  const sellingPrice = product.sellingPrice || 0;
  const costPrice = product.costPrice || 0;

  // Calculate suggested prices based on strategy
  let suggestedPrice = sellingPrice;
  let discount = 0;

  const discountPercentage = 0.9; // 10% discount for aggressive liquidation
  const upsellPercentage = 1.2; // 20% increase for upsell
  const fixedDiscount = 20; // Fixed 20% discount for upsell
  const hundredPercent = 100;

  if (strategy === 'aggressive-liquidation') {
    suggestedPrice = costPrice * discountPercentage; // Cost - 10%
    discount = Math.round(((sellingPrice - suggestedPrice) / sellingPrice) * hundredPercent);
  } else if (strategy === 'checkout-upsell') {
    discount = fixedDiscount;
    suggestedPrice = sellingPrice * upsellPercentage;
  }

  // Tone variations
  const tones = {
    'urgent-direct': {
      instagram: `🚨 ATENÇÃO: ${productName} com ${discount}% OFF!\n\nEstoque LIMITADO e preço IMPERDÍVEL! Só hoje: de R$${sellingPrice.toFixed(2)} por R$${suggestedPrice.toFixed(2)}\n\n⚡ Corre que acaba! Link na bio.`,
      email: `⚡ ${discount}% OFF ${productName} - SÓ HOJE!`,
      remarketing: `${productName} -${discount}%\nDE: R$${sellingPrice.toFixed(2)}\nPOR: R$${suggestedPrice.toFixed(2)}\n🛒 COMPRE AGORA`,
    },
    'friendly-casual': {
      instagram: `Oi! 👋\n\nTenho uma novidade especial pra você: ${productName} com desconto incrível de ${discount}%!\n\nDe R$${sellingPrice.toFixed(2)} por apenas R$${suggestedPrice.toFixed(2)} 💛\n\nCorre lá no link da bio!`,
      email: `Seu ${productName} favorito tá em promoção! 💛`,
      remarketing: `${productName}\nPromoção especial! 🎉\nR$${suggestedPrice.toFixed(2)}\nApenas hoje!`,
    },
    'professional-technical': {
      instagram: `Oferta técnica especial: ${productName}\n\nEspecificações: ${category}\nPreço original: R$${sellingPrice.toFixed(2)}\nPreço promocional: R$${suggestedPrice.toFixed(2)}\nEconomia: ${discount}%\n\nAdquira através do link em nossa bio.`,
      email: `Oferta Especial: ${productName} com ${discount}% de desconto`,
      remarketing: `${productName}\nOferta Técnica\n${discount}% de desconto\nR$${suggestedPrice.toFixed(2)}`,
    },
    'enthusiastic-emotional': {
      instagram: `✨ REALIZEEEE! ✨\n\n${productName} com um preço que vai fazer você MUITO feliz! 🎉\n\n💰 De R$${sellingPrice.toFixed(2)}\n💎 Por R$${suggestedPrice.toFixed(2)}\n\n${discount}% OFF que você merece! 💕\n\n👉 Link na bio pra garantir o seu!`,
      email: `💕 Você VAI AMAR essa promoção de ${productName}!`,
      remarketing: `${productName} ✨\nVocê merece!\n${discount}% OFF\nR$${suggestedPrice.toFixed(2)} 💕`,
    },
  };

  return tones[toneOfVoice];
};

export function CampaingResults() {
  const { productId } = useParams();
  const searchParams = useSearchParams();
  const strategy = searchParams.get('strategy') as CampaignStrategy;
  const toneOfVoice = searchParams.get('toneOfVoice') as ToneOfVoice;
  const router = useRouter();

  const product = mockProducts.find((p) => p.id === productId) || null;

  const campaigns = generateCampaignTexts(product, strategy, toneOfVoice);

  const [instagram, setInstagram] = useState(campaigns.instagram);
  const [email, setEmail] = useState(campaigns.email);
  const [remarketing, setRemarketing] = useState(campaigns.remarketing);

  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = async (text: string, field: string) => {
    try {
      if (navigator.clipboard && navigator.clipboard.writeText) {
        await navigator.clipboard.writeText(text);
      } else {
        const textArea = document.createElement('textarea');
        textArea.value = text;
        textArea.style.position = 'fixed';
        textArea.style.left = '-999999px';
        textArea.style.top = '-999999px';
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();

        try {
          document.execCommand('copy');
        } catch (err) {
          console.error('Fallback copy failed:', err);
          throw new Error('Copy failed');
        } finally {
          document.body.removeChild(textArea);
        }
      }

      setCopiedField(field);
      notifications.show({
        title: 'Sucesso',
        message: 'Texto copiado!',
        color: 'teal',
      });
      // setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Copy failed:', err);
      notifications.show({
        title: 'Erro ao copiar',
        message: 'Não foi possível copiar o texto. Por favor, copie manualmente.',
        color: 'red',
      });
    }
  };

  const handlePublish = (channel: string) => {
    notifications.show({
      title: 'Em breve',
      message: `Publicação direta no ${channel} disponível em breve!`,
      color: 'blue',
    });
  };

  const strategyLabels = {
    'aggressive-liquidation': 'Liquidação Agressiva',
    'strategic-combo': 'Combo Estratégico',
    'checkout-upsell': 'Upsell na Finalização',
  };

  const toneLabels = {
    'urgent-direct': 'Urgente e Direto',
    'friendly-casual': 'Amigável e Casual',
    'professional-technical': 'Profissional e Técnico',
    'enthusiastic-emotional': 'Entusiasta e Emocional',
  };

  return (
    <Stack gap="xl">
      <Group h="100%">
        <Button
          variant="subtle"
          color="gray"
          leftSection={<ArrowLeft size={16} />}
          onClick={() => router.back()}
        >
          Voltar
        </Button>
      </Group>
      <Card padding="xl" radius="md" withBorder shadow="sm" style={{ background: '#FFFFFF' }}>
        <Stack gap="xl">
          {/* Header */}
          <Box>
            <Title order={2} mb="xs" style={{ color: '#2E2E2E' }}>
              Suas Campanhas Geradas ✨
            </Title>
            <Text c="#6E6E6E" size="sm" mb="md">
              Edite os textos conforme necessário e copie ou publique diretamente nos canais.
            </Text>
            <Group gap="xs">
              <Badge color="brand" variant="light">
                {strategyLabels[strategy]}
              </Badge>
              <Badge color="gray" variant="light">
                {toneLabels[toneOfVoice]}
              </Badge>
            </Group>
          </Box>

          <Divider />

          {/* Instagram / Facebook Post */}
          <Stack gap="xs">
            <Group justify="space-between" align="center">
              <Group gap="xs">
                <Instagram size={20} color="#C13584" />
                <Text style={{ color: '#2E2E2E' }}>Post Instagram / Facebook</Text>
              </Group>
              <Group gap="xs">
                <ActionIcon
                  variant="subtle"
                  color="brand"
                  onClick={() => handleCopy(instagram, 'instagram')}
                  title="Copiar texto"
                >
                  {copiedField === 'instagram' ? <Check size={18} /> : <Copy size={18} />}
                </ActionIcon>
                <Button
                  size="xs"
                  color="brand"
                  variant="light"
                  leftSection={<Instagram size={14} />}
                  onClick={() => handlePublish('Instagram')}
                >
                  Publicar
                </Button>
              </Group>
            </Group>
            <Textarea
              value={instagram}
              onChange={(e) => setInstagram(e.currentTarget.value)}
              rows={5}
              description="Otimizado para impacto visual e urgência"
            />
          </Stack>

          <Divider />

          {/* Email Marketing */}
          <Stack gap="xs">
            <Group justify="space-between" align="center">
              <Group gap="xs">
                <Mail size={20} color="#C7A446" />
                <Text style={{ color: '#2E2E2E' }}>Assunto de Email Marketing</Text>
              </Group>
              <Group gap="xs">
                <ActionIcon
                  variant="subtle"
                  color="brand"
                  onClick={() => handleCopy(email, 'email')}
                  title="Copiar texto"
                >
                  {copiedField === 'email' ? <Check size={18} /> : <Copy size={18} />}
                </ActionIcon>
                <Button
                  size="xs"
                  color="brand"
                  variant="light"
                  leftSection={<Mail size={14} />}
                  onClick={() => handlePublish('Email')}
                >
                  Enviar
                </Button>
              </Group>
            </Group>
            <Textarea
              value={email}
              onChange={(e) => setEmail(e.currentTarget.value)}
              rows={2}
              description="Otimizado para taxa de abertura (números e símbolos)"
              styles={{ input: { resize: 'none' } }}
            />
          </Stack>

          <Divider />

          {/* Remarketing Ad */}
          <Stack gap="xs">
            <Group justify="space-between" align="center">
              <Group gap="xs">
                <ImageIcon size={20} color="#1E90FF" />
                <Text style={{ color: '#2E2E2E' }}>Anúncio de Remarketing (Banner)</Text>
              </Group>
              <Group gap="xs">
                <ActionIcon
                  variant="subtle"
                  color="brand"
                  onClick={() => handleCopy(remarketing, 'remarketing')}
                  title="Copiar texto"
                >
                  {copiedField === 'remarketing' ? <Check size={18} /> : <Copy size={18} />}
                </ActionIcon>
              </Group>
            </Group>
            <Textarea
              value={remarketing}
              onChange={(e) => setRemarketing(e.currentTarget.value)}
              rows={4}
              description="Otimizado para escassez e CTA (chamada para ação)"
              styles={{ input: { resize: 'none' } }}
            />
          </Stack>

          <Divider />

          {/* Copy All Button */}
          <Button
            variant="default"
            leftSection={<Copy size={16} />}
            onClick={() =>
              handleCopy(
                `INSTAGRAM/FACEBOOK:\n${instagram}\n\nEMAIL MARKETING:\n${email}\n\nREMARKETING:\n${remarketing}`,
                'all'
              )
            }
            fullWidth
          >
            Copiar Todas as Campanhas
          </Button>

          {/* Info */}
          <Text size="xs" c="#6E6E6E" ta="center">
            💡 Dica: Personalize os textos para deixar com a identidade da sua marca antes de
            publicar!
          </Text>
        </Stack>
      </Card>
    </Stack>
  );
}
