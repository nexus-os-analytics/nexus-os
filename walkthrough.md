# Login Flow Refactor Walkthrough

I have refactored the login flow to enforce Bling ERP connection and product synchronization.

## 🔄 New Flow
1.  **Login/Signup**: User logs in via NextAuth.
2.  **Middleware Check**:
    *   If user has **no Bling integration**, they are redirected to `/bling`.
    *   If user has integration but status is `SYNCING`, they are redirected to `/syncing`.
    *   If status is `COMPLETED` (or other), they go to `/dashboard`.
3.  **Bling Connection**:
    *   User clicks "Connect" on `/bling`.
    *   Redirects to Bling OAuth.
    *   **Callback**:
        *   Saves integration.
        *   Sets user `blingSyncStatus` to `SYNCING`.
        *   Triggers `bling/sync:user` event.
        *   Redirects to `/syncing`.
4.  **Syncing**:
    *   User sees "Importing products..." on `/syncing`.
    *   **Inngest Workflow** (`bling/sync:user`):
        *   Updates status to `SYNCING` (redundant but safe).
        *   Triggers `bling/sync:products`.
        *   Waits for `bling/sync:complete` (emitted by `generate-alerts` at the end of the chain).
        *   Updates status to `COMPLETED`.
    *   Client polls session; when `COMPLETED`, redirects to `/dashboard`.

## 🛠 Changes

### Database
- Added `BlingSyncStatus` enum (`IDLE`, `SYNCING`, `COMPLETED`, `FAILED`).
- Added `blingSyncStatus` field to `User` model.

### Codebase
- **`prisma/schema.prisma`**: Updated schema.
- **`src/types/next-auth.d.ts`**: Added types for session and token.
- **`src/lib/next-auth/index.ts`**: Populated new fields in session/token.
- **`src/middleware.ts`**: Implemented redirection logic.
- **`src/lib/inngest/handlers/bling/sync-user.ts`**: Updated to handle sync flow and status updates.
- **`src/app/api/integrations/bling/callback/route.ts`**: Updated to set initial `SYNCING` status and redirect.
- **`src/app/(private)/syncing/page.tsx`**: Created feedback page.

## ⚠️ Important Note
Ensure `BLING_INVITE_LINK` in your `.env` is configured with the callback URL:
`${NEXTAUTH_URL}/api/integrations/bling/callback`
