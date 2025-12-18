import { randomBytes } from 'node:crypto';
import prisma from '@/lib/prisma';

const INVITE_TOKEN_BYTES = 32;
export function generateInviteToken() {
  return randomBytes(INVITE_TOKEN_BYTES).toString('hex');
}

const DEFAULT_INVITE_EXPIRY_HOURS = 72;
export async function createInvitation(params: {
  email: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  invitedByUserId: string;
  expiresInHours?: number;
}) {
  const token = generateInviteToken();
  const SECONDS_IN_MINUTE = 60;
  const MINUTES_IN_HOUR = 60;
  const MILLISECONDS_IN_SECOND = 1000;
  const MILLISECONDS_IN_HOUR = MINUTES_IN_HOUR * SECONDS_IN_MINUTE * MILLISECONDS_IN_SECOND;
  const expiresAt = new Date(
    Date.now() + (params.expiresInHours ?? DEFAULT_INVITE_EXPIRY_HOURS) * MILLISECONDS_IN_HOUR
  );

  const invite = await prisma.userInvitation.create({
    data: {
      email: params.email,
      role: params.role,
      token,
      invitedByUserId: params.invitedByUserId,
      expiresAt,
    },
  });

  return invite;
}

export async function getInvitationByToken(token: string) {
  return prisma.userInvitation.findUnique({ where: { token } });
}

export async function consumeInvitation(token: string) {
  return prisma.userInvitation.update({
    where: { token },
    data: { consumedAt: new Date() },
  });
}
