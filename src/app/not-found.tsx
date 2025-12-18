import { getServerSession } from 'next-auth';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { NotFoundPage } from '@/components/pages/NotFound';
import { authOptions } from '@/lib/next-auth';

export default async function NotFound() {
  const session = await getServerSession(authOptions);

  if (!session)
    return (
      <PublicLayout>
        <NotFoundPage />
      </PublicLayout>
    );

  return (
    <AdminLayout>
      <NotFoundPage backHref="/dashboard" backLabel="Voltar para dashboard" />
    </AdminLayout>
  );
}
