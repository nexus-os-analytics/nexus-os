import { redirect } from 'next/navigation';
import { SignUp } from '@/features/auth/pages/SignUp';

interface PageProps {
  searchParams?: Record<string, string | string[] | undefined>;
}

export default function SignUpPage({ searchParams }: PageProps) {
  const invite = searchParams?.invite;
  if (typeof invite === 'string' && invite.length > 0) {
    redirect(`/alterar-senha?invite=${encodeURIComponent(invite)}`);
  }
  return <SignUp />;
}
