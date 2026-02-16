/**
 * Campaign Detail Page
 *
 * Route: /campanhas/[id]
 */

import { Suspense } from 'react';
import { CampaignDetail } from '@/features/campaigns/pages/CampaignDetail';
import { Stack, Skeleton } from '@mantine/core';

interface PageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CampaignDetailPage({ params }: PageProps) {
  const { id } = await params;

  return (
    <Suspense
      fallback={
        <Stack gap="xl">
          <Skeleton height={60} />
          <Skeleton height={200} />
          <Skeleton height={400} />
        </Stack>
      }
    >
      <CampaignDetail campaignId={id} />
    </Suspense>
  );
}
