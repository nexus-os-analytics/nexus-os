'use server';
import crypto from 'node:crypto';
import { sendEmail } from '@/lib/brevo';
import prisma from '@/lib/prisma';

interface SendWelcomeParams {
  email: string;
  name?: string | null;
  activationLink: string;
}

interface CreateActivationTokenResult {
  token: string;
  expiresAt: Date;
}

function hashToken(token: string): string {
  return crypto.createHash('sha256').update(token).digest('hex');
}

export async function createActivationToken(
  email: string,
  ttlHours = 72
): Promise<CreateActivationTokenResult> {
  const RANDOM_BYTES_LENGTH = 32;
  const MS_IN_SECOND = 1000;
  const SECONDS_IN_MINUTE = 60;
  const MINUTES_IN_HOUR = 60;
  const token = crypto.randomBytes(RANDOM_BYTES_LENGTH).toString('hex');
  const hashed = hashToken(token);
  const expiresAt = new Date(
    Date.now() + ttlHours * MINUTES_IN_HOUR * SECONDS_IN_MINUTE * MS_IN_SECOND
  );

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

export async function sendWelcomeActivationEmail({
  email,
  name,
  activationLink,
}: SendWelcomeParams): Promise<void> {
  const subject = 'Bem-vindo ao Nexus OS — Ative sua conta';
  await sendEmail({
    toEmail: email,
    toName: name || 'Cliente',
    subject,
    link: activationLink,
    templateName: 'welcome',
  });
}
