import pino from 'pino';
import { sendEmail } from '@/lib/brevo';
import { APP_URL } from '@/lib/constants';
import prisma from '@/lib/prisma';
import { inngest } from '../../client';

const logger = pino();

interface PaymentConfirmedEventData {
  userId: string;
  subscriptionId: string;
  userEmail: string;
  userName: string;
  planTier: string;
  eventId: string;
}

/**
 * Classifies error as retryable or permanent
 * Retryable: network issues, 5xx errors
 * Permanent: auth errors (401, 403), bad request (400)
 */
function isRetryableError(error: unknown): boolean {
  if (error instanceof Error) {
    const message = error.message.toLowerCase();

    // Permanent errors - don't retry
    if (message.includes('401') || message.includes('unauthorized')) return false;
    if (message.includes('403') || message.includes('forbidden')) return false;
    if (message.includes('400') || message.includes('bad request')) return false;
    if (message.includes('missing') && message.includes('environment')) return false;

    // Retryable errors
    if (message.includes('timeout')) return true;
    if (
      message.includes('500') ||
      message.includes('502') ||
      message.includes('503') ||
      message.includes('504')
    )
      return true;
    if (message.includes('network') || message.includes('econnrefused')) return true;
  }

  // Default to retryable for unknown errors
  return true;
}

export const sendPaymentConfirmationEmail = inngest.createFunction(
  {
    id: 'billing/send-payment-confirmation-email',
    concurrency: 5,
    retries: 3,
  },
  { event: 'billing/payment-confirmed' },
  async ({ event, step, attempt }) => {
    const data = event.data as PaymentConfirmedEventData;
    const { userId, subscriptionId, userEmail, userName, planTier, eventId } = data;

    logger.info(
      {
        operation: 'sendPaymentConfirmationEmail',
        eventId,
        userId,
        subscriptionId,
        attempt,
      },
      'Processing payment confirmation email'
    );

    try {
      // Step 1: Check idempotency - has this email already been sent?
      const existingLog = await step.run('check-idempotency', async () => {
        return await prisma.emailDeliveryLog.findUnique({
          where: {
            eventId_templateName: {
              eventId,
              templateName: 'paymentConfirmed',
            },
          },
        });
      });

      if (existingLog?.status === 'SENT') {
        logger.info(
          { eventId, userId, emailLogId: existingLog.id },
          'Email already sent, skipping duplicate'
        );
        return { sent: false, duplicate: true, emailLogId: existingLog.id };
      }

      // Step 2: Create or update email delivery log
      const emailLog = await step.run('create-email-log', async () => {
        return await prisma.emailDeliveryLog.upsert({
          where: {
            eventId_templateName: {
              eventId,
              templateName: 'paymentConfirmed',
            },
          },
          create: {
            userId,
            subscriptionId,
            eventId,
            templateName: 'paymentConfirmed',
            status: 'PENDING',
            retryCount: attempt - 1,
          },
          update: {
            retryCount: attempt - 1,
          },
        });
      });

      // Step 3: Send email via Brevo with automatic retry
      await step.run('send-brevo-email', async () => {
        try {
          await sendEmail({
            toEmail: userEmail,
            toName: userName || 'Cliente',
            subject: 'Bem-vindo ao Nexus OS PRO! 🚀',
            link: `${APP_URL}/minha-conta`,
            templateName: 'paymentConfirmed',
          });

          logger.info(
            { operation: 'sendPaymentEmail', eventId, userId, subscriptionId, result: 'success' },
            'Payment confirmation email sent successfully'
          );
        } catch (error) {
          const isRetryable = isRetryableError(error);
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';

          logger.error(
            {
              operation: 'sendPaymentEmail',
              eventId,
              userId,
              subscriptionId,
              attempt,
              isRetryable,
              error: errorMessage,
              result: 'failed',
            },
            'Failed to send payment confirmation email via Brevo'
          );

          // Update email log with error
          await prisma.emailDeliveryLog.update({
            where: { id: emailLog.id },
            data: {
              errorMessage,
              retryCount: attempt - 1,
            },
          });

          // Re-throw only if retryable
          if (isRetryable) {
            throw error;
          } else {
            // Mark as permanently failed for non-retryable errors
            await prisma.emailDeliveryLog.update({
              where: { id: emailLog.id },
              data: {
                status: 'FAILED',
                errorMessage: `Permanent error: ${errorMessage}`,
              },
            });

            logger.error(
              { eventId, userId, errorMessage },
              'Email delivery permanently failed (non-retryable error)'
            );

            return { sent: false, permanentFailure: true, error: errorMessage };
          }
        }
      });

      // Step 4: Mark email as successfully sent
      await step.run('mark-email-sent', async () => {
        await prisma.emailDeliveryLog.update({
          where: { id: emailLog.id },
          data: {
            status: 'SENT',
            sentAt: new Date(),
          },
        });
      });

      logger.info(
        { operation: 'sendPaymentConfirmationEmail', eventId, userId, result: 'success' },
        'Payment confirmation email delivered successfully'
      );

      return { sent: true, emailLogId: emailLog.id };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';

      logger.error(
        {
          operation: 'sendPaymentConfirmationEmail',
          eventId,
          userId,
          subscriptionId,
          attempt,
          error: errorMessage,
          result: 'failed',
        },
        'Failed to process payment confirmation email'
      );

      // If this is the final retry, mark as failed
      if (attempt >= 3) {
        try {
          await prisma.emailDeliveryLog.updateMany({
            where: {
              eventId,
              templateName: 'paymentConfirmed',
              status: 'PENDING',
            },
            data: {
              status: 'FAILED',
              errorMessage: `All retries exhausted: ${errorMessage}`,
            },
          });

          logger.error(
            { eventId, userId, errorMessage },
            'Email delivery failed after all retries'
          );
        } catch (dbError) {
          logger.error({ dbError, eventId }, 'Failed to update EmailDeliveryLog after final retry');
        }
      }

      throw error;
    }
  }
);
