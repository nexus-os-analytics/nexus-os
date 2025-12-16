import type { NextApiRequest } from 'next';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { BlingIntegration, createBlingRepository } from '@/lib/bling';
import { authOptions } from '@/lib/next-auth';

export async function GET(req: NextApiRequest) {
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

    const { id } = req.query;
    const blingRepository = createBlingRepository({ integrationId: integration.id });
    const product = await blingRepository.getProductById(id as string);

    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (err) {
    console.error('[overview-metrics]', err);
    return NextResponse.json({ error: 'Erro ao buscar dados da visão geral.' }, { status: 500 });
  }
}
