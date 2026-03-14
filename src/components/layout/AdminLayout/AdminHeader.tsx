'use client';
import { useEffect } from 'react';
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
} from '@mantine/core';
import { useDisclosure, useMediaQuery } from '@mantine/hooks';
import {
  IconCreditCard,
  IconCrown,
  IconCurrencyReal,
  IconDashboard,
  IconLogout,
  IconSparkles,
  IconUserEdit,
  IconUsers,
} from '@tabler/icons-react';
import Image from 'next/image';
import Link from 'next/link';
import { signOut, useSession } from 'next-auth/react';
import { UserDropdown } from '@/components/commons/UserDropdown';
import { useAuth } from '@/features/auth/context/AuthContext';
import { openCheckout, openPortal } from '@/features/billing/services/stripeClient';
import { useActiveIntegration } from '@/hooks/useActiveIntegration';
import { IntegrationSwitcher } from '@/features/dashboard/components/IntegrationSwitcher';
import { useQueryString } from '@/hooks/useQueryString';

const LOGO_SIZE_MOBILE = 48;
const LOGO_SIZE_DESKTOP = 64;

export function AdminHeader() {
  const { connectionState } = useActiveIntegration();
  const { user, signOut: logout, hasPermission } = useAuth();
  const { data: session } = useSession();
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);
  const isMobile = useMediaQuery('(max-width: 48em)');
  const { getQueryParam, setQueryParam } = useQueryString();

  const availableProviders: string[] = [
    session?.user?.hasBlingIntegration ? 'BLING' : null,
    session?.user?.hasMeliIntegration ? 'MERCADO_LIVRE' : null,
    session?.user?.hasShopeeIntegration ? 'SHOPEE' : null,
  ].filter((p): p is string => p !== null);

  const sourceParam = getQueryParam('source');
  const firstProvider = availableProviders[0] ?? null;

  useEffect(() => {
    if (sourceParam === null && firstProvider !== null) {
      setQueryParam('source', firstProvider);
    }
    // setQueryParam is a new reference each render but has stable behavior
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceParam, firstProvider]);

  const source = sourceParam ?? firstProvider;

  const handleSourceChange = (value: string | null) => {
    if (value) setQueryParam('source', value);
  };

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
            <Group gap="xs">
              <Image
                src="/img/logo.png"
                alt="Nexus OS"
                width={isMobile ? LOGO_SIZE_MOBILE : LOGO_SIZE_DESKTOP}
                height={isMobile ? LOGO_SIZE_MOBILE : LOGO_SIZE_DESKTOP}
              />
              <Text fw={500} size="lg" c="brand.6" hiddenFrom="sm">
                Nexus OS
              </Text>
            </Group>
          </Link>

          <Group gap="xs" visibleFrom="sm">
            <IntegrationSwitcher
              value={source}
              onChange={handleSourceChange}
              availableProviders={availableProviders}
              connectionState={connectionState}
            />
            {/* {availableProviders.length > 0 && (

            )} */}
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
        <ScrollArea h="calc(100dvh - 80px)" mx="-md">
          <Divider my="sm" />

          <Stack p="md" gap="md">
            <IntegrationSwitcher
              value={source}
              onChange={(v) => {
                handleSourceChange(v);
                closeDrawer();
              }}
              availableProviders={availableProviders}
              connectionState={connectionState}
            />
            {/* {availableProviders.length > 0 && (

            )} */}

            <Divider />

            {(user?.role === 'SUPER_ADMIN' || hasPermission('payments.read')) && (
              <>
                <Text size="sm" fw={500} c="dimmed" tt="uppercase">
                  Gerenciamento
                </Text>
                {user?.role === 'SUPER_ADMIN' && (
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
                )}
                {hasPermission('payments.read') && (
                  <Button
                    variant="subtle"
                    leftSection={<IconCurrencyReal size={18} />}
                    component={Link}
                    href="/pagamentos-pix"
                    onClick={closeDrawer}
                    justify="start"
                    fullWidth
                  >
                    Pagamentos PIX
                  </Button>
                )}
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

            <Button
              variant="subtle"
              leftSection={<IconSparkles size={18} />}
              component={Link}
              href="/campanhas"
              onClick={closeDrawer}
              justify="start"
              fullWidth
            >
              Campanhas
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
