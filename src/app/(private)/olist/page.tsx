import { getServerSession } from 'next-auth';
import { OlistConnect } from '@/features/olist/pages/OlistConnect';
import { authOptions } from '@/lib/next-auth';
import prisma from '@/lib/prisma';

export default async function OlistConnectPage() {
  const session = await getServerSession(authOptions);
  let canConnect = false;
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    canConnect = !!user?.emailVerified;
  }
  return <OlistConnect canConnect={canConnect} />;
}
