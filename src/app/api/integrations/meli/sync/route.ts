import { MeliSyncStatus } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { MeliIntegration } from '@/lib/mercado-livre/meli-integration';
import { inngest } from '@/lib/inngest/client';
import { authOptions } from '@/lib/next-auth';
import prisma from '@/lib/prisma';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    // Block manual sync for FREE plan
    if (session?.user?.planTier === 'FREE') {
      return NextResponse.json(
        { error: 'Sincronização manual disponível apenas no plano PRO.' },
        { status: 403 }
      );
    }

    const integration = await MeliIntegration.getMeliIntegration(userId);
    if (!integration) {
      return NextResponse.json(
        { error: 'Integração Mercado Livre não conectada' },
        { status: 400 }
      );
    }

    // Update user sync status to SYNCING
    await prisma.user.update({
      where: { id: userId },
      data: { meliSyncStatus: MeliSyncStatus.SYNCING },
    });

    // Trigger sync
    await inngest.send({ name: 'meli/sync:user', data: { userId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao iniciar sincronização Mercado Livre:', error);
    return NextResponse.json({ error: 'Erro ao iniciar sincronização' }, { status: 500 });
  }
}
