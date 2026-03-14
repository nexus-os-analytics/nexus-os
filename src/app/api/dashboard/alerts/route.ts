import {
  IntegrationProvider,
  type BlingAlertType,
  type BlingRuptureRisk,
  type MeliAlertType,
  type MeliRuptureRisk,
  type ShopeeAlertType,
  type ShopeeRuptureRisk,
} from '@prisma/client';
import { type NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import pino from 'pino';
import { z } from 'zod';
import type { DashboardAlertProduct, DashboardProductAlert } from '@/features/products/types';
import type { BlingProductAlertType, BlingProductType } from '@/lib/bling';
import { BlingIntegration, createBlingRepository } from '@/lib/bling';
import type { MeliProductAlertType, MeliProductType } from '@/lib/mercado-livre';
import { MeliIntegration, createMeliRepository } from '@/lib/mercado-livre';
import { authOptions } from '@/lib/next-auth';
import type { ShopeeProductType } from '@/lib/shopee';
import { ShopeeIntegration, createShopeeRepository } from '@/lib/shopee';

const PAGE_SIZE_DEFAULT = 20;
const logger = pino({ name: 'api/dashboard/alerts' });

const querySchema = z.object({
  provider: z.enum(['BLING', 'MERCADO_LIVRE', 'SHOPEE']).default('BLING'),
  limit: z.coerce.number().int().positive().max(100).default(PAGE_SIZE_DEFAULT),
  cursor: z.string().optional(),
  type: z.string().optional(),
  risk: z.string().optional(),
});

/**
 * The bling repository maps products to objects matching BlingProductType at runtime,
 * even though its declared return type claims DashboardAlertProduct[].
 * This local type correctly describes the actual runtime shape.
 */
type BlingProductRaw = Pick<
  BlingProductType,
  'id' | 'blingProductId' | 'name' | 'sku' | 'costPrice' | 'salePrice' | 'currentStock' | 'image'
> & {
  alert: Pick<
    BlingProductAlertType,
    | 'id'
    | 'type'
    | 'risk'
    | 'vvdReal'
    | 'vvd30'
    | 'vvd7'
    | 'daysRemaining'
    | 'capitalStuck'
    | 'recommendations'
  > | null;
};

function normalizeBlingProduct(product: BlingProductRaw): DashboardAlertProduct {
  return {
    id: product.id,
    externalId: product.blingProductId,
    provider: IntegrationProvider.BLING,
    name: product.name,
    sku: product.sku ?? null,
    costPrice: product.costPrice,
    salePrice: product.salePrice,
    currentStock: product.currentStock,
    image: product.image ?? null,
    alert: product.alert
      ? {
          id: product.alert.id,
          type: product.alert.type,
          risk: product.alert.risk,
          vvdReal: product.alert.vvdReal,
          vvd30: product.alert.vvd30,
          vvd7: product.alert.vvd7,
          daysRemaining: product.alert.daysRemaining,
          capitalStuck: product.alert.capitalStuck,
          recommendations: product.alert.recommendations ?? null,
        }
      : null,
  };
}

// MeliProductAlertType.recommendations is typed as `any` (Prisma JsonValue).
// Normalise it to string | null for the provider-agnostic DashboardProductAlert shape.
function buildMeliAlert(raw: MeliProductAlertType): DashboardProductAlert {
  const rawRecs = raw.recommendations as string | null | Record<string, unknown> | unknown[];
  const recommendations: string | null =
    rawRecs == null ? null : typeof rawRecs === 'string' ? rawRecs : JSON.stringify(rawRecs);

  return {
    id: raw.id,
    type: raw.type,
    risk: raw.risk,
    vvdReal: raw.vvdReal,
    vvd30: raw.vvd30,
    vvd7: raw.vvd7,
    daysRemaining: raw.daysRemaining,
    capitalStuck: raw.capitalStuck,
    recommendations,
  };
}

function normalizeMeliProduct(product: MeliProductType): DashboardAlertProduct {
  return {
    id: product.id,
    externalId: product.meliItemId,
    provider: IntegrationProvider.MERCADO_LIVRE,
    name: product.title,
    sku: product.sku ?? null,
    costPrice: product.costPrice,
    salePrice: product.salePrice,
    currentStock: product.currentStock,
    image: product.thumbnail ?? null,
    alert: product.alert ? buildMeliAlert(product.alert) : null,
  };
}

function normalizeShopeeProduct(product: ShopeeProductType): DashboardAlertProduct {
  return {
    id: product.id,
    externalId: product.shopeeItemId,
    provider: IntegrationProvider.SHOPEE,
    name: product.title,
    sku: product.sku ?? null,
    costPrice: product.costPrice,
    salePrice: product.salePrice,
    currentStock: product.currentStock,
    image: product.thumbnail ?? null,
    alert: product.alert
      ? {
          id: product.alert.id,
          type: product.alert.type,
          risk: product.alert.risk,
          vvdReal: product.alert.vvdReal,
          vvd30: product.alert.vvd30,
          vvd7: product.alert.vvd7,
          daysRemaining: product.alert.daysRemaining,
          capitalStuck: product.alert.capitalStuck,
          recommendations: product.alert.recommendations ?? null,
        }
      : null,
  };
}

export async function GET(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    const userId = session?.user?.id;

    if (!userId) {
      return NextResponse.json({ error: 'Não autenticado.' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const parsed = querySchema.safeParse({
      provider: searchParams.get('provider') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
      cursor: searchParams.get('cursor') ?? undefined,
      type: searchParams.get('type') ?? undefined,
      risk: searchParams.get('risk') ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos.', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { provider, limit, cursor, type: typeParam, risk: riskParam } = parsed.data;

    if (provider === 'BLING') {
      const integration = await BlingIntegration.getBlingIntegration(userId);

      if (!integration) {
        return NextResponse.json(
          { error: 'Integração com Bling não encontrada para o usuário.' },
          { status: 404 }
        );
      }

      const filters: { type?: BlingAlertType[]; risk?: BlingRuptureRisk[] } = {};
      if (typeParam) filters.type = typeParam.split(',') as BlingAlertType[];
      if (riskParam) filters.risk = riskParam.split(',') as BlingRuptureRisk[];

      const blingRepo = createBlingRepository({ integrationId: integration.id });

      logger.info(
        { filters, limit, cursor, integrationId: integration.id },
        'Fetching Bling product alerts'
      );

      const result = await blingRepo.getProductAlerts({
        integrationId: integration.id,
        limit,
        cursor,
        filters,
      });

      // Cast required: the bling repository's declared return type is incorrect at the type level
      // (it claims DashboardAlertProduct[] but maps to BlingProductType-shaped objects at runtime).
      const normalized = (result.data as unknown as BlingProductRaw[]).map(normalizeBlingProduct);

      return NextResponse.json({
        data: normalized,
        nextCursor: result.nextCursor,
        hasNextPage: result.hasNextPage,
      });
    }

    if (provider === 'MERCADO_LIVRE') {
      const integration = await MeliIntegration.getMeliIntegration(userId);

      if (!integration) {
        return NextResponse.json(
          { error: 'Integração com Mercado Livre não encontrada para o usuário.' },
          { status: 404 }
        );
      }

      const filters: { type?: MeliAlertType[]; risk?: MeliRuptureRisk[] } = {};
      if (typeParam) filters.type = typeParam.split(',') as MeliAlertType[];
      if (riskParam) filters.risk = riskParam.split(',') as MeliRuptureRisk[];

      const meliRepo = createMeliRepository({ integrationId: integration.id });

      logger.info(
        { filters, limit, integrationId: integration.id },
        'Fetching Meli product alerts'
      );

      const result = await meliRepo.getProductAlerts({
        integrationId: integration.id,
        limit,
        cursor,
        filters,
      });

      return NextResponse.json({
        data: result.data.map(normalizeMeliProduct),
        nextCursor: result.nextCursor,
        hasNextPage: result.hasNextPage,
      });
    }

    // provider === 'SHOPEE'
    const shopeeIntegration = await ShopeeIntegration.getShopeeIntegration(userId);

    if (!shopeeIntegration) {
      return NextResponse.json(
        { error: 'Integração com Shopee não encontrada para o usuário.' },
        { status: 404 }
      );
    }

    const shopeeFilters: { type?: ShopeeAlertType[]; risk?: ShopeeRuptureRisk[] } = {};
    if (typeParam) shopeeFilters.type = typeParam.split(',') as ShopeeAlertType[];
    if (riskParam) shopeeFilters.risk = riskParam.split(',') as ShopeeRuptureRisk[];

    const shopeeRepo = createShopeeRepository({ integrationId: shopeeIntegration.id });

    logger.info(
      { filters: shopeeFilters, limit, integrationId: shopeeIntegration.id },
      'Fetching Shopee product alerts'
    );

    const result = await shopeeRepo.getProductAlerts({
      integrationId: shopeeIntegration.id,
      limit,
      filters: shopeeFilters,
    });

    return NextResponse.json({
      data: result.data.map(normalizeShopeeProduct),
      nextCursor: result.nextCursor,
      hasNextPage: result.hasNextPage,
    });
  } catch (err) {
    logger.error({ err }, '[alerts] Unhandled error');
    return NextResponse.json({ error: 'Erro ao buscar os alertas.' }, { status: 500 });
  }
}
