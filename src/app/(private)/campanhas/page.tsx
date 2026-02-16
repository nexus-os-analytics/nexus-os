/**
 * Campaign Dashboard Page
 *
 * Lists all campaigns with filters and management actions
 */

import { Suspense } from 'react';
import { CampaignDashboard } from '@/features/campaigns/pages/CampaignDashboard';
import { Container, Loader, Center } from '@mantine/core';

export const metadata = {
  title: 'Minhas Campanhas | Nexus OS',
  description: 'Gerencie suas campanhas de marketing',
};

export default function CampaignsPage() {
  return (
    <Container size="xl" py="xl">
      <Suspense
        fallback={
          <Center h={400}>
            <Loader size="lg" />
          </Center>
        }
      >
        <CampaignDashboard />
      </Suspense>
    </Container>
  );
}
