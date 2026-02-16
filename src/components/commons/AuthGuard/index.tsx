'use client';
import { useAuth } from '@/features/auth/context/AuthContext';
import { UserRole } from '@prisma/client';

interface AuthGuardProps {
  children: React.ReactNode;
  roles?: UserRole[];
  fallback?: React.ReactNode;
}

export function AuthGuard({ children, roles, fallback }: AuthGuardProps) {
  const { user } = useAuth();

  if (!user) {
    return <>{fallback || null}</>;
  }

  if (roles && !roles.includes(user.role)) {
    return <>{fallback || null}</>;
  }

  return <>{children}</>;
}
