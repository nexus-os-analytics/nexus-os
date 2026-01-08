'use client';
import { AppShell, Group, SimpleGrid, Skeleton, Stack } from '@mantine/core';

export function PublicLayoutSkeleton() {
  return (
    <AppShell header={{ height: 100, collapsed: false }} padding="md">
      <AppShell.Header p="md">
        <Group justify="space-between" h="100%">
          <Skeleton height={30} width={100} radius="md" />
          <Group h="100%" gap="xs" visibleFrom="sm">
            <Skeleton height={30} width={60} radius="md" />
            <Skeleton height={30} width={160} radius="md" />
          </Group>
          <Group visibleFrom="sm">
            <Skeleton height={30} width={80} radius="md" />
            <Skeleton height={30} width={100} radius="md" />
          </Group>
        </Group>
      </AppShell.Header>

      <AppShell.Main pt="var(--app-shell-header-height)">
        <Stack mt="lg">
          <Skeleton height={300} radius="md" />
          <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
            <Skeleton height={200} radius="md" />
            <Skeleton height={200} radius="md" />
            <Skeleton height={200} radius="md" />
            <Skeleton height={200} radius="md" />
          </SimpleGrid>
        </Stack>
      </AppShell.Main>
    </AppShell>
  );
}
