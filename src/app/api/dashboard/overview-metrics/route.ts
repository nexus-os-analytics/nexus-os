import { type NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth/next';
import { getPlanLimits } from '@/features/billing/entitlements';
import { BlingIntegration, createBlingRepository } from '@/lib/bling';
import { MeliIntegration, createMeliRepository } from '@/lib/mercado-livre';
import { ShopeeIntegration, createShopeeRepository } from '@/lib/shopee';
import { authOptions } from '@/lib/next-auth';
import prisma from '@/lib/prisma';

const querySchema = z.object({
  provider: z.enum(['BLING', 'MERCADO_LIVRE', 'SHOPEE']).default('BLING'),
});

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const parsed = querySchema.safeParse(
      Object.fromEntries(request.nextUrl.searchParams.entries())
    );
    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos.', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { provider } = parsed.data;
    const planTier = session.user?.planTier ?? 'FREE';

    if (provider === 'BLING') {
      const integration = await BlingIntegration.getBlingIntegration(userId);

      if (!integration) {
        return NextResponse.json({ error: 'Integração não encontrada.' }, { status: 404 });
      }

      const repository = createBlingRepository({ integrationId: integration.id });
      const result = await repository.getOverviewMetrics({ integrationId: integration.id });

      if (planTier === 'FREE') {
        const productCount = await prisma.blingProduct.count({
          where: { integrationId: integration.id },
        });
        const limits = getPlanLimits('FREE');
        return NextResponse.json({
          ...result,
          productCount,
          productLimit: limits.products === 'unlimited' ? null : limits.products,
        });
      }

      return NextResponse.json(result);
    }

    if (provider === 'MERCADO_LIVRE') {
      const integration = await MeliIntegration.getMeliIntegration(userId);

      if (!integration) {
        return NextResponse.json({ error: 'Integração não encontrada.' }, { status: 404 });
      }

      const repository = createMeliRepository({ integrationId: integration.id });
      const result = await repository.getOverviewMetrics({ integrationId: integration.id });

      if (planTier === 'FREE') {
        const productCount = await prisma.meliProduct.count({
          where: { integrationId: integration.id },
        });
        const limits = getPlanLimits('FREE');
        return NextResponse.json({
          ...result,
          productCount,
          productLimit: limits.products === 'unlimited' ? null : limits.products,
        });
      }

      return NextResponse.json(result);
    }

    // provider === 'SHOPEE'
    const integration = await ShopeeIntegration.getShopeeIntegration(userId);

    if (!integration) {
      return NextResponse.json({ error: 'Integração não encontrada.' }, { status: 404 });
    }

    const repository = createShopeeRepository({ integrationId: integration.id });
    const result = await repository.getOverviewMetrics({ integrationId: integration.id });

    if (planTier === 'FREE') {
      const productCount = await prisma.shopeeProduct.count({
        where: { integrationId: integration.id },
      });
      const limits = getPlanLimits('FREE');
      return NextResponse.json({
        ...result,
        productCount,
        productLimit: limits.products === 'unlimited' ? null : limits.products,
      });
    }

    return NextResponse.json(result);
  } catch (err) {
    console.error('[overview-metrics]', err);
    return NextResponse.json({ error: 'Erro ao buscar dados da visão geral.' }, { status: 500 });
  }
}
