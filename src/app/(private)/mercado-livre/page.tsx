import { getServerSession } from 'next-auth';
import { redirect } from 'next/navigation';
import { authOptions } from '@/lib/next-auth';
import prisma from '@/lib/prisma';
import { MeliMetricsService } from '@/lib/mercado-livre/meli-metrics';
import { IntegrationOverview } from '@/components/integrations/IntegrationOverview';
import { IntegrationProvider } from '@/types/integrations';

export default async function MercadoLivreConnectPage() {
  const session = await getServerSession(authOptions);

  if (!session?.user?.id) {
    redirect('/login');
  }

  const user = await prisma.user.findUnique({
    where: { id: session.user.id },
    select: { emailVerified: true, meliSyncStatus: true },
  });

  const canConnect = !!user?.emailVerified;

  // Fetch metrics if sync is complete
  let metrics = null;
  if (user?.meliSyncStatus === 'COMPLETED') {
    const service = new MeliMetricsService();
    try {
      metrics = await service.getMetrics({ userId: session.user.id });
    } catch (error) {
      console.error('Error fetching Meli metrics:', error);
    }
  }

  return (
    <IntegrationOverview
      provider={IntegrationProvider.MERCADO_LIVRE}
      canConnect={canConnect}
      initialMetrics={metrics}
      initialSyncStatus={user?.meliSyncStatus || 'IDLE'}
    />
  );
}
