import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { BlingIntegration, createBlingRepository } from '@/lib/bling';
import { authOptions } from '@/lib/next-auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const integration = await BlingIntegration.getBlingIntegration(userId);

    if (!integration) {
      return NextResponse.json(
        { error: 'Integração com Bling não encontrada para o usuário.' },
        { status: 404 }
      );
    }

    const blingRepository = createBlingRepository({ integrationId: integration.id });
    const result = await blingRepository.getOverviewMetrics({ integrationId: integration.id });

    return NextResponse.json(result);
  } catch (err) {
    console.error('[overview-metrics]', err);
    return NextResponse.json({ error: 'Erro ao buscar dados da visão geral.' }, { status: 500 });
  }
}
