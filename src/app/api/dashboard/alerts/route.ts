import type { BlingAlertType, BlingRuptureRisk } from '@prisma/client';
import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import pino from 'pino';
import { BlingIntegration, createBlingRepository } from '@/lib/bling';
import { authOptions } from '@/lib/next-auth';

const PAGE_SIZE_DEFAULT = 20;
const logger = pino({ name: 'api/dashboard/alerts' });

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

    const blingRepository = createBlingRepository({ integrationId: integration.id });
    const { searchParams } = new URL(req.url);

    const limit = Number(searchParams.get('limit')) || PAGE_SIZE_DEFAULT;
    const cursor = searchParams.get('cursor') as string; // ISO timestamp or id
    const typeParam = searchParams.get('type');
    const riskParam = searchParams.get('risk');

    const filters: {
      type?: BlingAlertType[];
      risk?: BlingRuptureRisk[];
    } = {};

    if (typeParam) {
      filters.type = typeParam.split(',') as BlingAlertType[];
    }

    if (riskParam) {
      filters.risk = riskParam.split(',') as BlingRuptureRisk[];
    }

    logger.info(
      { filters, limit, cursor, integrationId: integration.id },
      'Fetching product alerts'
    );

    const result = await blingRepository.getProductAlerts({
      integrationId: integration.id,
      limit,
      cursor,
      filters,
    });

    return new Response(JSON.stringify(result), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (err) {
    console.error('[alerts]', err);
    return NextResponse.json({ error: 'Erro ao buscar os alertas.' }, { status: 500 });
  }
}
