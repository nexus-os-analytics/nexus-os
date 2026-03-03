import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { MeliIntegration } from '@/lib/mercado-livre/meli-integration';
import { authOptions } from '@/lib/next-auth';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await MeliIntegration.disconnectMeli(session.user.id);

    return NextResponse.json({
      success: true,
      message: 'Conta Mercado Livre desconectada com sucesso',
    });
  } catch (error) {
    console.error('Error disconnecting Mercado Livre:', error);
    return NextResponse.json({ error: 'Erro ao desconectar conta Mercado Livre' }, { status: 500 });
  }
}
