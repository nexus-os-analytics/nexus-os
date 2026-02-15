import pino from 'pino';
import prisma from '@/lib/prisma';
import { generateDeletedEmail } from '../utils';

const logger = pino();

export interface ListUsersParams {
  search?: string;
  role?: 'USER' | 'ADMIN' | 'SUPER_ADMIN' | 'GUEST';
  page?: number;
  pageSize?: number;
  orderBy?: 'createdAt' | 'name' | 'email' | 'role';
  order?: 'asc' | 'desc';
}

export async function listUsers(params: ListUsersParams) {
  const page = params.page ?? 1;
  const pageSize = params.pageSize ?? 10;
  const where = {
    deletedAt: null,
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
  }
) {
  return prisma.user.update({
    where: { id },
    data,
  });
}

/**
 * Soft delete a user by setting deletedAt and randomizing their email.
 * This allows the original email to be reused by new users.
 *
 * @param id - The UUID of the user to delete
 * @returns The updated user record
 *
 * @example
 * ```typescript
 * await deleteUser('a1b2c3d4-e5f6-7890-abcd-ef1234567890');
 * // User's email becomes: deleted-1739587200000-a1b2c3d4@removed.local
 * ```
 */
export async function deleteUser(id: string) {
  const deletedEmail = generateDeletedEmail(id);
  const deletedAt = new Date();

  return prisma.$transaction(async (tx) => {
    // Fetch original email for audit trail
    const user = await tx.user.findUnique({
      where: { id },
      select: { email: true, name: true },
    });

    if (!user) {
      logger.error({ userId: id }, 'Attempted to delete non-existent user');
      throw new Error('Usuário não encontrado');
    }

    // Soft delete with email randomization
    const updated = await tx.user.update({
      where: { id },
      data: {
        deletedAt,
        email: deletedEmail,
      },
    });

    // Create audit log
    await tx.auditLog.create({
      data: {
        userId: id,
        action: 'USER_DELETED',
        resource: 'User',
        metadata: `Email changed from ${user.email} to ${deletedEmail}`,
      },
    });

    logger.info(
      {
        userId: id,
        userName: user.name,
        originalEmail: user.email,
        deletedEmail,
        deletedAt: deletedAt.toISOString(),
      },
      'User soft deleted with email randomization'
    );

    return updated;
  });
}

export async function toggleUserStatus(id: string, disabled: boolean) {
  return prisma.user.update({
    where: { id },
    data: { deletedAt: disabled ? new Date() : null },
  });
}
