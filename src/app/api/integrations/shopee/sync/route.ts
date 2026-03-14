import { ShopeeSyncStatus } from '@prisma/client';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ShopeeIntegration } from '@/lib/shopee/shopee-integration';
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

    if (session?.user?.planTier === 'FREE') {
      return NextResponse.json(
        { error: 'Sincronização manual disponível apenas no plano PRO.' },
        { status: 403 }
      );
    }

    const integration = await ShopeeIntegration.getShopeeIntegration(userId);
    if (!integration) {
      return NextResponse.json({ error: 'Integração Shopee não conectada' }, { status: 400 });
    }

    await prisma.user.update({
      where: { id: userId },
      data: { shopeeSyncStatus: ShopeeSyncStatus.SYNCING },
    });

    await inngest.send({ name: 'shopee/sync:user', data: { userId } });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Erro ao iniciar sincronização Shopee:', error);
    return NextResponse.json({ error: 'Erro ao iniciar sincronização' }, { status: 500 });
  }
}
