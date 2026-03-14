import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import pino from 'pino';
import { authOptions } from '@/lib/next-auth';

const logger = pino().child({ module: 'meli-connect-route' });

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const clientId = process.env.MELI_CLIENT_ID;
    const redirectUri = process.env.MELI_REDIRECT_URI;

    if (!clientId || !redirectUri) {
      logger.error('MELI_CLIENT_ID or MELI_REDIRECT_URI is not configured');
      return NextResponse.json(
        { error: 'Configuração ausente: MELI_CLIENT_ID ou MELI_REDIRECT_URI' },
        { status: 500 }
      );
    }

    // Mercado Livre OAuth URL
    const authUrl = `https://auth.mercadolivre.com.br/authorization?response_type=code&client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}`;

    return NextResponse.json({ authUrl });
  } catch (error) {
    logger.error(error, 'Error generating Mercado Livre auth URL');
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
