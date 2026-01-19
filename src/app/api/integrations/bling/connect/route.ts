import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import pino from 'pino';
import { authOptions } from '@/lib/next-auth';

const logger = pino().child({ module: 'bling-connect-route' });

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const authUrl = process.env.BLING_INVITE_LINK;
    if (!authUrl) {
      logger.error('BLING_INVITE_LINK is not configured');
      return NextResponse.json(
        { error: 'Configuração ausente: BLING_INVITE_LINK' },
        { status: 500 }
      );
    }

    return NextResponse.json({ authUrl });
  } catch (error) {
    logger.error(error, 'Error generating Bling auth URL');
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
