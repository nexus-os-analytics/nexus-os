import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { authOptions } from '@/lib/next-auth';
import { getSyncStatus } from '@/lib/integrations/server';
import { IntegrationProvider, SyncStatus } from '@/types/integrations';

const querySchema = z.object({
  provider: z.nativeEnum(IntegrationProvider),
});

export async function GET(
  request: NextRequest
): Promise<NextResponse<{ syncStatus: SyncStatus } | { error: string }>> {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = request.nextUrl;
    const parsed = querySchema.safeParse({ provider: searchParams.get('provider') });

    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.errors[0]?.message ?? 'Invalid provider' },
        { status: 400 }
      );
    }

    const syncStatus = await getSyncStatus(session.user.id, parsed.data.provider);

    return NextResponse.json({ syncStatus });
  } catch (error) {
    console.error('Error fetching sync status:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
