import { NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

export async function GET(req: Request) {
  const url = new URL(req.url);
  const email = url.searchParams.get('email');
  if (!email) {
    return NextResponse.json({ error: 'E-mail é obrigatório' }, { status: 400 });
  }
  const user = await prisma.user.findFirst({
    where: {
      email,
      deletedAt: null,
    },
  });
  if (!user) {
    return NextResponse.json({ verified: false });
  }
  return NextResponse.json({ verified: !!user.emailVerified });
}
