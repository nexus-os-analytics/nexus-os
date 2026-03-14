import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/next-auth';
import prisma from '@/lib/prisma';
import { IntegrationSelection } from '@/features/integrations/pages/IntegrationSelection';

export default async function IntegrationPage() {
  const session = await getServerSession(authOptions);
  let canConnect = false;
  if (session?.user?.id) {
    const user = await prisma.user.findUnique({ where: { id: session.user.id } });
    canConnect = !!user?.emailVerified;
  }
  return <IntegrationSelection canConnect={canConnect} />;
}
