import { HTTP_STATUS } from '@/lib/constants/http-status';

/**
 * Opens Stripe Checkout for PRO subscription
 * Redirects to Stripe hosted checkout page
 */
export async function openCheckout() {
  const res = await fetch('/api/stripe/checkout', { method: 'POST' });
  if (res.status === HTTP_STATUS.UNAUTHORIZED) {
    window.location.href = '/login?plan=PRO';
    return;
  }
  const data = (await res.json()) as { url?: string };
  if (data.url) window.location.href = data.url;
}

/**
 * Opens Stripe Customer Portal for subscription management
 *
 * Users can:
 * - Cancel their subscription (keeps PRO access until period end)
 * - Reactivate canceled subscriptions
 * - Update payment method
 * - View billing history and invoices
 *
 * After returning from portal, the page will automatically refresh
 * the session to reflect any subscription changes made
 */
export async function openPortal() {
  const res = await fetch('/api/stripe/portal', { method: 'POST' });
  if (res.status === HTTP_STATUS.UNAUTHORIZED) {
    window.location.href = '/login';
    return;
  }
  const data = (await res.json()) as { url?: string };
  if (data.url) window.location.href = data.url;
}
