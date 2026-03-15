import {
  IntegrationProvider,
  type BlingAlertType,
  type BlingRuptureRisk,
  type MeliAlertType,
  type MeliRuptureRisk,
  type ShopeeAlertType,
  type ShopeeRuptureRisk,
} from '@prisma/client';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
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

const logger = pino({ name: 'api/dashboard/alerts/export' });
const DEFAULT_EXPORT_LIMIT = 1000;

const querySchema = z.object({
  provider: z.enum(['BLING', 'MERCADO_LIVRE', 'SHOPEE']).default('BLING'),
  type: z.string().optional(),
  risk: z.string().optional(),
  limit: z.coerce.number().int().positive().max(DEFAULT_EXPORT_LIMIT).default(DEFAULT_EXPORT_LIMIT),
});

// ---------------------------------------------------------------------------
// Normalizers (mirrors alerts/route.ts)
// ---------------------------------------------------------------------------

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
    | 'reorderPoint'
    | 'capitalStuck'
    | 'daysSinceLastSale'
    | 'message'
    | 'recommendations'
    | 'createdAt'
    | 'updatedAt'
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
          reorderPoint: product.alert.reorderPoint,
          capitalStuck: product.alert.capitalStuck,
          daysSinceLastSale: product.alert.daysSinceLastSale,
          message: product.alert.message ?? null,
          recommendations: product.alert.recommendations ?? null,
          createdAt: product.alert.createdAt,
          updatedAt: product.alert.updatedAt,
        }
      : null,
  };
}

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
    reorderPoint: raw.reorderPoint,
    capitalStuck: raw.capitalStuck,
    daysSinceLastSale: raw.daysSinceLastSale,
    message: raw.message ?? null,
    recommendations,
    createdAt: raw.createdAt,
    updatedAt: raw.updatedAt,
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
          reorderPoint: product.alert.reorderPoint,
          capitalStuck: product.alert.capitalStuck,
          daysSinceLastSale: product.alert.daysSinceLastSale,
          message: product.alert.message ?? null,
          recommendations: product.alert.recommendations ?? null,
          createdAt: product.alert.createdAt,
          updatedAt: product.alert.updatedAt,
        }
      : null,
  };
}

// ---------------------------------------------------------------------------
// CSV helpers
// ---------------------------------------------------------------------------

function toCsvValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  const str = typeof value === 'object' ? JSON.stringify(value) : String(value);
  if (/[",\n]/.test(str)) {
    return `"${str.replaceAll('"', '""')}"`;
  }
  return str;
}

function parseRecommendations(raw: string | null): string {
  if (!raw) return '';
  try {
    const parsed = JSON.parse(raw) as unknown;
    if (Array.isArray(parsed)) return (parsed as string[]).join(' | ');
  } catch {
    // raw is already a plain string
  }
  return raw;
}

const CSV_HEADERS = [
  'externalId',
  'provider',
  'name',
  'sku',
  'costPrice',
  'salePrice',
  'currentStock',
  'alert.type',
  'alert.risk',
  'alert.vvdReal',
  'alert.vvd7',
  'alert.vvd30',
  'alert.daysRemaining',
  'alert.capitalStuck',
  'alert.recommendations',
] as const;

function productToCsvRow(p: DashboardAlertProduct): string {
  const a = p.alert;
  const cols: unknown[] = [
    p.externalId,
    p.provider,
    p.name,
    p.sku,
    p.costPrice,
    p.salePrice,
    p.currentStock,
    a?.type ?? '',
    a?.risk ?? '',
    a?.vvdReal ?? '',
    a?.vvd7 ?? '',
    a?.vvd30 ?? '',
    a?.daysRemaining ?? '',
    a?.capitalStuck ?? '',
    parseRecommendations(a?.recommendations ?? null),
  ];
  return cols.map(toCsvValue).join(',');
}

// ---------------------------------------------------------------------------
// Route handler
// ---------------------------------------------------------------------------

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
      type: searchParams.get('type') ?? undefined,
      risk: searchParams.get('risk') ?? undefined,
      limit: searchParams.get('limit') ?? undefined,
    });

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Parâmetros inválidos.', details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { provider, type: typeParam, risk: riskParam, limit } = parsed.data;

    let normalized: DashboardAlertProduct[];

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
      const result = await blingRepo.getProductAlerts({
        integrationId: integration.id,
        limit,
        filters,
      });

      normalized = (result.data as unknown as BlingProductRaw[]).map(normalizeBlingProduct);
    } else if (provider === 'MERCADO_LIVRE') {
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
      const result = await meliRepo.getProductAlerts({
        integrationId: integration.id,
        limit,
        filters,
      });

      normalized = result.data.map(normalizeMeliProduct);
    } else {
      // provider === 'SHOPEE'
      const integration = await ShopeeIntegration.getShopeeIntegration(userId);

      if (!integration) {
        return NextResponse.json(
          { error: 'Integração com Shopee não encontrada para o usuário.' },
          { status: 404 }
        );
      }

      const filters: { type?: ShopeeAlertType[]; risk?: ShopeeRuptureRisk[] } = {};
      if (typeParam) filters.type = typeParam.split(',') as ShopeeAlertType[];
      if (riskParam) filters.risk = riskParam.split(',') as ShopeeRuptureRisk[];

      const shopeeRepo = createShopeeRepository({ integrationId: integration.id });
      const result = await shopeeRepo.getProductAlerts({
        integrationId: integration.id,
        limit,
        filters,
      });

      normalized = result.data.map(normalizeShopeeProduct);
    }

    logger.info({ provider, count: normalized.length }, 'Exporting alerts CSV');

    const csv = [CSV_HEADERS.join(','), ...normalized.map(productToCsvRow)].join('\n');

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': `attachment; filename="alerts-${provider.toLowerCase()}.csv"`,
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    logger.error({ err }, 'Erro ao exportar CSV de alertas');
    return NextResponse.json({ error: 'Erro ao exportar CSV.' }, { status: 500 });
  }
}
