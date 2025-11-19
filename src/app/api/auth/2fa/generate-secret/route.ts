import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authenticator } from 'otplib';
import { APP_NAME } from '@/lib/constants';
import { authOptions } from '@/lib/next-auth';
import prisma from '@/lib/prisma';

export async function POST() {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { email: true, twoFactorSecret: true, isTwoFactorEnabled: true },
  });

  if (!user?.email) {
    return NextResponse.json({ error: 'E-mail do usuário não informado' }, { status: 400 });
  }

  if (user.isTwoFactorEnabled && user.twoFactorSecret) {
    return NextResponse.json({
      otpauth: null,
    });
  }

  const secret = user.twoFactorSecret || authenticator.generateSecret();

  if (!user.twoFactorSecret) {
    await prisma.user.update({
      where: { id: session.user.id },
      data: { twoFactorSecret: secret },
    });
  }

  const otpauth = authenticator.keyuri(user.email, APP_NAME, secret);

  return NextResponse.json({
    otpauth,
  });
}
