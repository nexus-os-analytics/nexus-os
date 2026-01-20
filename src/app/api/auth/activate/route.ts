import { NextResponse } from 'next/server';
import { consumeActivationToken } from '@/features/auth/services/activation-token';
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
      where: { email },
      data: { emailVerified: new Date() },
    });

    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    return NextResponse.redirect(`${appUrl}/login?activated=1`, { status: 302 });
  } catch (err) {
    console.error('Error activating account:', err);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
