import { authenticator } from 'otplib';
import QRCode from 'qrcode';
import { PERMISSIONS } from './auth.constants';
import type { PermissionPath } from './auth.types';

export function getPermissions<Path extends PermissionPath>(path: Path) {
  return path.split('.').reduce((acc, key) => acc?.[key], PERMISSIONS as any);
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
