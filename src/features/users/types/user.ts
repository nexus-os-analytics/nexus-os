export interface User {
  id: string;
  name: string;
  email: string;
  role: 'USER' | 'ADMIN' | 'SUPER_ADMIN';
  image?: string | null;
  phone?: string | null;
  acceptedTerms: boolean;
  createdAt: string;
  isTwoFactorEnabled: boolean;
  failedAttempts: number;
  lockedUntil?: string | null;
  planTier?: 'FREE' | 'PRO';
  deletedAt?: string | null;
}
