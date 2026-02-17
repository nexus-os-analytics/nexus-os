import type { Route } from 'next';
import type { RouteObject } from './routes.types';

export const PRIVATE_ROUTES: Record<Route<string> | string, RouteObject> = {
  bling: {
    path: '/bling',
    label: 'Bling',
    permissions: [],
  },
  campanhas: {
    path: '/campanhas',
    label: 'Campanhas',
    permissions: ['campaign.read', 'campaign.write'],
  },
  dashboard: {
    path: '/dashboard',
    label: 'Dashboard',
    permissions: ['dashboard.read'],
  },
  'minha-conta': {
    path: '/minha-conta',
    label: 'Minha Conta',
    permissions: ['profile.read', 'profile.write'],
  },
  pagamento: {
    path: '/pagamento/*',
    label: 'Pagamento',
    permissions: [],
  },
  produto: {
    path: '/produto/*',
    label: 'Produto',
    permissions: ['products.read', 'products.write'],
  },
  'sem-permissao': {
    path: '/sem-permissao',
    label: 'Sem Permissão',
    permissions: [],
  },
  usuarios: {
    path: '/usuarios',
    label: 'Usuários',
    permissions: ['users.read', 'users.write'],
  },
  'visao-geral': {
    path: '/visao-geral',
    label: 'Visão Geral',
    permissions: ['dashboard.read'],
  },
};

export const AUTH_ROUTES: Record<string, RouteObject> = {
  'alterar-senha': {
    path: '/alterar-senha',
    label: 'Alterar senha',
  },
  'cadastre-se': {
    path: '/cadastre-se',
    label: 'Cadastre-se',
  },
  'esqueci-minha-senha': {
    path: '/esqueci-minha-senha',
    label: 'Esqueci minha senha',
  },
  login: {
    path: '/login',
    label: 'Login',
  },
  'resetar-senha': {
    path: '/resetar-senha',
    label: 'Resetar senha',
  },
};

export const PUBLIC_ROUTES: Record<string, RouteObject> = {
  home: {
    path: '/',
    label: 'Home',
  },
  manual: {
    path: '/manual',
    label: 'Manual',
  },
  'politica-de-privacidade': {
    path: '/politica-de-privacidade',
    label: 'Política de Privacidade',
  },
  precos: {
    path: '/precos',
    label: 'Preços',
  },
  'termos-de-uso': {
    path: '/termos-de-uso',
    label: 'Termos de Uso',
  },
};
