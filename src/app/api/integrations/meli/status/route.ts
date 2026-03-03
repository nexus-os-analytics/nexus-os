import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { MeliIntegration } from '@/lib/mercado-livre/meli-integration';
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
      select: { id: true, meliSyncStatus: true },
    });

    const integration = await MeliIntegration.getMeliIntegration(session.user.id);
    const isConnected = !!integration;
    const isValid = integration ? await MeliIntegration.isMeliTokenValid(session.user.id) : false;

    return NextResponse.json({
      connected: isConnected,
      valid: isValid,
      syncStatus: user?.meliSyncStatus || null,
      integration: integration
        ? {
            connected_at: integration.connected_at,
            meliUserId: integration.meliUserId,
          }
        : null,
    });
  } catch (error) {
    console.error('Error checking Mercado Livre status:', error);
    return NextResponse.json({ error: 'Erro ao verificar status da integração' }, { status: 500 });
  }
}
