'use client';
import { AppShell, Container } from '@mantine/core';
import { useAuth } from '@/features/auth/context/AuthContext';
import { UpgradeBanner } from '@/features/billing/components/UpgradeBanner';
import { AdminHeader } from './AdminHeader';
import { AdminLayoutSkeleton } from './AdminLayout.skeleton';

export function AdminLayout({ children }: { children: React.ReactNode }) {
  const { status } = useAuth();

  if (status === 'loading') return <AdminLayoutSkeleton />;

  return (
    <AppShell padding="md" header={{ height: { base: 60, md: 70, lg: 80 } }}>
      <AppShell.Header>
        <AdminHeader />
      </AppShell.Header>
      <AppShell.Main>
        <Container size="xl" px={0}>
          <UpgradeBanner />
          {children}
        </Container>
      </AppShell.Main>
    </AppShell>
  );
}
