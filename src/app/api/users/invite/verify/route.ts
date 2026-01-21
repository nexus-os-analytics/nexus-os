import { type NextRequest, NextResponse } from 'next/server';
import { getInvitationByToken } from '@/features/users/services/invitation.service';

export async function GET(req: NextRequest) {
  try {
    const token = req.nextUrl.searchParams.get('token');
    if (!token || typeof token !== 'string') {
      return NextResponse.json({ error: 'Token inválido.' }, { status: 400 });
    }

    const invite = await getInvitationByToken(token);
    if (!invite || invite.consumedAt || invite.expiresAt < new Date()) {
      return NextResponse.json({ isValid: false }, { status: 400 });
    }

    return NextResponse.json(
      { isValid: true, email: invite.email, role: invite.role },
      { status: 200 }
    );
  } catch (error) {
    console.error('Erro em GET /api/users/invite/verify:', error);
    return NextResponse.json({ error: 'Erro interno do servidor' }, { status: 500 });
  }
}
