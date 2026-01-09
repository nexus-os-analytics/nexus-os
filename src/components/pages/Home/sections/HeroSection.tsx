'use client';
import {
  Button,
  Center,
  Container,
  Grid,
  Image as MantineImage,
  Stack,
  Text,
  Title,
} from '@mantine/core';
import Image from 'next/image';
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
              Começar Gratuitamente
            </Button>
          </Stack>
        </Grid.Col>
        <Grid.Col span={{ base: 12, md: 6 }}>
          <Center>
            <MantineImage
              component={Image}
              src="/img/hero-image.png"
              priority
              pos="relative"
              height={500}
              width={550}
              alt="Comece agora com o Nexus OS"
              style={{ objectFit: 'contain' }}
            />
          </Center>
        </Grid.Col>
      </Grid>
    </Container>
  );
}
