import crypto from 'crypto';
import prisma from '@/lib/prisma';

interface CreateActivationTokenResult {
  token: string;
  expiresAt: Date;
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function createActivationToken(
  email: string,
  ttlHours = 24
): Promise<CreateActivationTokenResult> {
  const token = crypto.randomBytes(32).toString('hex');
  const hashed = hashToken(token);
  const expiresAt = new Date(Date.now() + ttlHours * 60 * 60 * 1000);

  // Ensure any previous tokens for this identifier are removed
  await prisma.verificationToken.deleteMany({ where: { identifier: email } });

  await prisma.verificationToken.create({
    data: {
      identifier: email,
      token: hashed,
      expires: expiresAt,
    },
  });

  return { token, expiresAt };
}

export async function consumeActivationToken(email: string, token: string): Promise<boolean> {
  const hashed = hashToken(token);
  const record = await prisma.verificationToken.findFirst({
    where: { identifier: email, token: hashed },
  });

  if (!record) return false;
  if (record.expires < new Date()) {
    // Expired: cleanup and fail
    await prisma.verificationToken.deleteMany({ where: { identifier: email } });
    return false;
  }

  await prisma.verificationToken.delete({
    where: { token: record.token },
  });

  return true;
}
