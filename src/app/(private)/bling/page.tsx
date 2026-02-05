import { getServerSession } from 'next-auth';
import { BlingConnect } from '@/features/bling/pages/BlingConnect';
import { authOptions } from '@/lib/next-auth';
import prisma from '@/lib/prisma';

export default async function BlingConnectPage() {
  const session = await getServerSession(authOptions);
  let canConnect = false;
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    canConnect = !!user?.emailVerified;
  }
  return <BlingConnect canConnect={canConnect} />;
}
