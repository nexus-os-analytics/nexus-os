'use server';
import { getServerSession } from 'next-auth';
import { z } from 'zod';
import {
  createUser,
  deleteUser,
  toggleUserStatus,
  updateUser,
} from '@/features/users/services/user.service';
import { authOptions } from '@/lib/next-auth';

const NAME_MIN_LENGTH = 2;
const NAME_MAX_LENGTH = 120;
const PHONE_MIN_LENGTH = 8;
const PHONE_MAX_LENGTH = 20;
const CreateSchema = z.object({
  name: z.string().min(NAME_MIN_LENGTH).max(NAME_MAX_LENGTH),
  email: z.string().email({ message: 'E-mail inválido' }),
  role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']).default('USER'),
  phone: z.string().min(PHONE_MIN_LENGTH).max(PHONE_MAX_LENGTH).nullable().optional(),
});

export async function createUserAction(input: z.infer<typeof CreateSchema>) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    throw new Error('Not authorized');
  }
  const data = CreateSchema.parse(input);
  return createUser(data);
}

const UpdateSchema = z.object({
  id: z.string().uuid({ message: 'ID inválido' }),
  name: z.string().min(NAME_MIN_LENGTH).max(NAME_MAX_LENGTH).optional(),
  role: z.enum(['USER', 'ADMIN', 'SUPER_ADMIN']).optional(),
  phone: z.string().min(PHONE_MIN_LENGTH).max(PHONE_MAX_LENGTH).nullable().optional(),
  image: z.string().url({ message: 'URL inválida' }).nullable().optional(),
  email: z.string().email({ message: 'E-mail inválido' }).optional(),
  planTier: z.enum(['FREE', 'PRO']).optional(),
});

export async function updateUserAction(input: z.infer<typeof UpdateSchema>) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    throw new Error('Not authorized');
  }
  const data = UpdateSchema.parse(input);
  return updateUser(data.id, data);
}

export async function deleteUserAction(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    throw new Error('Not authorized');
  }
  return deleteUser(id);
}

export async function toggleUserStatusAction(id: string, disabled: boolean) {
  const session = await getServerSession(authOptions);
  if (!session?.user || !['ADMIN', 'SUPER_ADMIN'].includes(session.user.role)) {
    throw new Error('Not authorized');
  }
  return toggleUserStatus(id, disabled);
}
