import { BlingSyncStatus } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { BlingIntegration } from '@/lib/bling/bling-integration';
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

    const integration = await BlingIntegration.getBlingIntegration(userId);
    if (!integration) {
      return NextResponse.json({ error: 'Integração Bling não conectada' }, { status: 400 });
    }

    // Atualiza status do usuário para SYNCING
    await prisma.user.update({
      where: { id: userId },
      data: { blingSyncStatus: BlingSyncStatus.SYNCING },
    });

    // Dispara sincronização
    await inngest.send({ name: 'bling/sync:user', data: { userId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao iniciar sincronização Bling:', error);
    return NextResponse.json({ error: 'Erro ao iniciar sincronização' }, { status: 500 });
  }
}
