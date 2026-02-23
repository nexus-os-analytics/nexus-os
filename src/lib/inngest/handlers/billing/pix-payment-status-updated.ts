import pino from 'pino';
import { sendEmail } from '@/lib/brevo';
import { APP_URL } from '@/lib/constants';
import prisma from '@/lib/prisma';
import { PixPaymentStatus } from '@prisma/client';
import { inngest } from '../../client';

const logger = pino();

interface PixPaymentStatusUpdatedData {
  paymentId: string;
  userId: string;
  newStatus: string;
  userEmail: string;
  userName?: string;
  eventId: string;
}

function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();
    if (message.includes('401') || message.includes('unauthorized')) return false;
    if (message.includes('403') || message.includes('forbidden')) return false;
    if (message.includes('400') || message.includes('bad request')) return false;
    if (message.includes('missing') && message.includes('environment')) return false;
    if (message.includes('timeout')) return true;
    if (/5[0-9]{2}/.test(message) || message.includes('502') || message.includes('503') || message.includes('504')) return true;
    if (message.includes('network') || message.includes('econnrefused')) return true;
  }
  return true;
}

export const sendPixPaymentStatusEmail = inngest.createFunction(
  {
    id: 'billing/send-pix-payment-status-email',
    concurrency: 5,
    retries: 3,
  },
  { event: 'billing/pix-payment-status-updated' },
  async ({ event, step, attempt }) => {
    const data = event.data as PixPaymentStatusUpdatedData;
    const { paymentId, userId, newStatus, userEmail, userName, eventId } = data;

    const templateName =
      newStatus === PixPaymentStatus.PAGAMENTO_CONFIRMADO
        ? 'pixPaymentConfirmed'
        : 'pixPaymentRejected';

    logger.info(
      { operation: 'sendPixPaymentStatusEmail', eventId, paymentId, userId, templateName, attempt },
      'Processing PIX payment status email'
    );

    try {
      const existingLog = await step.run('check-idempotency', async () => {
        return await prisma.emailDeliveryLog.findUnique({
          where: {
            eventId_templateName: { eventId, templateName },
          },
        });
      });

      if (existingLog?.status === 'SENT') {
        logger.info({ eventId, paymentId, emailLogId: existingLog.id }, 'PIX status email already sent, skipping');
        return { sent: false, duplicate: true, emailLogId: existingLog.id };
      }

      const emailLog = await step.run('create-email-log', async () => {
        return await prisma.emailDeliveryLog.upsert({
          where: {
            eventId_templateName: { eventId, templateName },
          },
          create: {
            userId,
            eventId,
            templateName,
            status: 'PENDING',
            retryCount: attempt - 1,
          },
          update: {
            retryCount: attempt - 1,
          },
        });
      });

      await step.run('send-brevo-email', async () => {
        try {
          const link = `${APP_URL}/minha-conta`;
          const subject =
            newStatus === PixPaymentStatus.PAGAMENTO_CONFIRMADO
              ? 'Pagamento PIX confirmado - Nexus OS'
              : 'Pagamento PIX não confirmado - Nexus OS';

          await sendEmail({
            toEmail: userEmail,
            toName: userName ?? 'Cliente',
            subject,
            link,
            templateName,
          });

          logger.info(
            { operation: 'sendPixPaymentStatusEmail', eventId, paymentId, result: 'success' },
            'PIX payment status email sent'
          );
        } catch (error) {
          const isRetryable = isRetryableError(error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';

          logger.error(
            { operation: 'sendPixPaymentStatusEmail', eventId, paymentId, attempt, isRetryable, error: errorMessage },
            'Failed to send PIX status email'
          );

          await prisma.emailDeliveryLog.update({
            where: { id: emailLog.id },
            data: { errorMessage, retryCount: attempt - 1 },
          });

          if (isRetryable) {
            throw error;
          }
          await prisma.emailDeliveryLog.update({
            where: { id: emailLog.id },
            data: { status: 'FAILED', errorMessage: `Permanent error: ${errorMessage}` },
          });
          return { sent: false, permanentFailure: true, error: errorMessage };
        }
      });

      await step.run('mark-email-sent', async () => {
        await prisma.emailDeliveryLog.update({
          where: { id: emailLog.id },
          data: { status: 'SENT', sentAt: new Date() },
        });
      });

      logger.info({ eventId, paymentId, result: 'success' }, 'PIX payment status email delivered');
      return { sent: true, emailLogId: emailLog.id };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      logger.error(
        { operation: 'sendPixPaymentStatusEmail', eventId, paymentId, attempt, error: errorMessage },
        'Failed to process PIX payment status email'
      );
      if (attempt >= 3) {
        try {
          await prisma.emailDeliveryLog.updateMany({
            where: { eventId, templateName, status: 'PENDING' },
            data: { status: 'FAILED', errorMessage: `All retries exhausted: ${errorMessage}` },
          });
        } catch (dbError) {
          logger.error({ dbError, eventId }, 'Failed to update EmailDeliveryLog after final retry');
        }
      }
      throw error;
    }
  }
);
