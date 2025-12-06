import type { PrivateRoutesType, RouteObject } from './routes.types';

export const PRIVATE_ROUTES: Record<PrivateRoutesType, RouteObject> = {
  dashboard: {
    path: '/dashboard',
    label: 'Dashboard',
    permissions: ['dashboard.read', 'dashboard.write'],
  },
  campaign: {
    path: '/campaign',
    label: 'Campaign',
    permissions: ['campaign.read', 'campaign.write'],
  },
  bling: {
    path: '/bling',
    label: 'Bling',
    permissions: ['bling.read', 'bling.write'],
  },
  profile: {
    path: '/profile',
    label: 'Profile',
    permissions: ['profile.read', 'profile.write'],
  },
};

export const AUTH_ROUTES: Record<string, RouteObject> = {
  'sign-in': {
    path: '/login',
    label: 'Sign In',
  },
  'sign-up': {
    path: '/cadastre-se',
    label: 'Sign Up',
  },
  'forgot-password': {
    path: '/esqueci-minha-senha',
    label: 'Forgot Password',
  },
  'reset-password': {
    path: '/reset-password',
    label: 'Reset Password',
  },
};
