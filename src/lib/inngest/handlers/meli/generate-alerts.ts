import { MeliSyncStatus } from '@prisma/client';
import pino from 'pino';
import { createMeliRepository } from '@/lib/mercado-livre';
import prisma from '@/lib/prisma';
import { inngest } from '../../client';

const logger = pino();

/**
 * Generate alerts for Mercado Livre products.
 * 
 * NOTE: Full metrics calculation will be implemented once the shared metrics engine
 * is extracted from bling-utils.ts. For now, this handler completes the sync flow
 * without generating actual alerts.
 * 
 * TODO Phase 4+: Extract metrics engine to src/lib/integrations/metrics-engine.ts
 * and implement alert generation using the same logic as Bling.
 */
export const generateAlerts = inngest.createFunction(
  {
    id: 'meli/generate-alerts',
    concurrency: 1,
  },
  { event: 'meli/generate-alerts' },
  async ({ event, step }) => {
    const { integrationId, userId, jobId } = event.data;

    try {
      const meliRepository = createMeliRepository({
        integrationId,
      });

      logger.info(
        `[meli/generate-alerts] Starting alert generation (placeholder) for integration ${integrationId}, user ${userId}, job ${jobId}`
      );

      const result = {
        alertsGenerated: 0,
        errorsCount: 0,
        totalProducts: 0,
      };

      // Count products
      const take = 100;
      let skip = 0;
      while (true) {
        const products = await meliRepository.getProducts(take, skip);
        if (products.length === 0) break;
        result.totalProducts += products.length;
        skip += take;

        // TODO: Implement metrics calculation and alert generation
        // For each product:
        // 1. Fetch sales history and stock balance
        // 2. Calculate metrics using shared engine
        // 3. Upsert product alert
        // 4. Emit critical alert event if needed
      }

      logger.info(
        `[meli/generate-alerts] Processed ${result.totalProducts} products (alerts not yet implemented)`
      );

      // Emit completion event
      await step.sendEvent('meli/sync:complete', {
        name: 'meli/sync:complete',
        data: {
          userId,
          integrationId,
          jobId,
          ...result,
        },
      });

      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: { meliSyncStatus: MeliSyncStatus.COMPLETED },
        });
      }

      logger.info(
        `[meli/generate-alerts] Alert generation completed for integration ${integrationId}`
      );
      
      return result;
    } catch (error) {
      logger.error({ error, integrationId, jobId }, 'Alert generation failed');

      if (userId) {
        await prisma.user.update({
          where: { id: userId },
          data: { meliSyncStatus: MeliSyncStatus.FAILED },
        });
      }

      throw error;
    }
  }
);
