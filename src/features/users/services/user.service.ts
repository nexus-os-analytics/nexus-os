import prisma from '@/lib/prisma';

export interface ListUsersParams {
  search?: string;
  role?: 'USER' | 'ADMIN' | 'SUPER_ADMIN' | 'GUEST';
  status?: 'active' | 'inactive';
  page?: number;
  pageSize?: number;
  orderBy?: 'createdAt' | 'name' | 'email' | 'role';
  order?: 'asc' | 'desc';
}

export async function listUsers(params: ListUsersParams) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const where: Record<string, unknown> = {
    ...(params.role ? { role: params.role } : {}),
    ...(params.search
      ? {
          OR: [
            { name: { contains: params.search, mode: 'insensitive' as const } },
            { email: { contains: params.search, mode: 'insensitive' as const } },
            { phone: { contains: params.search, mode: 'insensitive' as const } },
          ],
        }
      : {}),
  };

  if (params.status === 'active') {
    where.deletedAt = null;
  } else if (params.status === 'inactive') {
    // Prisma negation to find records where deletedAt is not null
    Object.assign(where, { NOT: { deletedAt: null } });
  }

  const [items, total] = await Promise.all([
    prisma.user.findMany({
      where,
      orderBy: { [params.orderBy ?? 'createdAt']: params.order ?? 'desc' },
      skip: (page - 1) * pageSize,
      take: pageSize,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        image: true,
        phone: true,
        acceptedTerms: true,
        createdAt: true,
        isTwoFactorEnabled: true,
        failedAttempts: true,
        lockedUntil: true,
        planTier: true,
        deletedAt: true,
      },
    }),
    prisma.user.count({ where }),
  ]);

  return { items, total, page, pageSize };
}

export async function getUserById(id: string) {
  return prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      image: true,
      phone: true,
      acceptedTerms: true,
      isTwoFactorEnabled: true,
      failedAttempts: true,
      lockedUntil: true,
      createdAt: true,
      emailVerified: true,
    },
  });
}

export async function createUser(data: {
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  phone?: string | null;
}) {
  return prisma.user.create({
    data: {
      name: data.name,
      email: data.email,
      role: data.role,
      phone: data.phone ?? null,
      acceptedTerms: true,
    },
  });
}

export async function updateUser(
  id: string,
  data: {
    name?: string;
    role?: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
    phone?: string | null;
    image?: string | null;
    email?: string;
    planTier?: 'FREE' | 'PRO';
  }
) {
  return prisma.user.update({
    where: { id },
    data,
  });
}

export async function deleteUser(id: string) {
  return prisma.user.update({
    where: { id },
    data: { deletedAt: new Date() },
  });
}

export async function toggleUserStatus(id: string, disabled: boolean) {
  return prisma.user.update({
    where: { id },
    data: { deletedAt: disabled ? new Date() : null },
  });
}
