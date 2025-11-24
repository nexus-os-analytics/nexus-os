import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { BlingIntegration } from '@/lib/bling/bling-integration';
import { authOptions } from '@/lib/next-auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const integration = await BlingIntegration.getBlingIntegration(session.user.id);
    const isConnected = !!integration;
    const isValid = integration ? await BlingIntegration.isBlingTokenValid(session.user.id) : false;

    return NextResponse.json({
      connected: isConnected,
      valid: isValid,
      integration: integration
        ? {
            connected_at: integration.connected_at,
            scope: integration.scope,
          }
        : null,
    });
  } catch (error) {
    console.error('Error checking Bling status:', error);
    return NextResponse.json({ error: 'Erro ao verificar status da integração' }, { status: 500 });
  }
}
