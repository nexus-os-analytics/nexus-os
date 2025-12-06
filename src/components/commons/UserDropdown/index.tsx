'use client';
import { Avatar, Group, Menu, Text } from '@mantine/core';
import { IconLogout, IconUserEdit, IconUsers } from '@tabler/icons-react';
import Link from 'next/link';
import { signOut } from 'next-auth/react';
import { useAuth } from '@/features/auth/context/AuthContext';

export function UserDropdown() {
  const { user, signOut: logout } = useAuth();

  const getUserInitials = (name: string) => {
    const names = name.split(' ');
    const initials = names.map((n) => n.charAt(0).toUpperCase()).join('');
    return initials;
  };

  const handleLogout = () => {
    logout();
    signOut({
      callbackUrl: '/login',
    });
  };

  return (
    <Group justify="center">
      <Menu
        withArrow
        width={300}
        position="bottom"
        transitionProps={{ transition: 'pop' }}
        withinPortal
      >
        <Menu.Target>
          <Group style={{ cursor: 'pointer' }}>
            <Avatar
              radius="xl"
              src={user?.image || undefined}
              alt={user?.name || 'User Avatar'}
              color="brand"
            >
              {user?.name ? getUserInitials(user.name) : 'U'}
            </Avatar>
            <div>
              <Text fw={500}>{user?.name || 'User Name'}</Text>
              <Text size="xs" c="dimmed">
                {user?.email || 'user@example.com'}
              </Text>
            </div>
          </Group>
        </Menu.Target>
        <Menu.Dropdown>
          {user && user.role === 'SUPER_ADMIN' && (
            <>
              <Menu.Label>Gerenciamento</Menu.Label>
              <Menu.Item
                leftSection={<IconUsers size={16} stroke={1.5} />}
                component={Link}
                href="/users"
              >
                Ver usuários
              </Menu.Item>
              <Menu.Divider />
            </>
          )}
          <Menu.Label>Minha Conta</Menu.Label>
          <Menu.Item
            leftSection={<IconUserEdit size={16} stroke={1.5} />}
            component={Link}
            href="/profile"
          >
            Editar Perfil
          </Menu.Item>
          <Menu.Item
            color="red"
            leftSection={<IconLogout size={16} stroke={1.5} />}
            onClick={handleLogout}
          >
            Sair
          </Menu.Item>
        </Menu.Dropdown>
      </Menu>
    </Group>
  );
}
