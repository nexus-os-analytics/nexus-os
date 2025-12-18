import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { listUsers } from '@/features/users/services/user.service';
import { authOptions } from '@/lib/next-auth';

export async function GET(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { searchParams } = new URL(req.url);
  const search = searchParams.get('search') ?? undefined;
  const role = (searchParams.get('role') ?? undefined) as
    | 'USER'
    | 'ADMIN'
    | 'SUPER_ADMIN'
    | 'GUEST'
    | undefined;
  const page = Number(searchParams.get('page') ?? '1');
  const pageSize = Number(searchParams.get('pageSize') ?? '10');
  const orderBy = (searchParams.get('orderBy') ?? undefined) as
    | 'createdAt'
    | 'name'
    | 'email'
    | 'role'
    | undefined;
  const order = (searchParams.get('order') ?? undefined) as 'asc' | 'desc' | undefined;

  const data = await listUsers({ search, role, page, pageSize, orderBy, order });
  return NextResponse.json(data);
}
