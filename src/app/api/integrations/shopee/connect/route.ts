import crypto from 'crypto';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import pino from 'pino';
import { authOptions } from '@/lib/next-auth';

const logger = pino().child({ module: 'shopee-connect-route' });

const AUTH_PATH = '/api/v2/shop/auth_partner';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    const partnerId = process.env.SHOPEE_PARTNER_ID;
    const partnerKey = process.env.SHOPEE_PARTNER_KEY;
    const redirectUri = process.env.SHOPEE_REDIRECT_URI;
    const baseUrl = process.env.SHOPEE_API_BASE_URL ?? 'https://partner.shopeemobile.com';

    if (!partnerId || !partnerKey || !redirectUri) {
      logger.error('SHOPEE_PARTNER_ID, SHOPEE_PARTNER_KEY or SHOPEE_REDIRECT_URI not configured');
      return NextResponse.json(
        { error: 'Configuração ausente: variáveis de ambiente Shopee não definidas' },
        { status: 500 }
      );
    }

    const timestamp = Math.floor(Date.now() / 1000);
    const baseString = `${partnerId}${AUTH_PATH}${timestamp}`;
    const sign = crypto
      .createHmac('sha256', partnerKey)
      .update(baseString)
      .digest('hex');

    const authUrl =
      `${baseUrl}${AUTH_PATH}` +
      `?partner_id=${partnerId}` +
      `&timestamp=${timestamp}` +
      `&auth_token=${sign}` +
      `&redirect=${encodeURIComponent(redirectUri)}`;

    return NextResponse.json({ authUrl });
  } catch (error) {
    logger.error(error, 'Error generating Shopee auth URL');
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
