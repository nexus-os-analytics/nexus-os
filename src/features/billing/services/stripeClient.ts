import { HTTP_STATUS } from '@/lib/constants/http-status';

export async function openCheckout() {
  const res = await fetch('/api/stripe/checkout', { method: 'POST' });
  if (res.status === HTTP_STATUS.UNAUTHORIZED) {
    window.location.href = '/login?plan=PRO';
    return;
  }
  const data = (await res.json()) as { url?: string };
  if (data.url) window.location.href = data.url;
}

export async function openPortal() {
  const res = await fetch('/api/stripe/portal', { method: 'POST' });
  if (res.status === HTTP_STATUS.UNAUTHORIZED) {
    window.location.href = '/login';
    return;
  }
  const data = (await res.json()) as { url?: string };
  if (data.url) window.location.href = data.url;
}
