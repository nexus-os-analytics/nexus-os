/** biome-ignore-all lint/style/noMagicNumbers: <explanation> */
'use client';
import {
  Badge,
  Box,
  Button,
  Card,
  Container,
  Grid,
  Group,
  List,
  Paper,
  rem,
  SimpleGrid,
  Stack,
  Text,
  ThemeIcon,
  Title,
} from '@mantine/core';
import {
  BarChart3,
  Bot,
  Check,
  CreditCard,
  Database,
  Mail,
  Rocket,
  Shield,
  TestTube,
  Zap,
} from 'lucide-react';

export function Home() {
  const features = [
    {
      icon: Database,
      title: 'Sistema Fullstack',
      description:
        'Backend robusto com Prisma ORM e PostgreSQL para máxima performance e escalabilidade',
      color: 'blue',
    },
    {
      icon: Shield,
      title: 'Autenticação 2FA',
      description:
        'Sistema completo de autenticação com OTP (One-Time Password) para máxima segurança',
      color: 'green',
    },
    {
      icon: Mail,
      title: 'Envio de E-mails',
      description:
        'Integração configurada com Brevo para envio profissional de e-mails transacionais',
      color: 'violet',
    },
    {
      icon: BarChart3,
      title: 'Observabilidade',
      description:
        'Monitoramento completo da aplicação para identificar e resolver problemas rapidamente',
      color: 'orange',
    },
  ];

  const upcomingFeatures = [
    {
      icon: TestTube,
      title: 'Testes E2E',
      description: 'Suite completa de testes end-to-end com Cypress',
      status: 'Em desenvolvimento',
    },
    {
      icon: CreditCard,
      title: 'Sistema de Pagamento',
      description: 'Integração com principais gateways de pagamento',
      status: 'Próxima release',
    },
    {
      icon: Bot,
      title: 'Assistente de IA',
      description: 'Assistente inteligente integrado à sua aplicação',
      status: 'Planejado',
    },
  ];

  const techStack = ['Next.js 15+', 'TypeScript', 'Prisma ORM', 'PostgreSQL', 'Mantine UI'];

  return (
    <Box style={{ minHeight: '100vh' }}>
      {/* Hero Section */}
      <Box
        style={{
          background: 'linear-gradient(135deg, #172e97 0%, #764ba2 100%)',
          color: 'white',
          paddingTop: rem(40),
          paddingBottom: rem(40),
        }}
      >
        <Container size="lg">
          <Stack gap="xl" align="center" style={{ textAlign: 'center' }}>
            <Badge size="lg" variant="light" color="white">
              Template Pronto para Produção
            </Badge>

            <Title
              order={1}
              size={rem(54)}
              fw={900}
              style={{
                lineHeight: 1.2,
                maxWidth: rem(800),
              }}
            >
              Acelere o desenvolvimento da sua aplicação SaaS
            </Title>

            <Text size="xl" maw={rem(600)} opacity={0.9}>
              Template completo com NextJS + Prisma incluindo autenticação, pagamentos, e-mails e
              muito mais. Comece seu projeto em minutos, não em semanas.
            </Text>

            <Group gap="md">
              <Button
                size="xl"
                variant="outline"
                color="white"
                leftSection={<Rocket size={20} />}
                style={{ borderWidth: 2 }}
              >
                Começar agora
              </Button>
            </Group>

            <Group gap="xs" mt="md">
              <ThemeIcon size="sm" radius="xl" color="green" variant="light">
                <Check size={14} />
              </ThemeIcon>
              <Text size="sm" opacity={0.9}>
                Sem taxas mensais
              </Text>
              <Text size="sm" opacity={0.5}>
                •
              </Text>
              <ThemeIcon size="sm" radius="xl" color="green" variant="light">
                <Check size={14} />
              </ThemeIcon>
              <Text size="sm" opacity={0.9}>
                Código fonte completo
              </Text>
              <Text size="sm" opacity={0.5}>
                •
              </Text>
              <ThemeIcon size="sm" radius="xl" color="green" variant="light">
                <Check size={14} />
              </ThemeIcon>
              <Text size="sm" opacity={0.9}>
                Segurança Garantida
              </Text>
            </Group>
          </Stack>
        </Container>
      </Box>

      {/* Features Section */}
      <Container size="lg" py={rem(80)}>
        <Stack gap="xl" align="center" mb={rem(60)}>
          <Badge size="lg" variant="light" color="violet">
            Recursos Inclusos
          </Badge>
          <Title order={2} ta="center" size={rem(42)}>
            Tudo que você precisa para começar
          </Title>
          <Text size="lg" c="dimmed" ta="center" maw={rem(600)}>
            Um template completo com as melhores práticas e ferramentas do mercado
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, sm: 2, lg: 4 }} spacing="lg">
          {features.map((feature, index) => (
            <Card
              key={index}
              shadow="sm"
              padding="lg"
              radius="md"
              withBorder
              style={{
                transition: 'all 0.3s ease',
                cursor: 'pointer',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-4px)';
                e.currentTarget.style.boxShadow = '0 12px 24px rgba(0,0,0,0.1)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '';
              }}
            >
              <Stack gap="md">
                <ThemeIcon size={60} radius="md" color={feature.color}>
                  <feature.icon size={32} />
                </ThemeIcon>
                <div>
                  <Title order={3} size="h4" mb="xs">
                    {feature.title}
                  </Title>
                  <Text size="sm" c="dimmed">
                    {feature.description}
                  </Text>
                </div>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      </Container>

      {/* Tech Stack Section */}
      <Box style={{ backgroundColor: '#f8f9fa' }} py={rem(80)}>
        <Container size="lg">
          <Stack gap="xl" align="center">
            <Title order={2} ta="center" size={rem(36)} c="violet">
              Stack Tecnológico
            </Title>
            <Text size="lg" c="dimmed" ta="center" maw={rem(600)}>
              Construído com as tecnologias mais modernas e confiáveis do mercado
            </Text>

            <Group gap="md" justify="center">
              {techStack.map((tech, index) => (
                <Badge
                  key={index}
                  size="xl"
                  variant="light"
                  color="violet"
                  style={{ padding: '12px 24px' }}
                >
                  {tech}
                </Badge>
              ))}
            </Group>
          </Stack>
        </Container>
      </Box>

      {/* Upcoming Features Section */}
      <Container size="lg" py={rem(80)}>
        <Stack gap="xl" align="center" mb={rem(60)}>
          <Badge size="lg" variant="light" color="orange">
            Em Desenvolvimento
          </Badge>
          <Title order={2} ta="center" size={rem(42)}>
            Próximas Funcionalidades
          </Title>
          <Text size="lg" c="dimmed" ta="center" maw={rem(600)}>
            Recursos adicionais que estão sendo desenvolvidos para tornar seu template ainda mais
            completo
          </Text>
        </Stack>

        <SimpleGrid cols={{ base: 1, md: 3 }} spacing="lg">
          {upcomingFeatures.map((feature, index) => (
            <Card
              key={index}
              shadow="sm"
              padding="xl"
              radius="md"
              withBorder
              style={{ position: 'relative', overflow: 'visible' }}
            >
              <Badge
                size="sm"
                variant="filled"
                color="orange"
                style={{
                  position: 'absolute',
                  top: -10,
                  right: 20,
                }}
              >
                {feature.status}
              </Badge>

              <Stack gap="md" mt="xs">
                <ThemeIcon size={50} radius="md" color="orange" variant="light">
                  <feature.icon size={28} />
                </ThemeIcon>
                <div>
                  <Title order={3} size="h4" mb="xs">
                    {feature.title}
                  </Title>
                  <Text size="sm" c="dimmed">
                    {feature.description}
                  </Text>
                </div>
              </Stack>
            </Card>
          ))}
        </SimpleGrid>
      </Container>

      {/* Benefits Section */}
      <Box
        style={{
          background: 'linear-gradient(135deg, #172e97 0%, #764ba2 100%)',
          color: 'white',
        }}
        py={rem(80)}
      >
        <Container size="lg">
          <Grid gutter="xl">
            <Grid.Col span={{ base: 12, md: 6 }}>
              <Stack gap="xl">
                <Badge size="lg" variant="light" color="white" c="violet">
                  Benefícios
                </Badge>
                <Title order={2} size={rem(42)}>
                  Por que escolher nosso template?
                </Title>
                <Text size="lg" opacity={0.9}>
                  Economize centenas de horas de desenvolvimento com um template testado e otimizado
                  para produção.
                </Text>

                <List
                  spacing="md"
                  size="lg"
                  icon={
                    <ThemeIcon size={24} radius="xl" color="green">
                      <Check size={16} />
                    </ThemeIcon>
                  }
                >
                  <List.Item>
                    <Text fw={500}>Código limpo e bem documentado</Text>
                  </List.Item>
                  <List.Item>
                    <Text fw={500}>Arquitetura escalável e modular</Text>
                  </List.Item>
                  <List.Item>
                    <Text fw={500}>Otimizado para SEO e performance</Text>
                  </List.Item>
                  <List.Item>
                    <Text fw={500}>Suporte técnico dedicado</Text>
                  </List.Item>
                  <List.Item>
                    <Text fw={500}>Atualizações regulares gratuitas</Text>
                  </List.Item>
                </List>
              </Stack>
            </Grid.Col>

            {/* <Grid.Col span={{ base: 12, md: 6 }}>
              <Paper shadow="xl" p="xl" radius="md" style={{ backgroundColor: 'white' }}>
                <Stack gap="xl">
                  <div>
                    <Text size="sm" c="dimmed" fw={600} tt="uppercase">
                      Investimento Único
                    </Text>
                    <Group gap="xs" mt="xs">
                      <Text size={rem(48)} fw={900} c="violet">
                        R$ 497
                      </Text>
                      <Stack gap={0}>
                        <Text size="lg" c="dimmed" td="line-through">
                          R$ 997
                        </Text>
                        <Badge color="red" variant="filled" size="sm">
                          50% OFF
                        </Badge>
                      </Stack>
                    </Group>
                  </div>

                  <Divider />

                  <Stack gap="sm">
                    <Group gap="xs">
                      <Check size={20} color="green" />
                      <Text size="sm" c="violet">
                        Acesso vitalício ao código
                      </Text>
                    </Group>
                    <Group gap="xs">
                      <Check size={20} color="green" />
                      <Text size="sm" c="violet">
                        Todas as funcionalidades incluídas
                      </Text>
                    </Group>
                    <Group gap="xs">
                      <Check size={20} color="green" />
                      <Text size="sm" c="violet">
                        Atualizações gratuitas
                      </Text>
                    </Group>
                    <Group gap="xs">
                      <Check size={20} color="green" />
                      <Text size="sm" c="violet">
                        Documentação completa
                      </Text>
                    </Group>
                    <Group gap="xs">
                      <Check size={20} color="green" />
                      <Text size="sm" c="violet">
                        Suporte por 90 dias
                      </Text>
                    </Group>
                  </Stack>

                  <Button
                    size="lg"
                    fullWidth
                    color="violet"
                    leftSection={<Rocket size={20} />}
                    onClick={() => setSelectedPlan('premium')}
                  >
                    Começar Agora
                  </Button>

                  <Text size="xs" ta="center" c="dimmed">
                    🔒 Pagamento seguro • Garantia de 30 dias
                  </Text>
                </Stack>
              </Paper>
            </Grid.Col> */}
          </Grid>
        </Container>
      </Box>

      {/* CTA Section */}
      <Container size="lg" py={rem(80)}>
        <Paper
          shadow="xl"
          p={rem(60)}
          radius="lg"
          style={{
            background: 'linear-gradient(135deg, #172e97 0%, #764ba2 100%)',
            color: 'white',
            textAlign: 'center',
          }}
        >
          <Stack gap="xl" align="center">
            <ThemeIcon size={80} radius="xl" color="white" variant="light">
              <Zap size={40} color="#667eea" />
            </ThemeIcon>

            <Title order={2} size={rem(36)}>
              Pronto para começar seu próximo projeto?
            </Title>

            <Text size="lg" maw={rem(600)} opacity={0.9}>
              Juntos vamos transformar sua ideia em realidade com o template perfeito para
              desenvolvimento rápido e eficiente.
            </Text>

            <Group gap="md">
              <Button
                size="xl"
                variant="outline"
                color="white"
                style={{ borderWidth: 2 }}
                leftSection={<Rocket size={20} />}
              >
                Solicitar Orçamento
              </Button>
            </Group>
          </Stack>
        </Paper>
      </Container>
    </Box>
  );
}
