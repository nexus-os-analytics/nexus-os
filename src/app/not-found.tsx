import { getServerSession } from 'next-auth';
import { AdminLayout } from '@/components/layout/AdminLayout';
import { PublicLayout } from '@/components/layout/PublicLayout';
import { authOptions } from '@/lib/next-auth';

export default async function NotFound() {
  const session = await getServerSession(authOptions);

  if (!session)
    return (
      <PublicLayout>
        <h1>Not Found</h1>
      </PublicLayout>
    );

  return (
    <AdminLayout>
      <h1>Not Found</h1>
    </AdminLayout>
  );
}
