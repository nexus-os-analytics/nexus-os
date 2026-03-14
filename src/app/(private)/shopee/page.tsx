import { getServerSession } from 'next-auth';
import { ShopeeConnect } from '@/features/shopee/pages/ShopeeConnect';
import { authOptions } from '@/lib/next-auth';
import prisma from '@/lib/prisma';

export default async function ShopeeConnectPage() {
  const session = await getServerSession(authOptions);
  let canConnect = false;
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    canConnect = !!user?.emailVerified;
  }
  return <ShopeeConnect canConnect={canConnect} />;
}
