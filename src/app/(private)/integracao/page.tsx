import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/next-auth';
import prisma from '@/lib/prisma';
import { IntegrationSelection } from '@/features/integrations/pages/IntegrationSelection';

export default async function IntegrationPage() {
  const session = await getServerSession(authOptions);
  let canConnect = false;
  const connectedProviders = { bling: false, meli: false, shopee: false, olist: false };

  if (session?.user?.id) {
    const user = await prisma.user.findUnique({
      where: { id: session.user.id },
      select: {
        emailVerified: true,
        blingIntegration: { select: { id: true } },
        meliIntegration: { select: { id: true } },
        shopeeIntegration: { select: { id: true } },
      },
    });
    canConnect = !!user?.emailVerified;
    connectedProviders.bling = !!user?.blingIntegration;
    connectedProviders.meli = !!user?.meliIntegration;
    connectedProviders.shopee = !!user?.shopeeIntegration;
  }

  return <IntegrationSelection canConnect={canConnect} connectedProviders={connectedProviders} />;
}
