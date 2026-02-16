# Session Refresh & Plan Tier Updates

## Overview

This document explains how session updates work when a user's plan tier changes (e.g., after payment confirmation via Stripe webhook).

## How It Works

### 1. Payment Flow

```
User → Stripe Checkout → Payment Success → Webhook → Database Update → Session Refresh
```

1. **User completes payment** on Stripe
2. **Stripe sends webhook** to `/api/stripe/webhook`
3. **Webhook handler updates** `planTier` in database
4. **User is redirected** to `/pagamento/sucesso` page
5. **Session is automatically refreshed** using polling

### 2. NextAuth Session Update

The NextAuth configuration supports session updates via the `jwt` callback with `trigger === 'update'`:

```typescript
// src/lib/next-auth/index.ts
async jwt({ token, trigger }) {
  if (trigger === 'update') {
    const updatedUser = await prisma.user.findUnique({
      where: { id: token.id as string },
      include: { blingIntegration: true },
    });

    if (updatedUser) {
      token.planTier = updatedUser.planTier;
      token.subscriptionStatus = updatedUser.subscriptionStatus;
      // ... other fields
    }
  }
  return token;
}
```

When `update()` is called from the client, NextAuth fetches fresh data from the database.

## Using `useSessionRefresh` Hook

### Basic Usage

```tsx
import { useSessionRefresh } from '@/hooks';

function MyComponent() {
  const { session, isRefreshing, refreshSession } = useSessionRefresh();

  return (
    <div>
      <p>Plan: {session?.user?.planTier}</p>
      <button onClick={refreshSession} disabled={isRefreshing}>
        {isRefreshing ? 'Refreshing...' : 'Refresh Session'}
      </button>
    </div>
  );
}
```

### Automatic Polling (Payment Success Page)

```tsx
import { useSessionRefresh } from '@/hooks';

function StripeSuccessPage() {
  const { session, isRefreshing, hasTimedOut } = useSessionRefresh({
    enablePolling: true, // Enable automatic polling
    pollingInterval: 3000, // Check every 3 seconds
    maxPollingDuration: 30000, // Stop after 30 seconds
    onSessionUpdated: () => {
      console.log('Plan tier updated!');
    },
    onTimeout: () => {
      console.warn('Session update timed out');
    },
  });

  if (isRefreshing) {
    return <Loader />;
  }

  if (session?.user?.planTier === 'PRO') {
    return <div>Plan activated!</div>;
  }

  return <div>Activating plan...</div>;
}
```

## Manual Session Refresh

### From any component with `useSession`:

```tsx
import { useSession } from 'next-auth/react';

function MyComponent() {
  const { update } = useSession();

  const handleRefresh = async () => {
    await update();
    console.log('Session refreshed');
  };

  return <button onClick={handleRefresh}>Refresh</button>;
}
```

### From AuthContext:

```tsx
import { useAuth } from '@/features/auth/context/AuthContext';

function MyComponent() {
  const { update } = useAuth();

  const handleRefresh = async () => {
    await update();
    console.log('Session refreshed');
  };

  return <button onClick={handleRefresh}>Refresh</button>;
}
```

## When to Use Each Method

### Use `useSessionRefresh` with polling when:

- ✅ Waiting for async backend operations (webhooks, background jobs)
- ✅ Payment success pages
- ✅ Long-running operations that update user data
- ✅ Need visual feedback during refresh

### Use manual `update()` when:

- ✅ User explicitly clicks a button (e.g., "Refresh")
- ✅ After a synchronous operation that updates user data
- ✅ Returning from external pages (Stripe Portal, etc.)

### Don't use session refresh:

- ❌ On every page load (performance impact)
- ❌ In rapid succession (rate limiting)
- ❌ For non-critical UI updates

## Architecture

### Session Update Flow

```
┌─────────────────┐
│  Client         │
│  useSession()   │
└────────┬────────┘
         │ 1. update()
         ▼
┌─────────────────┐
│  NextAuth       │
│  jwt callback   │
└────────┬────────┘
         │ 2. trigger: 'update'
         ▼
┌─────────────────┐
│  Database       │
│  prisma.user... │
└────────┬────────┘
         │ 3. Fresh data
         ▼
┌─────────────────┐
│  Client         │
│  Updated session│
└─────────────────┘
```

## Performance Considerations

- **Polling interval:** 3 seconds is a good balance between UX and server load
- **Timeout:** 30 seconds prevents infinite polling
- **Automatic cleanup:** Hook stops polling on unmount
- **Cookie size:** JWT tokens are stored in cookies (keep minimal)

## Security Notes

- Session updates **require valid authentication**
- The `jwt` callback validates the user exists before updating token
- Deleted users (`deletedAt !== null`) cannot refresh sessions
- Rate limiting applies to session updates (NextAuth built-in)

## Troubleshooting

### Session not updating after payment

**Check:**

1. Webhook was received and processed successfully (check logs)
2. Database was updated (`planTier` changed to 'PRO')
3. User is authenticated (valid session)
4. Polling is enabled on success page
5. Console for errors during `update()` call

**Solution:**

```tsx
// Add debug logging
const { session, refreshSession } = useSessionRefresh({
  enablePolling: true,
  onSessionUpdated: () => console.log('Updated!', session?.user?.planTier),
});
```

### Polling timeout reached

**Issue:** Webhook takes longer than 30 seconds to process.

**Solution:** Increase `maxPollingDuration` or show manual refresh button:

```tsx
const { hasTimedOut, refreshSession } = useSessionRefresh({
  maxPollingDuration: 60000, // 60 seconds
});

if (hasTimedOut) {
  return <button onClick={refreshSession}>Retry</button>;
}
```

## Related Files

- Hook: [`src/hooks/useSessionRefresh.ts`](../src/hooks/useSessionRefresh.ts)
- NextAuth Config: [`src/lib/next-auth/index.ts`](../src/lib/next-auth/index.ts)
- Success Page: [`src/app/(public)/pagamento/sucesso/page.tsx`](<../src/app/(public)/pagamento/sucesso/page.tsx>)
- Webhook Handler: [`src/app/api/stripe/webhook/route.ts`](../src/app/api/stripe/webhook/route.ts)
