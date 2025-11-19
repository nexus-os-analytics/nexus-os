import { ActionIcon, Anchor, Container, Group, Text } from '@mantine/core';
import { IconBrandGithub, IconBrandLinkedin } from '@tabler/icons-react';
import { APP_DESCRIPTION } from '@/lib/constants';
import { Logo } from '../Logo';
import classes from './PublicFooter.module.css';

const data = [
  {
    title: 'Sobre',
    links: [
      { label: 'Portifólio', link: 'https://foliveira.dev.br/' },
      {
        label: 'LinkedIn',
        link: 'https://www.linkedin.com/in/felipe-de-oliveira-souza-a558a814b/',
      },
      { label: 'Github', link: 'https://github.com/FelipeOliveiraDvP' },
    ],
  },
  {
    title: 'Serviços',
    links: [
      { label: 'Desenvolvimento Web', link: 'https://foliveira.dev.br/#servicos' },
      { label: 'Automações', link: 'https://foliveira.dev.br/n8n.html' },
      { label: 'Projetos', link: 'https://foliveira.dev.br/projetos.html' },
      { label: 'Pacotes', link: 'https://foliveira.dev.br/pacotes.html' },
    ],
  },
];

export function PublicFooter() {
  const groups = data.map((group) => {
    const links = group.links.map((link, index) => (
      <Text<'a'>
        key={index}
        className={classes.link}
        component="a"
        href={link.link}
        onClick={(event) => event.preventDefault()}
      >
        {link.label}
      </Text>
    ));

    return (
      <div className={classes.wrapper} key={group.title}>
        <Text className={classes.title}>{group.title}</Text>
        {links}
      </div>
    );
  });

  return (
    <div className={classes.footer}>
      <Container className={classes.inner}>
        <div className={classes.logo}>
          <Logo />
          <Text size="xs" c="dimmed" className={classes.description}>
            {APP_DESCRIPTION}
          </Text>
        </div>
        <div className={classes.groups}>{groups}</div>
      </Container>
      <Container className={classes.afterFooter}>
        <Text c="dimmed" size="sm">
          © {new Date().getFullYear()}{' '}
          <Anchor href="https://foliveira.dev.br/" target="_blank" referrerPolicy="no-referrer">
            foliveira.dev.br
          </Anchor>{' '}
          Todos os direitos reservados.
        </Text>

        <Group gap={0} className={classes.social} justify="flex-end" wrap="nowrap">
          <ActionIcon
            component="a"
            href="https://github.com/FelipeOliveiraDvP"
            target="_blank"
            rel="noopener noreferrer"
            size="lg"
            color="gray"
            variant="subtle"
          >
            <IconBrandGithub size={18} stroke={1.5} />
          </ActionIcon>
          <ActionIcon
            component="a"
            href="https://www.linkedin.com/in/felipe-de-oliveira-souza-a558a814b/"
            target="_blank"
            rel="noopener noreferrer"
            size="lg"
            color="gray"
            variant="subtle"
          >
            <IconBrandLinkedin size={18} stroke={1.5} />
          </ActionIcon>
        </Group>
      </Container>
    </div>
  );
}
