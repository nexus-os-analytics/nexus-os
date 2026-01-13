'use client';
import { AppShell } from '@mantine/core';
import { useHeadroom } from '@mantine/hooks';
import { PublicFooter } from '@/components/layout/PublicLayout/PublicFooter';
import { PublicHeader } from '@/components/layout/PublicLayout/PublicHeader';

export function PublicLayout({ children }: { children: React.ReactNode }) {
  const pinned = useHeadroom({ fixedAt: 120 });

  return (
    <AppShell header={{ height: 100, collapsed: !pinned, offset: false }} padding="md">
      <AppShell.Header p="md">
        <PublicHeader />
      </AppShell.Header>

      <AppShell.Main pt="var(--app-shell-header-height)" px={0}>
        {children}
      </AppShell.Main>

      <AppShell.Footer p={0} pos="relative">
        <PublicFooter />
      </AppShell.Footer>
    </AppShell>
  );
}
