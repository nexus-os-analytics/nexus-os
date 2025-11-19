'use client';
import { Container, Group, ThemeIcon, Tooltip } from '@mantine/core';
import { IconCircleCheck } from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';
import { UserDropdown } from '@/components/commons/UserDropdown';
import { useBlingIntegration } from '@/hooks/useBlingIntegration';

export function AdminHeader() {
  const { status } = useBlingIntegration();

  return (
    <Container size="xl" h="100%">
      <Group justify="space-between" h="100%">
        <Link href="/dashboard" style={{ textDecoration: 'none' }}>
          <Image src="/img/logo.png" alt="Nexus OS" width={64} height={64} />
        </Link>
        <Group gap="xs">
          {status?.connected && (
            <Tooltip label="Bling conectado!">
              <Group align="baseline" gap={4}>
                <ThemeIcon color="green.9" variant="light" size={20}>
                  <IconCircleCheck />
                </ThemeIcon>
                <Image src="/img/bling-logo.png" alt="Bling Conectado" width={45} height={18} />
              </Group>
            </Tooltip>
          )}
          <UserDropdown />
        </Group>
      </Group>
    </Container>
  );
}
