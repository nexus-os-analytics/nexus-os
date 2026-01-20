import { type NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { AUTH_ROUTES, canAccessRoute, isAuthRoute, isPrivateRoute } from './lib/routes';

const { NEXTAUTH_SECRET, NEXT_ENABLE_HOME_PAGE, NEXT_ENABLE_SIGN_UP_PAGE } = process.env;

export async function proxy(request: NextRequest) {
  const token = await getToken({ req: request, secret: NEXTAUTH_SECRET });
  const { pathname } = request.nextUrl;

  if (pathname === '/' && NEXT_ENABLE_HOME_PAGE === 'false') {
    return NextResponse.redirect(new URL(AUTH_ROUTES.login.path, request.url));
  }

  if (pathname === AUTH_ROUTES['cadastre-se'].path && NEXT_ENABLE_SIGN_UP_PAGE === 'false') {
    return NextResponse.redirect(new URL(AUTH_ROUTES.login.path, request.url));
  }

  if (token) {
    const { role, required2FA } = token;

    if (isPrivateRoute(pathname) && required2FA) {
      return NextResponse.redirect(new URL(AUTH_ROUTES.login.path, request.url));
    }

    if (isAuthRoute(pathname) && !required2FA) {
      return NextResponse.redirect(new URL('/bling', request.url));
    }

    if (!canAccessRoute(role, pathname)) {
      return NextResponse.redirect(new URL('/sem-permissao', request.url));
    }
  }

  if (!token && isPrivateRoute(pathname)) {
    const redirectUrl = new URL(AUTH_ROUTES.login.path, request.url);
    redirectUrl.searchParams.set('redirect', request.url);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ['/((?!api|_next/static|_next/image|favicon.ico|public).*)'],
};
