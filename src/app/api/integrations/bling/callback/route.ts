import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { IntegrationService } from '@/lib/bling/integration-service';
import { inngest } from '@/lib/inngest/client';
import { authOptions } from '@/lib/next-auth';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);

    const code = searchParams.get('code');
    const error = searchParams.get('error');

    if (error) {
      return NextResponse.redirect(
        `${process.env.NEXTAUTH_URL}/bling?error=auth_failed&message=${error}`
      );
    }

    if (!code) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/bling?error=invalid_callback`);
    }

    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/bling?error=unauthorized`);
    }

    // Trocar code por access token
    const basicAuth = Buffer.from(
      `${process.env.BLING_CLIENT_ID}:${process.env.BLING_CLIENT_SECRET}`
    ).toString('base64');

    const tokenResponse = await fetch('https://www.bling.com.br/Api/v3/oauth/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        Authorization: `Basic ${basicAuth}`,
      },
      body: new URLSearchParams({
        grant_type: 'authorization_code',
        code,
        redirect_uri: `${process.env.NEXTAUTH_URL}/api/integrations/bling/callback`,
      }),
    });

    if (!tokenResponse.ok) {
      const errorText = await tokenResponse.text();
      throw new Error(`Token exchange failed: ${errorText}`);
    }

    const tokens = await tokenResponse.json();

    // Salvar integração no banco
    await IntegrationService.connectBling(session?.user?.id, tokens);

    // Disparar sincronização inicial
    inngest.send({ name: 'bling/sync-all' });

    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/bling?success=bling_connected`);
  } catch (error) {
    console.error('Error in Bling callback:', error);
    return NextResponse.redirect(`${process.env.NEXTAUTH_URL}/bling?error=connection_failed`);
  }
}
