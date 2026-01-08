import { Anchor, Container, Text } from '@mantine/core';
import Link from 'next/link';
import { APP_DESCRIPTION } from '@/lib/constants';
import { Logo } from '../Logo';
import classes from './PublicFooter.module.css';

const data = [
  {
    title: 'Produto',
    links: [
      { label: 'Funcionalidades', link: '/#funcionalidades' },
      { label: 'Como Funciona', link: '/#como-funciona' },
      { label: 'Preços', link: '/precos' },
    ],
  },
  {
    title: 'Recursos',
    links: [
      { label: 'Manual de Integração', link: '/manual' },
      { label: 'Central de Ajuda', link: 'mailto:contato@nexusos.com.br' },
    ],
  },
  {
    title: 'Empresa',
    links: [
      { label: 'Sobre', link: '/' },
      { label: 'Contato', link: 'mailto:contato@nexusos.com.br' },
    ],
  },
  {
    title: 'Legal',
    links: [
      { label: 'Termos de Uso', link: '/termos-de-uso' },
      { label: 'Política de Privacidade', link: '/politica-de-privacidade' },
    ],
  },
  {
    title: 'Acesso',
    links: [
      { label: 'Entrar', link: '/login' },
      { label: 'Cadastrar', link: '/cadastre-se' },
    ],
  },
];

export function PublicFooter() {
  const groups = data.map((group) => {
    const links = group.links.map((link, index) => {
      const isInternal = link.link.startsWith('/');
      return isInternal ? (
        <Link key={index} href={link.link} className={classes.link}>
          {link.label}
        </Link>
      ) : (
        <Text<'a'> key={index} className={classes.link} component="a" href={link.link}>
          {link.label}
        </Text>
      );
    });

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
          © {new Date().getFullYear()} Nexus OS. Todos os direitos reservados. ·{' '}
          <Anchor href="/manual">Manual</Anchor> · <Anchor href="/termos-de-uso">Termos</Anchor> ·{' '}
          <Anchor href="/politica-de-privacidade">Privacidade</Anchor>
        </Text>
      </Container>
    </div>
  );
}
