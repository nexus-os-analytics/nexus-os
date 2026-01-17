'use client';
import {
  AspectRatio,
  Button,
  Center,
  Container,
  Grid,
  Image,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import Link from 'next/link';

export function HeroSection() {
  return (
    <Container id="hero" size="lg" pt="xl">
      <Grid>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Stack gap="lg">
            <Title order={1} maw={900}>
              Pare de perder{' '}
              <Text span c="brand.7" inherit>
                Vendas e Dinheiro
              </Text>{' '}
              no seu estoque.
            </Title>
            <Text c="dimmed" maw={760}>
              O Nexus OS conecta ao Bling, analisa seu estoque em tempo real e te alerta antes dos
              problemas para você agir com confiança.
            </Text>
            <Button
              component={Link}
              href="/cadastre-se"
              size="xl"
              variant="gradient"
              gradient={{ from: 'brand.6', to: 'brand.8', deg: 135 }}
            >
              Comece Agora
            </Button>
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Center>
            {/* biome-ignore lint/style/noMagicNumbers: Aspect ratio for hero visual */}
            <AspectRatio ratio={16 / 9} w="100%">
              <Image
                src="https://placehold.co/800x500/png?text=Nexus%20OS"
                alt="Visual de demonstração do Nexus OS"
                radius="md"
                style={{ objectFit: 'contain', width: '100%', height: '100%' }}
              />
            </AspectRatio>
          </Center>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
