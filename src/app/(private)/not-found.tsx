'use client';
import { Button, Center, Stack, Text, Title } from '@mantine/core';
import Link from 'next/link';
import { AdminLayout } from '@/components/layout/AdminLayout';

export default function NotFoundPage() {
  return (
    <AdminLayout>
      <Center>
        <Stack align="center" gap="lg">
          <Title order={2}>Ops! Página não encontrada</Title>
          <Text>
            A página que você está procurando não existe ou foi movida. Verifique o URL ou volte ao
            dashboard.
          </Text>
          <Button component={Link} variant="filled" size="lg" href="/dashboard">
            Voltar ao Dashboard
          </Button>
        </Stack>
      </Center>
    </AdminLayout>
  );
}
