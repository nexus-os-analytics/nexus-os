import type { UserRole } from '@prisma/client';
import { getPermissions } from '@/features/auth/services';
import { AUTH_ROUTES, PRIVATE_ROUTES } from './routes.constants';
import type { RouteObject, RoutesType } from './routes.types';

export function getPrivateRoutes() {
  return Object.values(PRIVATE_ROUTES);
}

export function getAuthRoutes() {
  return Object.values(AUTH_ROUTES);
}

export function getRoute(path: RoutesType): RouteObject | undefined {
  return [...getPrivateRoutes(), ...getAuthRoutes()].find((r) => r.path === path);
}

export function isPrivateRoute(path: string) {
  return getPrivateRoutes().some((r) => {
    if (r.children) return r.path.startsWith(path);

    return r.path === path;
  });
}

export function isAuthRoute(path: string) {
  return getAuthRoutes().some((r) => r.path === path);
}

export function canAccessRoute(role: UserRole, route: RoutesType) {
  if (isPrivateRoute(route)) {
    const routeObj = getRoute(route);

    if (!routeObj) return false;

    if (routeObj.permissions && routeObj.permissions.length > 0) {
      const hasPermission = routeObj.permissions.some((permission) => {
        const allowedRoles = getPermissions(permission) as string[];

        if (!allowedRoles || allowedRoles.length === 0) return true;

        return allowedRoles.includes(role);
      });

      if (!hasPermission) return false;
    }
  }

  return true;
}
