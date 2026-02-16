import type { Adapter, AdapterUser } from 'next-auth/adapters';
import { PrismaAdapter } from '@next-auth/prisma-adapter';
import type { PrismaClient } from '@prisma/client';

/**
 * Custom Prisma Adapter for NextAuth that handles soft delete with email reuse.
 *
 * The default PrismaAdapter uses findUnique with email, but our schema has a
 * compound unique constraint [email, deletedAt] to allow email reuse after soft delete.
 *
 * This adapter overrides methods that need to find users by email to use findFirst
 * with deletedAt: null filter instead of findUnique.
 */
export function CustomPrismaAdapter(prisma: PrismaClient): Adapter {
  const baseAdapter = PrismaAdapter(prisma);

  return {
    ...baseAdapter,

    /**
     * Override getUserByEmail to use findFirst with deletedAt filter
     * instead of findUnique with just email
     */
    async getUserByEmail(email: string): Promise<AdapterUser | null> {
      const user = await prisma.user.findFirst({
        where: {
          email,
          deletedAt: null,
        },
      });

      if (!user) return null;

      return {
        id: user.id,
        email: user.email,
        emailVerified: user.emailVerified,
        name: user.name,
        image: user.image,
        role: user.role,
        onboardingCompleted: user.onboardingCompleted,
        blingSyncStatus: user.blingSyncStatus,
      };
    },

    /**
     * Override getUserByAccount to ensure we only get active users
     */
    async getUserByAccount(provider_providerAccountId: {
      provider: string;
      providerAccountId: string;
    }): Promise<AdapterUser | null> {
      const account = await prisma.account.findUnique({
        where: {
          provider_providerAccountId: {
            provider: provider_providerAccountId.provider,
            providerAccountId: provider_providerAccountId.providerAccountId,
          },
        },
        include: {
          user: true,
        },
      });

      // Check if user is deleted
      if (!account || account.user.deletedAt) return null;

      return {
        id: account.user.id,
        email: account.user.email,
        emailVerified: account.user.emailVerified,
        name: account.user.name,
        image: account.user.image,
        role: account.user.role,
        onboardingCompleted: account.user.onboardingCompleted,
        blingSyncStatus: account.user.blingSyncStatus,
      };
    },

    /**
     * Override createUser to ensure emailVerified is set for OAuth users
     */
    async createUser(user: Omit<AdapterUser, 'id'>): Promise<AdapterUser> {
      const newUser = await prisma.user.create({
        data: {
          name: user.name ?? '',
          email: user.email,
          emailVerified: user.emailVerified,
          image: user.image,
          acceptedTerms: true, // OAuth users implicitly accept terms
        },
      });

      return {
        id: newUser.id,
        email: newUser.email,
        emailVerified: newUser.emailVerified,
        name: newUser.name,
        image: newUser.image,
        role: newUser.role,
        onboardingCompleted: newUser.onboardingCompleted,
        blingSyncStatus: newUser.blingSyncStatus,
      };
    },

    /**
     * Override linkAccount to ensure proper error handling
     */
    async linkAccount(account: {
      userId: string;
      type: string;
      provider: string;
      providerAccountId: string;
      refresh_token?: string;
      access_token?: string;
      expires_at?: number;
      token_type?: string;
      scope?: string;
      id_token?: string;
      session_state?: string;
    }): Promise<void> {
      await prisma.account.create({
        data: {
          userId: account.userId,
          type: account.type,
          provider: account.provider,
          providerAccountId: account.providerAccountId,
          refresh_token: account.refresh_token,
          access_token: account.access_token,
          expires_at: account.expires_at,
          token_type: account.token_type,
          scope: account.scope,
          id_token: account.id_token,
          session_state: account.session_state,
        },
      });
    },
  };
}
