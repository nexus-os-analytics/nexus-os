import { redirect } from 'next/navigation';
import { SignUp } from '@/features/auth/pages/SignUp';

interface PageProps {
  searchParams?: Promise<Record<string, string | string[] | undefined>>;
}

export default async function SignUpPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const invite = params?.invite;
  if (typeof invite === 'string' && invite.length > 0) {
    redirect(`/alterar-senha?invite=${encodeURIComponent(invite)}`);
  }
  return <SignUp />;
}
