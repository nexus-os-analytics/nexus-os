import bcrypt from 'bcryptjs';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getInvitationByToken } from '@/features/users/services/invitation.service';
import prisma from '@/lib/prisma';

const MIN_PASSWORD_LENGTH = 6;
const AcceptInviteSchema = z
  .object({
    token: z.string().min(1, 'Token é obrigatório'),
    password: z.string().min(MIN_PASSWORD_LENGTH, 'A senha deve ter pelo menos 6 caracteres'),
    confirmPassword: z
      .string()
      .min(MIN_PASSWORD_LENGTH, 'A confirmação de senha deve ter pelo menos 6 caracteres'),
  })
  .refine((data) => data.password === data.confirmPassword, {
    message: 'As senhas não coincidem',
    path: ['confirmPassword'],
  });

function nameFromEmail(email: string) {
  const local = email.split('@')[0] || 'usuario';
  const s = local.replaceAll('.', ' ').replaceAll('_', ' ').replaceAll('-', ' ').trim();
  return s
    .split(' ')
    .filter(Boolean)
    .map((w) => w[0]?.toUpperCase() + w.slice(1))
    .join(' ');
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const parsed = AcceptInviteSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Dados inválidos', details: parsed.error.issues },
        { status: 400 }
      );
    }

    const { token, password } = parsed.data;

    const invite = await getInvitationByToken(token);
    if (!invite || invite.consumedAt || invite.expiresAt < new Date()) {
      return NextResponse.json({ error: 'Convite inválido ou expirado.' }, { status: 400 });
    }

    const existing = await prisma.user.findUnique({ where: { email: invite.email } });
    if (existing) {
      return NextResponse.json(
        { error: 'Já existe uma conta com este e-mail. Faça login ou redefina a senha.' },
        { status: 409 }
      );
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await prisma.$transaction(async (tx) => {
      const created = await tx.user.create({
        data: {
          name: nameFromEmail(invite.email),
          email: invite.email,
          hashedPassword,
          role: invite.role,
          emailVerified: new Date(),
          acceptedTerms: true,
        },
      });

      await tx.auditLog.create({
        data: {
          userId: created.id,
          action: 'ACCEPT_INVITE',
          resource: 'UserInvitation',
          metadata: `Convite aceito para ${invite.email}`,
        },
      });

      await tx.userInvitation.update({
        where: { token: invite.token },
        data: { consumedAt: new Date() },
      });

      return created;
    });

    return NextResponse.json({ email: user.email }, { status: 200 });
  } catch (error) {
    console.error('Erro em POST /api/users/invite/accept:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
