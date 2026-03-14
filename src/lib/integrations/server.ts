import prisma from '@/lib/prisma';
import { IntegrationProvider, SyncStatus } from '@/types/integrations';
import { getSyncStatusField } from './utils';

export async function updateSyncStatus(
  userId: string,
  provider: IntegrationProvider,
  status: SyncStatus
): Promise<void> {
  const field = getSyncStatusField(provider);
  await prisma.user.update({
    where: { id: userId },
    data: { [field]: status },
  });
}

export async function getSyncStatus(
  userId: string,
  provider: IntegrationProvider
): Promise<SyncStatus> {
  const field = getSyncStatusField(provider);
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });
  if (!user) {
    throw new Error(`User not found: ${userId}`);
  }
  // @ts-expect-error - Dynamic field access
  return user[field] as SyncStatus;
}
