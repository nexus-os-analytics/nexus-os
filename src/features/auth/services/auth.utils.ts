import type { UserRole } from '@prisma/client';
import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { PERMISSIONS } from './auth.constants';
import type { PermissionPath } from './auth.types';

export function getPermissions<Path extends PermissionPath>(path: Path): ReadonlyArray<UserRole> {
  const keys = path.split('.');
  let acc: unknown = PERMISSIONS as Record<string, unknown>;
  for (const key of keys) {
    if (typeof acc !== 'object' || acc === null) return [];
    acc = (acc as Record<string, unknown>)[key];
  }
  return Array.isArray(acc) ? (acc as ReadonlyArray<UserRole>) : [];
}

export function generateTwoFactorSecret(email: string) {
  const secret = authenticator.generateSecret();
  const serviceName = 'YourAppName';
  const otpAuthUrl = authenticator.keyuri(email, serviceName, secret);

  return { secret, otpAuthUrl };
}

export async function generateQRCode(otpAuthUrl: string) {
  try {
    const qrCodeDataUrl = await QRCode.toDataURL(otpAuthUrl);
    return qrCodeDataUrl;
  } catch (error) {
    console.error('Error generating QR code:', error);
    throw error;
  }
}

export function verifyToken(token: string, secret: string) {
  try {
    return authenticator.verify({ token, secret });
  } catch (error) {
    console.error('Error verifying token:', error);
    return false;
  }
}
