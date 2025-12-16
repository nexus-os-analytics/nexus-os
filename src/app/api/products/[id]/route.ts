import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import pino from 'pino';
import { BlingIntegration, createBlingRepository } from '@/lib/bling';
import { authOptions } from '@/lib/next-auth';

const logger = pino({ name: 'api/products/[id]' });

export async function GET(_req: Request, ctx: RouteContext<'/api/products/[id]'>) {
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

    const { id } = await ctx.params;
    const blingRepository = createBlingRepository({ integrationId: integration.id });
    const product = await blingRepository.getProductById(id as string);

    logger.info({ productId: id, found: Boolean(product) }, 'Product fetched');

    if (!product) {
      return NextResponse.json({ error: 'Produto não encontrado.' }, { status: 404 });
    }

    return NextResponse.json(product);
  } catch (err) {
    logger.error({ err }, 'Erro ao buscar detalhe do produto');
    return NextResponse.json({ error: 'Erro ao buscar detalhe do produto.' }, { status: 500 });
  }
}
