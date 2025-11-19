'use client';
import { AppShell, Center, Container, Group, Loader, Skeleton } from '@mantine/core';

export function AdminLayoutSkeleton() {
  return (
    <AppShell padding="md" header={{ height: { base: 60, md: 70, lg: 80 } }}>
      <AppShell.Header>
        <Container size="xl" h="100%">
          <Group h="100%" px="md" justify="space-between">
            <Skeleton height={40} width={200} radius="md" />
            <Skeleton height={40} width={120} radius="md" />
          </Group>
        </Container>
      </AppShell.Header>
      <AppShell.Main>
        <Center h="calc(100vh - 120px)">
          <Loader size="lg" />
        </Center>
      </AppShell.Main>
    </AppShell>
  );
}
