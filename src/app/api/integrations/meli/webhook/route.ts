import { type NextRequest, NextResponse } from 'next/server';
import pino from 'pino';

const logger = pino().child({ module: 'meli-webhook-route' });

/**
 * Mercado Livre Notifications Webhook
 * 
 * Documentation: https://developers.mercadolibre.com.br/pt_br/notificacoes
 * 
 * Mercado Livre sends notifications for:
 * - orders: New orders, status changes
 * - items: Item updates, stock changes
 * - claims: Buyer claims
 * - questions: New questions on listings
 * 
 * This endpoint receives POST requests with notification payloads.
 * For production use, implement signature validation and event processing.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const topic = body.topic; // 'orders', 'items', 'claims', 'questions'
    const resource = body.resource; // URL to fetch full resource details
    const userId = body.user_id; // Mercado Livre user ID (seller)

    logger.info({ topic, resource, userId }, 'Received Mercado Livre notification');

    // TODO: Implement notification handling based on topic
    // - For 'items' topic: Update stock, trigger sync
    // - For 'orders' topic: Update sales history, trigger metrics calculation
    // - Queue processing via Inngest for async handling

    // For now, acknowledge receipt
    return NextResponse.json({ success: true });
  } catch (error) {
    logger.error(error, 'Error processing Mercado Livre webhook');
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

/**
 * GET endpoint for webhook validation (some providers send validation requests)
 */
export async function GET() {
  return NextResponse.json({ status: 'ok' });
}
