'use client';
import {
  Button,
  Code,
  Container,
  Group,
  Paper,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import { IconAlertCircle, IconRefresh } from '@tabler/icons-react';

export default function CustomError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Container size="sm" px="md">
      <Stack align="center" gap="sm" mt="xl">
        <ThemeIcon color="red" radius="xl" size={64}>
          <IconAlertCircle size={32} />
        </ThemeIcon>
        <Title order={2}>Algo deu errado</Title>
        <Text c="dimmed" ta="center">
          Ocorreu um erro ao carregar esta página. Você pode tentar novamente.
        </Text>
        <Group mt="md">
          <Button leftSection={<IconRefresh size={16} />} onClick={() => reset()}>
            Tentar novamente
          </Button>
        </Group>
        <Paper withBorder radius="md" p="md" w="100%">
          <Text fw={500} mb="xs">
            Detalhes do erro
          </Text>
          <Code block>{error.message}</Code>
          {error.digest && (
            <Code block mt="sm">
              {error.digest}
            </Code>
          )}
        </Paper>
      </Stack>
    </Container>
  );
}
