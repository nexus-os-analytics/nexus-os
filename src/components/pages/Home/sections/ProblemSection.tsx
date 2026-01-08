'use client';
import { Badge, Button, Card, Container, SimpleGrid, Stack, Text, Title } from '@mantine/core';

const problems = [
  { title: 'Produtos acabam sem aviso', value: '–R$ 2.800/mês' },
  { title: 'Dinheiro parado', value: 'R$ 15k travados' },
  { title: 'Reposição errada', value: '35% de erro' },
  { title: 'Horas perdidas no Excel', value: '15h/semana' },
  { title: 'Descobre oportunidades tarde', value: 'Perda de momentum' },
  { title: 'Decisões no escuro', value: 'Sem previsibilidade' },
];

export function ProblemSection() {
  return (
    <Container id="problema" size="lg" py="xl">
      <Stack gap="sm" align="center">
        <Badge variant="light" color="gray">
          Você não está sozinho — 78% dos lojistas enfrentam isso
        </Badge>
        <Title ta="center" maw={800}>
          Esses problemas estão custando{' '}
          <Text span c="brand.7" inherit>
            caro
          </Text>{' '}
          para o seu negócio
        </Title>
        <SimpleGrid cols={{ base: 1, sm: 2, lg: 3 }} spacing="md" mt="md" w="100%">
          {problems.map((p) => (
            <Card key={p.title} withBorder radius="md">
              <Title order={4}>{p.title}</Title>
              <Text c="dimmed" mt="xs">
                {p.value}
              </Text>
            </Card>
          ))}
        </SimpleGrid>
        <Button
          component="a"
          href="#como-funciona"
          mt="md"
          size="md"
          variant="filled"
          color="brand"
        >
          Resolver esses problemas agora
        </Button>
      </Stack>
    </Container>
  );
}
