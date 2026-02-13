import type { PlanTier } from '@prisma/client';
import pino from 'pino';
import { sendEmail } from '@/lib/brevo';

const logger = pino();

// Constant for Unix timestamp conversion (seconds to milliseconds)
export const SECONDS_TO_MS = 1000;

/**
 * Maps Stripe subscription status to PlanTier
 * Only active/trialing subscriptions grant PRO access
 *
 * Stripe subscription statuses:
 * - active: subscription is active and paid
 * - trialing: in trial period
 * - past_due: payment failed but subscription still active (grace period)
 * - canceled: subscription canceled
 * - incomplete: initial payment failed
 * - incomplete_expired: initial payment expired
 * - unpaid: payment failed and grace period expired
 * - paused: subscription paused (rare)
 */
export function getPlanTierFromStatus(status: string): PlanTier {
  switch (status) {
    case 'active':
    case 'trialing':
      return 'PRO';
    default:
      return 'FREE';
  }
}

/**
 * Extract customer ID from various Stripe object formats
 */
export function extractCustomerId(
  customer: string | { id: string } | null | undefined | unknown
): string | null {
  if (!customer) return null;
  if (typeof customer === 'string') return customer;
  if (typeof customer === 'object' && 'id' in customer && typeof customer.id === 'string') {
    return customer.id;
  }
  return null;
}

/**
 * Extract subscription ID from various Stripe object formats
 */
export function extractSubscriptionId(
  subscription: string | { id: string } | null | undefined | unknown
): string | null {
  if (!subscription) return null;
  if (typeof subscription === 'string') return subscription;
  if (
    typeof subscription === 'object' &&
    'id' in subscription &&
    typeof subscription.id === 'string'
  ) {
    return subscription.id;
  }
  return null;
}

/**
 * Send notification email with error handling
 * Email failures are logged but don't throw to prevent webhook retry issues
 */
export async function sendNotificationEmail({
  toEmail,
  toName,
  subject,
  link,
  templateName,
  context,
}: {
  toEmail: string;
  toName: string;
  subject: string;
  link?: string;
  templateName:
    | 'welcome'
    | 'resetPassword'
    | 'inviteUser'
    | 'criticalAlert'
    | 'paymentConfirmed'
    | 'subscriptionCanceled'
    | 'paymentFailed'
    | 'subscriptionTrialEnding';
  context?: Record<string, unknown>;
}): Promise<void> {
  try {
    await sendEmail({
      toEmail,
      toName,
      subject,
      link,
      templateName,
    });

    logger.info({ toEmail, templateName, ...context }, 'Notification email sent successfully');
  } catch (error) {
    logger.error({ error, toEmail, templateName, ...context }, 'Failed to send notification email');
    // Don't throw - email failure shouldn't fail the webhook
  }
}
