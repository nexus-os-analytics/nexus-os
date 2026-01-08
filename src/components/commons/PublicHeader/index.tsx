import { Burger, Button, Divider, Drawer, Group, ScrollArea } from '@mantine/core';
import { useDisclosure } from '@mantine/hooks';
import Link from 'next/link';
import { Logo } from '../Logo';
import classes from './PublicHeader.module.css';

export function PublicHeader() {
  const [drawerOpened, { toggle: toggleDrawer, close: closeDrawer }] = useDisclosure(false);

  return (
    <>
      <Group justify="space-between" align="center" h="100%">
        <Logo />

        <Group h="100%" gap={0} visibleFrom="sm">
          <Link href="#funcionalidades" className={classes.link}>
            Funcionalidades
          </Link>
          <Link href="/precos" className={classes.link}>
            Preços
          </Link>
          <Link href="#como-funciona" className={classes.link}>
            Como Funciona
          </Link>
        </Group>

        <Group visibleFrom="sm">
          <Link href="/login">
            <Button variant="outline" color="brand">
              Entrar
            </Button>
          </Link>
          <Link href="/cadastre-se">
            <Button variant="gradient" gradient={{ from: 'brand.6', to: 'brand.8', deg: 135 }}>
              Começar Grátis
            </Button>
          </Link>
        </Group>

        <Burger opened={drawerOpened} onClick={toggleDrawer} hiddenFrom="sm" />
      </Group>

      <Drawer
        opened={drawerOpened}
        onClose={closeDrawer}
        size="100%"
        padding="md"
        title="Navigation"
        hiddenFrom="sm"
        zIndex={1000000}
      >
        <ScrollArea h="calc(100vh - 80px)" mx="-md">
          <Divider my="sm" />

          <Link href="#funcionalidades" className={classes.link} onClick={closeDrawer}>
            Funcionalidades
          </Link>
          <Link href="/precos" className={classes.link} onClick={closeDrawer}>
            Preços
          </Link>
          <Link href="#como-funciona" className={classes.link} onClick={closeDrawer}>
            Como Funciona
          </Link>

          <Divider my="sm" />

          <Group justify="center" grow pb="xl" px="md">
            <Link href="/login">
              <Button variant="outline" color="brand">
                Entrar
              </Button>
            </Link>
            <Link href="/cadastre-se">
              <Button variant="gradient" gradient={{ from: 'brand.6', to: 'brand.8', deg: 135 }}>
                Começar Grátis
              </Button>
            </Link>
          </Group>
        </ScrollArea>
      </Drawer>
    </>
  );
}
