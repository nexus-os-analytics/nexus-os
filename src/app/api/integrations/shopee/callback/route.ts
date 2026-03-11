import crypto from 'crypto';
import { ShopeeSyncStatus } from '@prisma/client';
import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import pino from 'pino';
import { ShopeeIntegration } from '@/lib/shopee/shopee-integration';
import { inngest } from '@/lib/inngest/client';
import { authOptions } from '@/lib/next-auth';
import prisma from '@/lib/prisma';
import {
  getIntegrationSuccessRedirect,
  getIntegrationErrorRedirect,
} from '@/lib/integrations/utils';
import { IntegrationProvider } from '@/types/integrations';

const logger = pino().child({ module: 'shopee-callback-route' });

const TOKEN_PATH = '/api/v2/auth/token/get';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const code = searchParams.get('code');
    const shopId = searchParams.get('shop_id');
    const error = searchParams.get('error');

    if (error) {
      const errorUrl = getIntegrationErrorRedirect(IntegrationProvider.SHOPEE, 'auth_failed');
      return NextResponse.redirect(new URL(errorUrl, process.env.NEXTAUTH_URL));
    }

    if (!code || !shopId) {
      const errorUrl = getIntegrationErrorRedirect(IntegrationProvider.SHOPEE, 'invalid_callback');
      return NextResponse.redirect(new URL(errorUrl, process.env.NEXTAUTH_URL));
    }

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      const errorUrl = getIntegrationErrorRedirect(IntegrationProvider.SHOPEE, 'unauthorized');
      return NextResponse.redirect(new URL(errorUrl, process.env.NEXTAUTH_URL));
    }

    const partnerId = process.env.SHOPEE_PARTNER_ID;
    const partnerKey = process.env.SHOPEE_PARTNER_KEY;
    const baseUrl = process.env.SHOPEE_API_BASE_URL ?? 'https://partner.shopeemobile.com';

    if (!partnerId || !partnerKey) {
      const errorUrl = getIntegrationErrorRedirect(IntegrationProvider.SHOPEE, 'config_missing');
      return NextResponse.redirect(new URL(errorUrl, process.env.NEXTAUTH_URL));
    }

    // Generate sign for token exchange
    const timestamp = Math.floor(Date.now() / 1000);
    const baseString = `${partnerId}${TOKEN_PATH}${timestamp}`;
    const sign = crypto
      .createHmac('sha256', partnerKey)
      .update(baseString)
      .digest('hex');

    const tokenResponse = await fetch(
      `${baseUrl}${TOKEN_PATH}?partner_id=${partnerId}&timestamp=${timestamp}&sign=${sign}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code, shop_id: Number(shopId), partner_id: Number(partnerId) }),
      }
    );

    if (!tokenResponse.ok) {
      const text = await tokenResponse.text();
      logger.error({ status: tokenResponse.status, body: text }, 'Shopee token exchange failed');
      const errorUrl = getIntegrationErrorRedirect(
        IntegrationProvider.SHOPEE,
        'token_exchange_failed'
      );
      return NextResponse.redirect(new URL(errorUrl, process.env.NEXTAUTH_URL));
    }

    const tokens = await tokenResponse.json();

    if (tokens.error && tokens.error !== '') {
      logger.error({ error: tokens.error, message: tokens.message }, 'Shopee token exchange API error');
      const errorUrl = getIntegrationErrorRedirect(
        IntegrationProvider.SHOPEE,
        'token_exchange_failed'
      );
      return NextResponse.redirect(new URL(errorUrl, process.env.NEXTAUTH_URL));
    }

    const expiresAt = new Date(Date.now() + tokens.expire_in * 1000);

    await ShopeeIntegration.connectShopee(session.user.id, {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expire_in: tokens.expire_in,
      shop_id: shopId,
    });

    await prisma.user.update({
      where: { id: session.user.id },
      data: { shopeeSyncStatus: ShopeeSyncStatus.SYNCING },
    });

    await inngest.send({ name: 'shopee/sync:user', data: { userId: session.user.id } });

    const successUrl = getIntegrationSuccessRedirect(IntegrationProvider.SHOPEE);
    return NextResponse.redirect(new URL(successUrl, process.env.NEXTAUTH_URL));
  } catch (error) {
    logger.error(error, 'Error in Shopee callback');
    const errorUrl = getIntegrationErrorRedirect(IntegrationProvider.SHOPEE, 'connection_failed');
    return NextResponse.redirect(new URL(errorUrl, process.env.NEXTAUTH_URL));
  }
}
