import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth/next';
import { getDashboardFirstImpact } from '@/features/dashboard/services';
import { BlingIntegration } from '@/lib/bling';
import { authOptions } from '@/lib/next-auth';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const integration = await BlingIntegration.getBlingIntegration(userId);

    if (!integration) {
      return NextResponse.json(
        { error: 'Integração com Bling não encontrada para o usuário.' },
        { status: 404 }
      );
    }

    const data = await getDashboardFirstImpact(integration.id);

    return NextResponse.json(data);
  } catch (err) {
    console.error('[first-impact]', err);
    return NextResponse.json({ error: 'Erro ao buscar dados do First Impact.' }, { status: 500 });
  }
}
