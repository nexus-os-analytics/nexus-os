import { NextResponse } from 'next/server';
import { consumeActivationToken } from '@/features/auth/services';
import { APP_URL } from '@/lib/constants';
import prisma from '@/lib/prisma';

export async function GET(request: Request) {
  try {
    const url = new URL(request.url);
    const token = url.searchParams.get('token');
    const email = url.searchParams.get('email');

    if (!token || !email) {
      return NextResponse.json({ error: 'Parâmetros inválidos.' }, { status: 400 });
    }

    const ok = await consumeActivationToken(email, token);
    if (!ok) {
      return NextResponse.json({ error: 'Token inválido ou expirado.' }, { status: 400 });
    }

    await prisma.user.update({
      where: { 
        email_deletedAt: {
          email,
          deletedAt: null
        }
      },
      data: { emailVerified: new Date() },
    });

    return NextResponse.redirect(`${APP_URL}/bling?activated=1`, { status: 302 });
  } catch (err) {
    console.error('Error activating account:', err);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
