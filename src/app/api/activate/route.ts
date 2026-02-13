import crypto from 'node:crypto';
import { NextResponse } from 'next/server';
import { APP_URL } from '@/lib/constants';
import prisma from '@/lib/prisma';

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const token = url.searchParams.get('token');
    if (!token) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 400 });
    }

    const hashed = hashToken(token);
    const record = await prisma.verificationToken.findFirst({ where: { token: hashed } });
    if (!record) {
      return NextResponse.json({ error: 'Token inválido' }, { status: 400 });
    }
    if (record.expires < new Date()) {
      await prisma.verificationToken.deleteMany({ where: { identifier: record.identifier } });
      return NextResponse.json({ error: 'Token expirado' }, { status: 400 });
    }

    const user = await prisma.user.findUnique({ where: { email: record.identifier } });
    if (!user) {
      await prisma.verificationToken.delete({ where: { token: record.token } });
      return NextResponse.json({ error: 'Usuário não encontrado' }, { status: 404 });
    }

    await prisma.$transaction(async (tx) => {
      await tx.user.update({
        where: { id: user.id },
        data: {
          emailVerified: new Date(),
        },
      });
      await tx.verificationToken.delete({ where: { token: record.token } });
      await tx.auditLog.create({
        data: {
          userId: user.id,
          action: 'ACTIVATE_ACCOUNT',
          resource: 'User',
          metadata: `Conta ativada para ${user.email}`,
        },
      });
    });

    // Redirect to login with success message instead of protected route
    const loginUrl = new URL('/login', APP_URL);
    loginUrl.searchParams.set('activated', '1');
    loginUrl.searchParams.set('email', user.email);
    return NextResponse.redirect(loginUrl.toString());
  } catch (error) {
    console.error('Erro em /api/activate:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
