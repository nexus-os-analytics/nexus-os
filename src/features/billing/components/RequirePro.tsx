'use client';
import { useSession } from 'next-auth/react';
import type { ReactNode } from 'react';
import { ProLockedState } from './ProLockedState';

interface RequireProProps {
  children: ReactNode;
}

export function RequirePro({ children }: RequireProProps) {
  const { data } = useSession();
  const plan = data?.user?.planTier ?? 'FREE';
  if (plan !== 'PRO') return <ProLockedState />;
  return <>{children}</>;
}
