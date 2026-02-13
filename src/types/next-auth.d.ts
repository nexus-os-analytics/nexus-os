import type { BlingSyncStatus, PlanTier, UserRole } from '@prisma/client';
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      image?: string | null;
      onboardingCompleted: boolean;
      blingSyncStatus: BlingSyncStatus;
      hasBlingIntegration: boolean;
      planTier: PlanTier;
      subscriptionStatus?: string | null;
      cancelAtPeriodEnd?: boolean;
    } & DefaultSession['user'];
    required2FA?: boolean;
  }

  interface User {
    id: string;
    role: UserRole;
    onboardingCompleted: boolean;
    required2FA?: boolean;
    blingSyncStatus: BlingSyncStatus;
    hasBlingIntegration?: boolean;
    planTier?: PlanTier;
    subscriptionStatus?: string | null;
    cancelAtPeriodEnd?: boolean;
  }
}

declare module 'next-auth/jwt' {
  interface JWT {
    id: string;
    role: UserRole;
    onboardingCompleted: boolean;
    required2FA?: boolean;
    blingSyncStatus: BlingSyncStatus;
    hasBlingIntegration: boolean;
    auditCreated?: boolean;
    planTier?: PlanTier;
    subscriptionStatus?: string | null;
    cancelAtPeriodEnd?: boolean;
  }
}
