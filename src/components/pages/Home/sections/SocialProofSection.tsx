'use client';
import {
  Avatar,
  Badge,
  Card,
  Container,
  Group,
  Rating,
  SimpleGrid,
  Stack,
  Text,
  Title,
} from '@mantine/core';

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

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg" mt="lg" w="100%">
          {[
            {
              initials: 'AM',
              name: 'Ana Martins',
              role: 'Dona de Loja',
              text: 'Liberei R$ 18.400 em 3 semanas e evitei 5 rupturas.',
            },
            {
              initials: 'RP',
              name: 'Rafael Pereira',
              role: 'E-commerce Manager',
              text: 'Alertas assertivos e simples de agir. Reduzi horas de Excel.',
            },
            {
              initials: 'CL',
              name: 'Carla Lima',
              role: 'Compras',
              text: 'Acompanhamento de capital parado mudou nosso caixa.',
            },
          ].map((t) => (
            <Card key={t.name} withBorder radius="md">
              <Group align="center" gap="sm">
                <Avatar color="blue" radius="xl">
                  {t.initials}
                </Avatar>
                <div>
                  <Text fw={600}>{t.name}</Text>
                  <Text size="sm" c="dimmed">
                    {t.role}
                  </Text>
                </div>
              </Group>
              <Rating value={5} readOnly mt="sm" />
              <Text mt="xs">“{t.text}”</Text>
            </Card>
          ))}
        </SimpleGrid>
      </Stack>
    </Container>
  );
}
