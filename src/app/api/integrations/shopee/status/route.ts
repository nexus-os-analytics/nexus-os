import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ShopeeIntegration } from '@/lib/shopee/shopee-integration';
import { authOptions } from '@/lib/next-auth';
import prisma from '@/lib/prisma';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: { id: true, shopeeSyncStatus: true },
    });

    const integration = await ShopeeIntegration.getShopeeIntegration(session.user.id);
    const isConnected = !!integration;
    const isValid = integration
      ? await ShopeeIntegration.isShopeeTokenValid(session.user.id)
      : false;

    return NextResponse.json({
      connected: isConnected,
      valid: isValid,
      syncStatus: user?.shopeeSyncStatus || null,
      integration: integration
        ? {
            connected_at: integration.connected_at,
            shopId: integration.shopId,
          }
        : null,
    });
  } catch (error) {
    console.error('Error checking Shopee status:', error);
    return NextResponse.json({ error: 'Erro ao verificar status da integração' }, { status: 500 });
  }
}
