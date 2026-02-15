'use client';
import {
  Avatar,
  Button,
  Card,
  Divider,
  FileInput,
  Group,
  Stack,
  Text,
  TextInput,
  Title,
} from '@mantine/core';
import { useForm } from '@mantine/form';
import { IconTrash, IconUpload } from '@tabler/icons-react';
import { useEffect, useState } from 'react';
import { useAuth } from '@/features/auth/context/AuthContext';
import { AccountRemoveModal } from './AccountRemoveModal';

interface ProfileFormValues {
  name: string;
  email: string;
  phone: string;
  avatar: File | null;
  acceptedTerms: boolean;
}

export default function ProfileForm() {
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const { user } = useAuth();

  const profileForm = useForm<ProfileFormValues>({
    initialValues: {
      name: '',
      email: '',
      phone: '',
      avatar: null as File | null,
      acceptedTerms: false,
    },
    validate: {
      email: (v) => (/^\S+@\S+$/.test(v) ? null : 'E-mail inválido'),
    },
  });

  const getUserInitials = (name: string) => {
    const names = name.split(' ');
    const initials = names.map((n) => n.charAt(0).toUpperCase()).join('');
    return initials;
  };

  async function handleProfileSubmit(values: ProfileFormValues) {
    // Validate / sanitize in backend
    // Call PATCH /api/user
    // Removed console.log for production compliance

    // Upload avatar if exists
    if (values.avatar) {
      // use FormData and secure endpoint
    }
    // append AuditLog in backend
  }

  // implement avatar preview
  useEffect(() => {
    if (profileForm.values.avatar) {
      const objectUrl = URL.createObjectURL(profileForm.values.avatar);
      setAvatarPreview(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    }
  }, [profileForm.values.avatar]);

  useEffect(() => {
    if (user) {
      profileForm.setValues({
        name: user.name || '',
        email: user.email || '',
        // phone: user.phone || '',
      });
      setAvatarPreview(user.avatar || null);
    }
  }, [user, profileForm.setValues]);

  return (
    <>
      <Card withBorder>
        <Title id="my-account" order={4} mb="md">
          Meu Perfil
        </Title>
        <Group justify="space-between">
          <Group gap="sm">
            <Avatar
              radius="xl"
              size="lg"
              src={user?.image || avatarPreview || undefined}
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
          <Group>
            <Button
              color="red"
              onClick={() => setShowDeleteModal(true)}
              leftSection={<IconTrash size={16} />}
            >
              Excluir minha conta
            </Button>
          </Group>
        </Group>

        <Divider my="md" />

        <form onSubmit={profileForm.onSubmit(handleProfileSubmit)}>
          <Stack>
            <TextInput label="Nome" {...profileForm.getInputProps('name')} required />
            <TextInput label="E-mail" {...profileForm.getInputProps('email')} required />
            <TextInput label="Telefone" {...profileForm.getInputProps('phone')} />
            <FileInput
              label="Alterar foto de perfil"
              placeholder="Escolha um arquivo"
              description="Formatos suportados: jpg, png, svg, gif. Tamanho máximo: 5MB."
              accept="image/*"
              leftSection={<IconUpload size={16} />}
              {...profileForm.getInputProps('avatar')}
            />
            <Group>
              <Button type="submit">Salvar</Button>
            </Group>
          </Stack>
        </form>
      </Card>

      <AccountRemoveModal opened={showDeleteModal} toggle={() => setShowDeleteModal(false)} />
    </>
  );
}
