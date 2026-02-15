import { AcceptInvite } from '@/features/auth/pages/AcceptInvite';
import { ResetPassword } from '@/features/auth/pages/ResetPassword';

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function ResetarSenhaPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const email = params?.email;
  // If email is present, assume invite flow and show AcceptInvite (token expected)
  if (typeof email === 'string' && email.length > 0) {
    return <AcceptInvite />;
  }
  // Otherwise default to reset password flow (expects token)
  return <ResetPassword />;
}
