import type { Route } from 'next';
import type { ReactNode } from 'react';
import type { PermissionPath } from '@/features/auth/services';

export type PrivateRoutesType = 'dashboard' | 'campaign' | 'bling' | 'profile';
export type AuthRoutesType = 'sign-in' | 'sign-up' | 'forgot-password' | 'reset-password';
export type RoutesType = PrivateRoutesType | AuthRoutesType;
export interface RouteObject {
  path: Route<string> | URL;
  label: string;
  icon?: ReactNode;
  permissions?: PermissionPath[];
  children?: Record<string, RouteObject>[];
}
