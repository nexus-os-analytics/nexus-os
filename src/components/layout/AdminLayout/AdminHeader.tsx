'use client';
import {
  Burger,
  Button,
  Container,
  Divider,
  Drawer,
  Group,
  ScrollArea,
  Stack,
  Text,
  ThemeIcon,
  Tooltip,
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import {
  IconCircleCheck,
  IconCreditCard,
  IconCrown,
  IconDashboard,
  IconLogout,
  IconUserEdit,
  IconUsers,
} from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { UserDropdown } from '@/components/commons/UserDropdown';
import { useAuth } from '@/features/auth/context/AuthContext';
import { openCheckout, openPortal } from '@/features/billing/services/stripeClient';
import { useBlingIntegration } from '@/hooks/useBlingIntegration';

const LOGO_SIZE_MOBILE = 48;
const LOGO_SIZE_DESKTOP = 64;

export function AdminHeader() {
  const { connectionState } = useBlingIntegration();
  const { user, signOut: logout } = useAuth();
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
  const isMobile = useMediaQuery('(max-width: 48em)');

  const handleLogout = () => {
    logout();
    signOut({
      callbackUrl: '/login',
    });
    closeDrawer();
  };

  return (
    <>
      <Container size="xl" h="100%">
        <Group justify="space-between" h="100%">
          <Link href="/dashboard" style={{ textDecoration: 'none' }}>
            <Image
              src="/img/logo.png"
              alt="Nexus OS"
              width={isMobile ? LOGO_SIZE_MOBILE : LOGO_SIZE_DESKTOP}
              height={isMobile ? LOGO_SIZE_MOBILE : LOGO_SIZE_DESKTOP}
            />
          </Link>

          <Group gap="xs" visibleFrom="sm">
            {connectionState === 'connected' && (
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

          <Group gap="xs" hiddenFrom="sm">
            <UserDropdown />
            <Burger opened={drawerOpened} onClick={toggleDrawer} />
          </Group>
        </Group>
      </Container>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding="md"
        title="Menu"
        hiddenFrom="sm"
        zIndex={1000000}
      >
        <ScrollArea h="calc(100vh - 80px)" mx="-md">
          <Divider my="sm" />

          <Stack p="md" gap="md">
            {connectionState === 'connected' && (
              <Group align="center" gap={8}>
                <ThemeIcon color="green.9" variant="light" size={20}>
                  <IconCircleCheck />
                </ThemeIcon>
                <Image src="/img/bling-logo.png" alt="Bling Conectado" width={45} height={18} />
              </Group>
            )}

            <Divider />

            {user && user.role === 'SUPER_ADMIN' && (
              <>
                <Text size="sm" fw={500} c="dimmed" tt="uppercase">
                  Gerenciamento
                </Text>
                <Button
                  variant="subtle"
                  leftSection={<IconUsers size={18} />}
                  component={Link}
                  href="/usuarios"
                  onClick={closeDrawer}
                  justify="start"
                  fullWidth
                >
                  Ver usuários
                </Button>
              </>
            )}

            <Button
              variant="subtle"
              leftSection={<IconDashboard size={18} />}
              component={Link}
              href="/dashboard"
              onClick={closeDrawer}
              justify="start"
              fullWidth
            >
              Dashboard
            </Button>

            <Divider />

            <Text size="sm" fw={500} c="dimmed" tt="uppercase">
              Minha Conta
            </Text>

            {user?.planTier === 'FREE' && (
              <Button
                variant="subtle"
                leftSection={<IconCrown size={18} />}
                onClick={() => {
                  openCheckout();
                  closeDrawer();
                }}
                justify="start"
                fullWidth
              >
                Upgrade para PRO
              </Button>
            )}

            <Button
              variant="subtle"
              leftSection={<IconCreditCard size={18} />}
              onClick={() => {
                openPortal();
                closeDrawer();
              }}
              justify="start"
              fullWidth
            >
              Gerenciar cobrança
            </Button>

            <Button
              variant="subtle"
              leftSection={<IconUserEdit size={18} />}
              component={Link}
              href="/minha-conta"
              onClick={closeDrawer}
              justify="start"
              fullWidth
            >
              Editar Perfil
            </Button>

            <Divider />

            <Button
              variant="subtle"
              color="red"
              leftSection={<IconLogout size={18} />}
              onClick={handleLogout}
              justify="start"
              fullWidth
            >
              Sair
            </Button>
          </Stack>
        </ScrollArea>
      </Drawer>
    </>
  );
}
