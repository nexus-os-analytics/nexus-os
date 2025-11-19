import type { DefaultSession } from 'next-auth';
import type { JWT as DefaultJWT } from 'next-auth/jwt';
import type { User as AppUser } from '@/features/auth/services';

declare module 'next-auth' {
  interface Session extends DefaultSession {
    user: User;
    required2FA?: boolean;
  }

  interface User extends AppUser {}
}

declare module 'next-auth/jwt' {
  interface JWT extends DefaultJWT, AppUser {}
}
