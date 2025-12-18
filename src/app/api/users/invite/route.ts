import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import { createInvitation } from '@/features/users/services/invitation.service';
import { sendEmail } from '@/lib/brevo';
import { authOptions } from '@/lib/next-auth';

const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 120;
const bodySchema = z.object({
  name: z.string().min(NAME_MIN_LENGTH).max(NAME_MAX_LENGTH),
  email: z.string().email({ message: 'E-mail inválido' }),
  role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']).default('USER'),
});

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role as string)) {
    return NextResponse.json({ error: 'Not authorized' }, { status: 403 });
  }

  const json = await req.json();
  const parsed = bodySchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Invalid body', details: parsed.error.issues },
      { status: 400 }
    );
  }

  const { name, email, role } = parsed.data;

  const invite = await createInvitation({
    email,
    role,
    invitedByUserId: session.user.id as string,
  });

  const inviteLinkBase = process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000';
  const inviteLink = `${inviteLinkBase}/auth/cadastre-se?invite=${invite.token}`;

  await sendEmail({
    toEmail: email,
    toName: name,
    subject: 'Convite para acessar o NexusOS',
    link: inviteLink,
    templateName: 'inviteUser',
  });

  return NextResponse.json({ ok: true, token: invite.token });
}
