'use client';
import { Alert, Button, Center, Code, Stack, Text, Title } from '@mantine/core';
import { IconAlertCircle } from '@tabler/icons-react';

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <Center>
      <Stack align="center" gap="lg">
        <Title order={2}>Algo deu errado!</Title>
        <Text>Por favor, tente novamente mais tarde.</Text>
        {error.message && (
          <Alert
            variant="light"
            color="yellow"
            title="Mensagem de erro"
            icon={<IconAlertCircle size={16} />}
          >
            <Code>{error.message}</Code>
          </Alert>
        )}
        {error.digest && (
          <Alert
            variant="light"
            color="yellow"
            title="Descrição de erro"
            icon={<IconAlertCircle size={16} />}
          >
            <Code>{error.digest}</Code>
          </Alert>
        )}
        <Button variant="filled" size="lg" onClick={() => reset()}>
          Tentar novamente
        </Button>
      </Stack>
    </Center>
  );
}
