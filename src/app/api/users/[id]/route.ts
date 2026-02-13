import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { getUserById } from '@/features/users/services/user.service';
import { authOptions } from '@/lib/next-auth';

export async function GET(_req: Request, context: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Only SUPER_ADMIN can access user management
  if (session.user.role !== 'SUPER_ADMIN') {
    return NextResponse.json(
      { error: 'Acesso negado. Apenas SUPER_ADMIN pode gerenciar usuários.' },
      { status: 403 }
    );
  }

  try {
    const { id } = await context.params;
    if (!id) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }

    const user = await getUserById(id);
    if (!user) {
      return NextResponse.json({ error: 'Not found' }, { status: 404 });
    }
    return NextResponse.json(user);
  } catch {
    return NextResponse.json({ error: 'Failed to fetch user' }, { status: 500 });
  }
}
