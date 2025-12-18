import type { Route } from 'next';
import type { ReactNode } from 'react';
import type { PermissionPath } from '@/features/auth/services';

export interface RouteObject {
  path: Route<string> | URL;
  label: string;
  icon?: ReactNode;
  permissions?: PermissionPath[];
  children?: Record<string, RouteObject>[];
}
