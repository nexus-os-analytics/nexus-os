import bcrypt from 'bcryptjs';
import { type NextRequest, NextResponse } from 'next/server';
import { type ResetPasswordRequest, ResetPasswordSchema } from '@/features/auth/services';
import prisma from '@/lib/prisma';

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token');

    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Token inválido.' }, { status: 400 });
    }

    const user = await prisma.user.findFirst({
      where: { resetToken: token, resetTokenExpiry: { gte: new Date() } },
    });

    if (!user) {
      return NextResponse.json(
        {
          error:
            'Token inválido ou expirado. Por favor, verifique o link enviado para o seu e-mail.',
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { message: 'Token de redefinição de senha é válido.' },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro em GET /api/reset-password:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as ResetPasswordRequest;
    const parsedBody = ResetPasswordSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        {
          error: 'Por favor, verifique os dados enviados.',
          issues: parsedBody.error.issues,
        },
        { status: 400 }
      );
    }

    const { password, token } = parsedBody.data;

    const user = await prisma.user.findFirst({
      where: { resetToken: token, resetTokenExpiry: { gte: new Date() } },
    });

    if (!user) {
      return NextResponse.json(
        {
          error:
            'Token inválido ou expirado. Por favor, verifique o link enviado para o seu e-mail.',
        },
        { status: 400 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    await prisma.user.update({
      where: { id: user.id },
      data: {
        hashedPassword,
        resetToken: null,
        resetTokenExpiry: null,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'RESET_PASSWORD',
        resource: 'User',
        metadata: `Senha redefinida para ${user.email}`,
      },
    });

    return NextResponse.json({ message: 'Senha redefinida com sucesso!' }, { status: 200 });
  } catch (error) {
    console.error('Erro em POST /api/reset-password:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
