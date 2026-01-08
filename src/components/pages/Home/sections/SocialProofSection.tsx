'use client';
import { Badge, Container, Group, SimpleGrid, Stack, Text, Title } from '@mantine/core';
import Image from 'next/image';

export function SocialProofSection() {
  return (
    <Container id="prova-social" size="lg" py="xl">
      <Stack gap="sm" align="center">
        <Title ta="center">Lojistas que já usam o Nexus OS</Title>
        <Group gap="xl" mt="sm" wrap="wrap" justify="center">
          <Badge size="lg" variant="light" color="green">
            R$ 2.1M+ capital liberado
          </Badge>
          <Badge size="lg" variant="light" color="blue">
            847 lojistas ativos
          </Badge>
          <Badge size="lg" variant="light" color="yellow">
            4.9/5 de avaliação
          </Badge>
        </Group>

        <SimpleGrid cols={{ base: 2, sm: 4 }} spacing="lg" mt="lg">
          <Image src="/img/bling-logo.png" alt="Bling" width={140} height={40} />
          <Image src="/img/bling-logo-white.png" alt="Bling" width={140} height={40} />
          <Image src="/img/logo.png" alt="Nexus" width={140} height={40} />
          <Image src="/img/logo.png" alt="LGPD" width={140} height={40} />
        </SimpleGrid>

        <Text c="dimmed" size="sm" ta="center" maw={760}>
          Depoimentos reais e cases serão adicionados aqui; por ora, exibimos métricas de impacto e
          logos de confiança.
        </Text>
      </Stack>
    </Container>
  );
}
