/** biome-ignore-all lint/suspicious/noConsole: <explanation> */
import { createBlingClient } from '@/lib/bling';
import prisma from '@/lib/prisma';
import { inngest } from '../client';

export const syncUserProducts = inngest.createFunction(
  { id: 'bling-sync-user-products' },
  { event: 'bling/sync:user' },
  async ({ event, step }) => {
    const { userId } = event.data;
    const integration = await prisma.blingIntegration.findUnique({ where: { userId } });
    if (!integration) {
      console.warn(`[sync-products] erro ao sincronizar usuário ${userId}`);
      return;
    }

    try {
      const client = createBlingClient({ accessToken: integration.accessToken });
      const products = await client.fetchProducts();

      console.warn(`[sync-products] sincronizando produtos do usuário. Total ${products.length}`);

      for (const p of products) {
        const blingId = String(p.id ?? p.codigo);
        const sku = String(p.codigo ?? blingId);
        const name = p.nome ?? 'Sem nome';
        const price = parseFloat(p.preco ?? 0);
        const cost = parseFloat(p.precoCusto ?? 0);
        const imageUrl = p.imagem?.url ?? null;
        const stockAmount = p.estoque?.saldoVirtualTotal ?? 0;

        await prisma.blingProduct.upsert({
          where: { blingId: String(blingId) },
          create: {
            blingId,
            sku,
            name,
            price,
            costPrice: cost,
            imageUrl,
            stockAmount,
            lastSynced: new Date(),
            integrationId: integration.id,
          },
          update: {
            name,
            price,
            costPrice: cost,
            imageUrl,
            stockAmount,
            lastSynced: new Date(),
          },
        });
      }

      await step.sendEvent('bling/generate-alerts', { name: 'bling/generate-alerts' });
    } catch (err) {
      console.error(`[sync-products] erro ao sincronizar usuário ${userId}`, err);
      throw err;
    }
  }
);

export const syncAllUsers = inngest.createFunction(
  { id: 'bling-sync-all' },
  { event: 'bling/sync-all' },
  async ({ step }) => {
    try {
      const integrations = await prisma.blingIntegration.findMany();
      for (const { userId } of integrations) {
        await step.sendEvent('bling/sync:user', { name: 'bling/sync:user', data: { userId } });
      }
    } catch (err) {
      console.error(`[sync-products] erro ao sincronizar todos os usuários`, err);
      throw err;
    }
  }
);
