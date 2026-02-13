import bcrypt from 'bcryptjs';
import { type NextRequest, NextResponse } from 'next/server';
import {
  createActivationToken,
  type SignUpRequest,
  SignUpSchema,
  sendWelcomeActivationEmail,
} from '@/features/auth/services';
import { APP_URL } from '@/lib/constants';
import prisma from '@/lib/prisma';

export async function POST(req: NextRequest) {
  try {
    const body = (await req.json()) as SignUpRequest;
    const parsedBody = SignUpSchema.safeParse(body);

    if (!parsedBody.success) {
      return NextResponse.json(
        { error: 'Por favor, verifique os dados enviados.', issues: parsedBody.error.issues },
        { status: 400 }
      );
    }

    const { email, password, name, terms: acceptedTerms } = parsedBody.data;

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return NextResponse.json({ error: 'O e-mail informado já está em uso.' }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.user.create({
      data: {
        name,
        email,
        hashedPassword,
        acceptedTerms: acceptedTerms ?? false,
        role: 'USER',
        planTier: 'FREE',
      },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    await prisma.auditLog.create({
      data: {
        userId: user.id,
        action: 'SIGN_UP',
        resource: 'User',
      },
    });

    // Generate activation token and send welcome email
    const { token } = await createActivationToken(user.email);
    const activationLink = `${APP_URL}/api/activate?token=${encodeURIComponent(token)}`;
    await sendWelcomeActivationEmail({ email: user.email, name: user.name, activationLink });

    return NextResponse.json(
      { message: 'Cadastro efetuado com sucesso! Verifique seu e-mail para confirmar sua conta.' },
      { status: 201 }
    );
  } catch (err) {
    console.error(err);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
