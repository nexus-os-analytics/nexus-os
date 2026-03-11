import type {
  BlingSyncStatus,
  IntegrationProvider,
  MeliSyncStatus,
  PlanTier,
  ShopeeSyncStatus,
  UserRole,
} from '@prisma/client';
import type { DefaultSession } from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      role: UserRole;
      image?: string | null;
      onboardingCompleted: boolean;
      activeIntegrationProvider?: IntegrationProvider | null;
      blingSyncStatus: BlingSyncStatus;
      hasBlingIntegration: boolean;
      meliSyncStatus?: MeliSyncStatus | null;
      hasMeliIntegration: boolean;
      shopeeSyncStatus?: ShopeeSyncStatus | null;
      hasShopeeIntegration: boolean;
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
    activeIntegrationProvider?: IntegrationProvider | null;
    blingSyncStatus: BlingSyncStatus;
    hasBlingIntegration?: boolean;
    meliSyncStatus?: MeliSyncStatus | null;
    hasMeliIntegration?: boolean;
    shopeeSyncStatus?: ShopeeSyncStatus | null;
    hasShopeeIntegration?: boolean;
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
    activeIntegrationProvider?: IntegrationProvider | null;
    blingSyncStatus: BlingSyncStatus;
    hasBlingIntegration: boolean;
    meliSyncStatus?: MeliSyncStatus | null;
    hasMeliIntegration: boolean;
    shopeeSyncStatus?: ShopeeSyncStatus | null;
    hasShopeeIntegration: boolean;
    auditCreated?: boolean;
    planTier?: PlanTier;
    subscriptionStatus?: string | null;
    cancelAtPeriodEnd?: boolean;
  }
}
