'use server';
import { revalidatePath } from 'next/cache';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/next-auth';
import prisma from '@/lib/prisma';

interface UserSettingsInput {
  financial: {
    capitalCost: number;
    storageCost: number;
  };
  operational: {
    defaultReplenishmentTime: number;
    safetyDays: number;
  };
  goals: {
    recoveryTarget: number;
    maxLiquidationDays: number;
  };
}

/**
 * Server Action — Save or update user settings
 */
export async function saveUserSettings(_: UserSettingsInput) {
  const session = await getServerSession(authOptions);

  if (!session?.user?.email) {
    throw new Error('Unauthorized');
  }

  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: session.user.email },
  });

  if (!user) {
    throw new Error('User not found');
  }

  // Map frontend structure → Prisma schema fields
  // const payload = {
  //   capitalCost: data.financial.capitalCost,
  //   storageCost: data.financial.storageCost,
  //   defaultRestockTime: data.operational.defaultReplenishmentTime,
  //   safetyDays: data.operational.safetyDays,
  //   recoveryTarget: data.goals.recoveryTarget,
  //   maxRecoveryPeriod: data.goals.maxLiquidationDays,
  // };

  // Upsert ensures idempotent save
  // const updated = await prisma.userSettings.upsert({
  //   where: { userId: user.id },
  //   create: { userId: user.id, ...payload },
  //   update: { ...payload },
  // });

  await prisma.user.update({
    where: { id: user.id },
    data: { onboardingCompleted: true },
  });

  // this ensures middleware redirects work correctly post-onboarding
  session.user['onboardingCompleted'] = true;

  // Optional: revalidate UI paths that depend on settings
  revalidatePath('/onboarding');

  return { success: true };
}
