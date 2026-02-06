import { NextResponse } from 'next/server';
import { createActivationToken, sendWelcomeActivationEmail } from '@/features/auth/services';
import prisma from '@/lib/prisma';

const lastSentMap = new Map<string, number>();
const MS_IN_SECOND = 1000;
const SECONDS_IN_MINUTE = 60;
const ONE_MINUTE_MS = SECONDS_IN_MINUTE * MS_IN_SECOND;

export async function POST(req: Request) {
  try {
    const { email } = (await req.json()) as { email?: string };
    if (!email) {
      return NextResponse.json({ error: 'E-mail é obrigatório' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) {
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    if (user.emailVerified) {
      return NextResponse.json({ error: 'Conta já verificada' }, { status: 400 });
    }

    const last = lastSentMap.get(email);
    const now = Date.now();
    if (last && now - last < ONE_MINUTE_MS) {
      const waitSec = Math.ceil((ONE_MINUTE_MS - (now - last)) / MS_IN_SECOND);
      return NextResponse.json(
        { error: `Aguarde ${waitSec}s para reenviar o e-mail de verificação.` },
        { status: 429 }
      );
    }

    const { token } = await createActivationToken(email);
    const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
    const activationLink = `${appUrl}/api/activate?token=${encodeURIComponent(token)}`;

    await sendWelcomeActivationEmail({ email, name: user.name, activationLink });
    lastSentMap.set(email, now);

    return NextResponse.json({ message: 'E-mail de verificação reenviado com sucesso!' });
  } catch (err) {
    console.error('resend-verification error', err);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
