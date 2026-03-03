## 1. Stack

- **Runtime:** Node >= 20
- **Package Manager:** pnpm >= 10 (mandatory)
- **Framework:** Next.js 16 (App Router only)
- **UI:** Mantine v8 (only styling system allowed)
- **Forms:** React Hook Form + Zod
- **Data Fetching:** TanStack Query v5
- **Auth:** NextAuth (JWT strategy)
- **Database:** PostgreSQL + Prisma v7
- **Background Jobs:** Inngest
- **Payments:** Stripe
- **Logging:** Pino
- **Monitoring:** Sentry
- **Testing:** Vitest

---

## 2. Global Rules

1. Always use **pnpm**. Never use npm or yarn.
2. Never use raw SQL if a Prisma model exists.
3. All external input must be validated with **Zod**.
4. Critical business logic must run on the server.
5. Do not introduce abstractions without real usage.
6. Strict TypeScript only. Never use `any`.
7. Keep functions small, focused, and pure when possible.
8. Prefer named exports over default exports.

---

## 3. Architecture Rules

### Frontend

- Default to **React Server Components**.
- Add `"use client"` only when strictly necessary.
- Keep UI components presentational.
- Move business logic to services or server actions.
- Use React Query for client-side data fetching.
- Avoid unnecessary global state.
- Mantine is the only UI system. No Tailwind or custom CSS unless explicitly required.

---

### Backend (API Routes / Server Actions)

- Validate input with Zod before processing.
- Keep HTTP layer thin.
- Business logic must live in service modules.
- Always handle and return structured errors.
- Never trust frontend-provided values.

---

## 4. Database Rules

- All schema changes require Prisma migrations.
- Never modify the database manually.
- Run:

  ```bash
  pnpm prisma generate
  npx prisma migrate dev
  ```

- Use Prisma-generated types and enums only.
- Prevent N+1 queries.
- Encapsulate complex queries in dedicated modules.

---

## 5. Background Processing

- Long-running tasks must use **Inngest**.
- Never block HTTP requests with heavy computation.
- Keep event payloads minimal.
- Side effects (emails, syncs, async jobs) must not run inside request lifecycle if avoidable.

---

## 6. Payments

- Stripe is the source of truth for billing state.
- Always validate webhooks.
- Never rely only on client confirmation.
- Webhook handlers must be idempotent.

---

## 7. Code Quality Requirements

Before any commit or PR, run:

```bash
pnpm lint
pnpm typecheck
pnpm test
pnpm build
```

Zero errors allowed.

---

## 8. Security Rules

- Never expose secrets to the client.
- Validate permissions on the server.
- Sanitize all external input.
- Do not store sensitive tokens in logs.
- Use environment variables for secrets only.

---

## 9. Performance Guidelines

- Avoid unnecessary re-renders.
- Prefer server-side data fetching when possible.
- Cache queries appropriately.
- Avoid over-fetching.
- Keep API response payloads minimal.

---

## 10. Code Style

- Use descriptive variable names.
- Keep files small and modular.
- Comment only when explaining **why**, not **what**.
- Avoid magic numbers; extract constants.
- Maintain consistent naming conventions.
