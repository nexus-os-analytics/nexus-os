'use client';
import {
  Avatar,
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

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="lg" mt="lg" w="100%">
          {[
            {
              initials: 'AM',
              name: 'Ana Martins',
              role: 'Dona de Loja',
              text: 'Consegui liberar R$ 18.400 em só três semanas e ainda evitei cinco faltas de produto!',
            },
            {
              initials: 'RP',
              name: 'Rafael Pereira',
              role: 'Gerente de E-commerce',
              text: 'Os alertas são super diretos e fáceis de resolver. Ganhei horas que eu perdia no Excel.',
            },
            {
              initials: 'CL',
              name: 'Carla Lima',
              role: 'Compras',
              text: 'O controle do capital parado mudou totalmente o nosso fluxo de caixa.',
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
