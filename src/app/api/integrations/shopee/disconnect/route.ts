import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { ShopeeIntegration } from '@/lib/shopee/shopee-integration';
import { authOptions } from '@/lib/next-auth';

export async function POST() {
  try {
    const session = await getServerSession(authOptions);

    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Não autorizado' }, { status: 401 });
    }

    await ShopeeIntegration.disconnectShopee(session.user.id);

    return NextResponse.json({
      success: true,
      message: 'Conta Shopee desconectada com sucesso',
    });
  } catch (error) {
    console.error('Error disconnecting Shopee:', error);
    return NextResponse.json({ error: 'Erro ao desconectar conta Shopee' }, { status: 500 });
  }
}
