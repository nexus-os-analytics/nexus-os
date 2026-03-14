import { getServerSession } from 'next-auth';
import { MeliConnect } from '@/features/mercado-livre/pages/MeliConnect';
import { authOptions } from '@/lib/next-auth';
import prisma from '@/lib/prisma';

export default async function MeliConnectPage() {
  const session = await getServerSession(authOptions);
  let canConnect = false;
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    canConnect = !!user?.emailVerified;
  }
  return <MeliConnect canConnect={canConnect} />;
}
