import pino from 'pino';
import { createBlingRepository } from '@/lib/bling';
import { sendEmail } from '@/lib/brevo';
import { APP_URL } from '@/lib/constants';
import prisma from '@/lib/prisma';
import { inngest } from '../../client';

const logger = pino();

interface CriticalAlertEventData {
  integrationId: string;
  userId: string | null;
  jobId: string | null;
  blingProductId: string;
  metrics: unknown; // Not required here for sending the email
  productSnapshot: {
    name: string;
    sku: string;
    currentStock: number;
    salePrice: number;
    costPrice: number;
  };
}

export const notifyCriticalAlert = inngest.createFunction(
  { id: 'bling/notify-critical-alert', concurrency: 2 },
  { event: 'bling/alert-critical' },
  async ({ event, step }) => {
    const data = event.data as CriticalAlertEventData;
    const { userId, integrationId, blingProductId, productSnapshot, jobId } = data;

    try {
      if (!userId) {
        logger.warn(
          { integrationId, blingProductId },
          '[bling/notify-critical-alert] Missing userId, skipping'
        );
        return { sent: false };
      }

      const user = await prisma.user.findUnique({
        where: { id: userId },
        select: { id: true, email: true, name: true },
      });

      if (!user?.email) {
        logger.warn(
          { integrationId, userId },
          '[bling/notify-critical-alert] User not found or missing email'
        );
        return { sent: false };
      }

      const productLink = `${APP_URL}/produto/${encodeURIComponent(blingProductId)}`;

      const subject = `Alerta CRÍTICO: ${productSnapshot.name} (SKU ${productSnapshot.sku})`;

      await step.run('send-brevo-email', async () =>
        sendEmail({
          toEmail: user.email,
          toName: user.name || 'Cliente',
          subject,
          link: productLink,
          templateName: 'criticalAlert',
        })
      );

      const repo = createBlingRepository({ integrationId });
      await repo.markCriticalNotified(blingProductId, jobId ?? undefined);

      logger.info({ userId, blingProductId }, '[bling/notify-critical-alert] Notification sent');
      return { sent: true };
    } catch (error) {
      logger.error(
        { error, integrationId, blingProductId },
        '[bling/notify-critical-alert] Failed to send'
      );
      throw error;
    }
  }
);
