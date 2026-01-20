import {
  ActionIcon,
  Badge,
  Box,
  Button,
  Divider,
  Group,
  Stack,
  Text,
  Textarea,
  Title,
} from '@mantine/core';
import { notifications } from '@mantine/notifications';
import { Check, Copy, Image as ImageIcon, Instagram, Mail } from 'lucide-react';
import { useState } from 'react';
import type { CampaignOutput, CampaignStrategy, ToneOfVoice } from '@/features/products/types';
import type { BlingProductType } from '@/lib/bling';

interface ProductCampaignResultsProps {
  product: BlingProductType;
  strategy: CampaignStrategy;
  toneOfVoice: ToneOfVoice;
  customInstructions: string;
  campaigns: CampaignOutput;
}

// Component displays and lets user copy/edit the generated texts from server

export function ProductCampaignResults({
  product: _product,
  strategy,
  toneOfVoice,
  customInstructions: _customInstructions,
  campaigns,
}: ProductCampaignResultsProps) {
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
      const COPY_TIMEOUT_MS = 2000;
      setTimeout(() => setCopiedField(null), COPY_TIMEOUT_MS);
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
      {/* Header */}
      <Box>
        <Title order={2} mb="xs">
          Suas Campanhas Geradas ✨
        </Title>
        <Text c="#6E6E6E" size="sm" mb="md">
          Edite os textos conforme necessário e copie ou publique diretamente nos canais.
        </Text>
        <Group gap="xs">
          <Badge color="gold" variant="outline">
            {strategyLabels[strategy]}
          </Badge>
          <Badge color="gray" variant="outline">
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
            <Text>Post Instagram / Facebook</Text>
          </Group>
          <Group gap="xs">
            <ActionIcon
              variant="subtle"
              color="gold"
              onClick={() => handleCopy(instagram, 'instagram')}
              title="Copiar texto"
            >
              {copiedField === 'instagram' ? <Check size={18} /> : <Copy size={18} />}
            </ActionIcon>
            <Button
              size="xs"
              color="gold"
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
            <Text>Assunto de Email Marketing</Text>
          </Group>
          <Group gap="xs">
            <ActionIcon
              variant="subtle"
              color="gold"
              onClick={() => handleCopy(email, 'email')}
              title="Copiar texto"
            >
              {copiedField === 'email' ? <Check size={18} /> : <Copy size={18} />}
            </ActionIcon>
            <Button
              size="xs"
              color="gold"
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
            <Text>Anúncio de Remarketing (Banner)</Text>
          </Group>
          <Group gap="xs">
            <ActionIcon
              variant="subtle"
              color="gold"
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
        💡 Dica: Personalize os textos para deixar com a identidade da sua marca antes de publicar!
      </Text>
    </Stack>
  );
}
