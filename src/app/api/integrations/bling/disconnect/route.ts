import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { BlingIntegration } from '@/lib/bling/bling-integration';
import { authOptions } from '@/lib/next-auth';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await BlingIntegration.disconnectBling(session.user.id);

    return NextResponse.json({
      success: true,
      message: 'Conta Bling desconectada com sucesso',
    });
  } catch (error) {
    console.error('Error disconnecting Bling:', error);
    return NextResponse.json({ error: 'Erro ao desconectar conta Bling' }, { status: 500 });
  }
}
