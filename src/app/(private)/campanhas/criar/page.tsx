/**
 * Campaign Wizard - Main Page
 *
 * Multi-step wizard for creating campaigns (Liquidation or Opportunity)
 * Uses URL search params for step navigation and state
 */

import { Suspense } from 'react';
import { CampaignWizard } from '@/features/campaigns/pages/CampaignWizard';
import { Container, Loader, Center } from '@mantine/core';

export const metadata = {
  title: 'Criar Campanha | Nexus OS',
  description: 'Crie campanhas de liquidação ou oportunidade com IA',
};

export default function CampaignWizardPage() {
  return (
    <Container size="xl" py="xl">
      <Suspense
        fallback={
          <Center h={400}>
            <Loader size="lg" />
          </Center>
        }
      >
        <CampaignWizard />
      </Suspense>
    </Container>
  );
}
