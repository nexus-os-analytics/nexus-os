import type { UserRole } from '@prisma/client';
import type { DefaultUser } from 'next-auth';
import type { PERMISSIONS } from './auth.constants';

export interface User extends DefaultUser {
  id: string;
  name?: string | null;
  email?: string | null;
  role: UserRole;
  avatar?: string | null;
  required2FA?: boolean;
  onboardingCompleted?: boolean;
}

export type PermissionKeys<T> = {
  [K in keyof T]: T[K] extends Array<unknown>
    ? Extract<K, string>
    : T[K] extends object
      ? `${Extract<K, string>}.${PermissionKeys<T[K]>}`
      : Extract<K, string>;
}[keyof T];

export type PermissionPath = PermissionKeys<typeof PERMISSIONS>;
