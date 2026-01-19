import type { BlingAlertType, BlingRuptureRisk } from '@prisma/client';
import type { NextRequest } from 'next/server';
import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import pino from 'pino';
import { BlingIntegration, createBlingRepository } from '@/lib/bling';
import { authOptions } from '@/lib/next-auth';

const logger = pino({ name: 'api/dashboard/alerts/export' });
const DEFAULT_EXPORT_LIMIT = 1000;

function toCsvValue(value: unknown): string {
  if (value === null || value === undefined) return '';
  const normalized = typeof value === 'object' ? JSON.stringify(value) : String(value);
  if (/[",\n]/.test(normalized)) {
    return `"${normalized.replaceAll('"', '""')}"`;
  }
  return normalized;
}

export async function GET(req: NextRequest) {
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

    const { searchParams } = new URL(req.url);
    const typeParam = searchParams.get('type');
    const riskParam = searchParams.get('risk');
    const limitParam = Number(searchParams.get('limit')) || DEFAULT_EXPORT_LIMIT;

    const blingRepository = createBlingRepository({ integrationId: integration.id });

    const result = await blingRepository.getProductAlerts({
      integrationId: integration.id,
      limit: limitParam,
      filters: {
        type: typeParam ? (typeParam.split(',') as BlingAlertType[]) : undefined,
        risk: riskParam ? (riskParam.split(',') as BlingRuptureRisk[]) : undefined,
      },
    });

    const headers = [
      'blingProductId',
      'sku',
      'name',
      'categoryName',
      'costPrice',
      'salePrice',
      'currentStock',
      'alert.type',
      'alert.risk',
      'alert.vvdReal',
      'alert.vvd7',
      'alert.vvd30',
      'alert.daysRemaining',
      'alert.reorderPoint',
      'alert.growthTrend',
      'alert.capitalStuck',
      'alert.daysSinceLastSale',
      'alert.suggestedPrice',
      'alert.estimatedDeadline',
      'alert.recoverableAmount',
      'alert.daysOutOfStock',
      'alert.estimatedLostSales',
      'alert.estimatedLostAmount',
      'alert.idealStock',
      'alert.excessUnits',
      'alert.excessPercentage',
      'alert.excessCapital',
      'alert.recommendations',
    ];

    const rows = result.data.map((p) => {
      const a = p.alert;
      let recs: string[] = [];
      if (a?.recommendations) {
        if (Array.isArray(a.recommendations)) {
          recs = a.recommendations as string[];
        } else {
          try {
            recs = JSON.parse(a.recommendations as unknown as string) as string[];
          } catch {
            recs = [];
          }
        }
      }

      const cols: unknown[] = [
        p.blingProductId,
        p.sku,
        p.name,
        p.category?.name ?? '',
        p.costPrice,
        p.salePrice,
        p.currentStock,
        a?.type ?? '',
        a?.risk ?? '',
        a?.vvdReal ?? '',
        a?.vvd7 ?? '',
        a?.vvd30 ?? '',
        a?.daysRemaining ?? '',
        a?.reorderPoint ?? '',
        a?.growthTrend ?? '',
        a?.capitalStuck ?? '',
        a?.daysSinceLastSale ?? '',
        a?.suggestedPrice ?? '',
        a?.estimatedDeadline ?? '',
        a?.recoverableAmount ?? '',
        a?.daysOutOfStock ?? '',
        a?.estimatedLostSales ?? '',
        a?.estimatedLostAmount ?? '',
        a?.idealStock ?? '',
        a?.excessUnits ?? '',
        a?.excessPercentage ?? '',
        a?.excessCapital ?? '',
        recs.join(' | '),
      ];

      return cols.map(toCsvValue).join(',');
    });

    const csv = [headers.join(','), ...rows].join('\n');

    return new Response(csv, {
      status: 200,
      headers: {
        'Content-Type': 'text/csv; charset=utf-8',
        'Content-Disposition': 'attachment; filename="alerts.csv"',
        'Cache-Control': 'no-store',
      },
    });
  } catch (err) {
    logger.error({ err }, 'Erro ao exportar CSV de alertas');
    return NextResponse.json({ error: 'Erro ao exportar CSV.' }, { status: 500 });
  }
}
