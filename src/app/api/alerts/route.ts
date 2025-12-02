import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getDashboardAlerts } from '@/features/dashboard/services';
import type { DashboardAlertsResponse } from '@/features/dashboard/types';
import { BlingIntegration } from '@/lib/bling';
import { authOptions } from '@/lib/next-auth';

const PAGE_SIZE_DEFAULT = 20;

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);

    const limit = Number(searchParams.get('limit')) || PAGE_SIZE_DEFAULT;
    const cursor = searchParams.get('cursor') as string; // ISO timestamp or id

    const result = await getDashboardAlerts({
      integrationId: integration.id,
      limit,
      cursor,
    });

    const response: DashboardAlertsResponse = {
      data: result.data,
      pagination: {
        nextCursor: result.nextCursor,
        hasNextPage: result.hasNextPage,
      },
    };

    return new Response(JSON.stringify(response), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[alerts]', err);
    return NextResponse.json({ error: 'Erro ao buscar dados dos alertas.' }, { status: 500 });
  }
}
