import { MeliSyncStatus } from '@prisma/client';
import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { MeliIntegration } from '@/lib/mercado-livre/meli-integration';
import { inngest } from '@/lib/inngest/client';
import { authOptions } from '@/lib/next-auth';
import prisma from '@/lib/prisma';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/mercado-livre?error=auth_failed&message=${error}`
      );
    }

    if (!code) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/mercado-livre?error=invalid_callback`
      );
    }

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/mercado-livre?error=unauthorized`);
    }

    const clientId = process.env.MELI_CLIENT_ID;
    const clientSecret = process.env.MELI_CLIENT_SECRET;
    const redirectUri = process.env.MELI_REDIRECT_URI;

    if (!clientId || !clientSecret || !redirectUri) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/mercado-livre?error=config_missing`
      );
    }

    // Exchange code for access token
    const tokenUrl = process.env.MELI_TOKEN_URL ?? 'https://api.mercadolibre.com/oauth/token';
    const tokenResponse = await fetch(tokenUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        client_id: clientId,
        client_secret: clientSecret,
        code,
        redirect_uri: redirectUri,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      console.error('Token exchange failed:', errorText);
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/mercado-livre?error=token_exchange_failed`
      );
    }

    const tokens = await tokenResponse.json();

    // Save integration to database
    await MeliIntegration.connectMeli(session?.user?.id, {
      access_token: tokens.access_token,
      refresh_token: tokens.refresh_token,
      expires_in: tokens.expires_in,
      token_type: tokens.token_type,
      user_id: tokens.user_id,
      scope: tokens.scope ?? 'read write',
    });

    // Update user sync status to SYNCING immediately
    await prisma.user.update({
      where: { id: session.user.id },
      data: { meliSyncStatus: MeliSyncStatus.SYNCING },
    });

    // Trigger initial sync
    await inngest.send({ name: 'meli/sync:user', data: { userId: session.user.id } });

    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/mercado-livre?success=meli_connected`
    );
  } catch (error) {
    console.error('Error in Mercado Livre callback:', error);
    return NextResponse.redirect(
      `${process.env.NEXTAUTH_URL}/mercado-livre?error=connection_failed`
    );
  }
}
