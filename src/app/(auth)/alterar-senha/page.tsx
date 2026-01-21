import { AcceptInvite } from '@/features/auth/pages/AcceptInvite';
import { ResetPassword } from '@/features/auth/pages/ResetPassword';

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ResetPasswordPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const invite = params?.invite;
  if (typeof invite === 'string' && invite.length > 0) {
    return <AcceptInvite />;
  }
  return <ResetPassword />;
}
