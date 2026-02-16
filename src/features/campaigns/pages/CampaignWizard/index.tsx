/**
 * Campaign Wizard Component
 *
 * Multi-step wizard for campaign creation
 * Steps: 1. Type → 2. Product → 3. Discount/Increase → 4. Tone → 5. Review
 */

'use client';

import { useSearchParams, useRouter } from 'next/navigation';
import { Stack, Stepper, Paper } from '@mantine/core';
import { CampaignTypeSelector } from '@/features/campaigns/components/CampaignTypeSelector';
import { ProductSelector } from '@/features/campaigns/components/ProductSelector';
import { DiscountSelector } from '@/features/campaigns/components/DiscountSelector';
import { ToneSelector } from '@/features/campaigns/components/ToneSelector';
import { CampaignReview } from '@/features/campaigns/components/CampaignReview';
import type { CampaignType } from '@prisma/client';
import type { ToneOfVoice } from '@/features/campaigns/types';

export function CampaignWizard() {
  const searchParams = useSearchParams();
  const router = useRouter();

  // Get current step from URL (default to 1)
  const step = parseInt(searchParams.get('step') || '1', 10);

  // Get wizard state from URL
  const type = searchParams.get('type') as CampaignType | null;
  const productId = searchParams.get('productId');
  const percentage = searchParams.get('percentage'); // discount or increase
  const tone = searchParams.get('tone') as ToneOfVoice | null;
  const campaignId = searchParams.get('campaignId'); // After generation

  // Update URL with new params
  const updateParams = (newParams: Record<string, string | null>) => {
    const params = new URLSearchParams(searchParams.toString());

    Object.entries(newParams).forEach(([key, value]) => {
      if (value === null) {
        params.delete(key);
      } else {
        params.set(key, value);
      }
    });

    router.push(`/campanhas/criar?${params.toString()}`);
  };

  // Navigate to step
  const goToStep = (stepNumber: number, additionalParams?: Record<string, string | null>) => {
    updateParams({ step: stepNumber.toString(), ...additionalParams });
  };

  return (
    <Stack gap="xl">
      {/* Stepper indicator */}
      <Paper p="md" withBorder>
        <Stepper active={step - 1} size="sm" allowNextStepsSelect={false}>
          <Stepper.Step label="Tipo" description="Escolha o tipo de campanha" />
          <Stepper.Step label="Produto" description="Selecione o produto" />
          <Stepper.Step label="Preço" description="Defina o desconto/aumento" />
          <Stepper.Step label="Tom" description="Escolha o tom de voz" />
          <Stepper.Step label="Revisar" description="Revise e publique" />
        </Stepper>
      </Paper>

      {/* Step content */}
      {step === 1 && <CampaignTypeSelector onSelect={(type) => goToStep(2, { type })} />}

      {step === 2 && type && (
        <ProductSelector
          type={type}
          initialProductId={productId}
          onSelect={(productId) => goToStep(3, { productId })}
          onBack={() => goToStep(1, { type: null })}
        />
      )}

      {step === 3 && type && productId && (
        <DiscountSelector
          type={type}
          productId={productId}
          onContinue={(percentage) => goToStep(4, { percentage })}
          onBack={() => goToStep(2, { productId: null })}
        />
      )}

      {step === 4 && type && productId && percentage && (
        <ToneSelector
          onSelect={(tone) => goToStep(5, { tone })}
          onBack={() => goToStep(3, { percentage: null })}
        />
      )}

      {step === 5 && type && productId && percentage && tone && (
        <CampaignReview
          type={type}
          productId={productId}
          percentage={parseInt(percentage, 10)}
          tone={tone}
          onBack={() => goToStep(4, { tone: null })}
          onSuccess={(campaignId) => router.push(`/campanhas/${campaignId}`)}
        />
      )}
    </Stack>
  );
}
