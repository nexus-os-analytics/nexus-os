import { Button, Container, Group, Stack, Text, Title } from '@mantine/core';
import Link from 'next/link';

export const dynamic = 'force-static';

export default function StripeSuccessPage() {
  return (
    <Container size="sm" py="xl">
      <Stack align="center" gap="md">
        <Title order={2}>Assinatura confirmada</Title>
        <Text ta="center" c="dimmed">
          Obrigado por assinar o plano PRO. Sua assinatura está sendo processada e será ativada em
          alguns instantes.
        </Text>
        <Group>
          <Button component={Link} href="/login" variant="outline" color="brand">
            Ir para o login
          </Button>
          <Button component={Link} href="/" color="brand">
            Voltar para a página inicial
          </Button>
        </Group>
      </Stack>
    </Container>
  );
}
