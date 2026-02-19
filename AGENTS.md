# Project Context & Agent Guidelines

## 1. Purpose
This document provides the required context, architecture, and execution rules for all agents contributing to the **Nexus OS** codebase.
Agents must follow these guidelines rigorously to ensure consistency, maintainability, and correctness across the project.

Before producing or modifying any code, components, database models, or architecture, agents must always follow the documentation sources and rules listed below.

## 2. Mandatory Documentation Sources (Always Fetch First)

### UI & Components (Mantine)
Before generating, modifying, or suggesting **any UI code**, always fetch:
- **https://mantine.dev/llms.txt**

### Next.js Architecture & APIs
Before working with routing, layouts, server components, client components, caching, data fetching, or actions:
- **https://nextjs.org/docs/llms-full.txt**

### Database Models & Prisma Client
Before touching Prisma schema, migrations, or database access layers:
- **https://www.prisma.io/docs/llms.txt**

These URLs override any outdated assumptions or cached knowledge and must be consulted first.

## 3. Project Overview

**Name:** Nexus OS
**Version:** 2.0.0
**Framework:** Next.js 16+ (App Router, Turbopack)
**Type:** Full-Stack SaaS Platform with authentication, ERP integrations, background jobs, and dashboards.

## 4. Tech Stack

### Core
- **Next.js 16+** (App Router only)
- **React 19**
- **TypeScript (strict mode)**
- **pnpm** (required by the project, enforced via `preinstall`)
- **Mantine UI v8** for all styling and components
- **PostgreSQL** + **Prisma ORM**
- **NextAuth.js v4** for authentication
- **TanStack React Query v5** for client data fetching
- **Zod** + **React Hook Form** for validation and forms
- **Inngest** for background jobs
- **Pino** for logging
- **Stripe** for payments and subscriptions
- **Brevo** for transactional email
- **Sentry** for error monitoring (Next.js SDK)
- **ESLint** + **Prettier** for linting and code formatting

### Dev Tools
- Husky + Commitlint
- Turbopack for dev and build
- TypeScript type checks
- Prisma migrations + deploy
- Seed scripts via tsx

## 5. Development Commands & Testing

### Build & Development
```bash
pnpm dev              # Development server (Turbopack)
pnpm build            # Build for production
pnpm start            # Serve production build
pnpm typecheck        # TypeScript type checking
pnpm lint             # ESLint linting checks
pnpm lint:fix         # ESLint auto-fix issues
pnpm format           # Prettier code formatting
pnpm format:check     # Check code formatting without changes
pnpm seed             # Run database seed
pnpm inngest:dev      # Inngest local worker
```

### Testing Commands
**Note:** Vitest is available for unit tests; Playwright for E2E is planned. Testing is not yet fully implemented across the codebase.
```bash
# Planned testing commands (when implemented)
pnpm test             # Run all tests
pnpm test:unit        # Run unit tests only
pnpm test:e2e         # Run E2E tests with Playwright
pnpm test:coverage    # Generate test coverage report
```

### Running a Single Test
```bash
# For individual test files (when implemented):
npx playwright test tests/auth/login.spec.ts    # Single E2E test
npx playwright test --grep "login"              # Tests containing "login"
```

### Database & Migrations
```bash
npx prisma generate      # Generate Prisma client
npx prisma migrate dev   # Create and apply migration in development
npx prisma db push       # Push schema changes to database
npx prisma studio        # Open Prisma Studio for database inspection
```

## 6. Code Style Guidelines

### TypeScript & Type Safety
- **Strict TypeScript**: Always use TypeScript with strict mode enabled
- **Interface over Type**: Prefer `interface` for object shapes, use `type` only for unions/aliases
- **No `any`**: Never use `any` type - use proper typing or `unknown` if necessary
- **Import Type**: Use `import type` for type-only imports to optimize bundling
- **Prisma Types**: Always use Prisma-generated types and enums, never duplicate them
- **Optional Chaining**: Use `?.` operator for safe property access
- **Nullish Coalescing**: Use `??` operator instead of `||` for default values

### Naming Conventions
- **Files**: kebab-case for directories (`user-settings/`), PascalCase for components (`UserProfile.tsx`)
- **Variables**: camelCase (`userName`, `isLoading`)
- **Functions**: camelCase (`handleSubmit`, `validateEmail`)
- **Constants**: UPPER_SNAKE_CASE (`API_BASE_URL`, `DEFAULT_TIMEOUT`)
- **Types/Interfaces**: PascalCase (`UserProfile`, `ApiResponse<T>`)
- **Enums**: PascalCase (`UserRole`, `OrderStatus`)
- **Directories**: kebab-case (`auth-services/`, `user-management/`)

### React & Next.js Patterns
- **Server Components First**: Prefer React Server Components, add `"use client"` only when necessary
- **Server Actions**: Use Server Actions for mutations instead of API routes when possible
- **App Router Only**: Never use Pages Router patterns
- **Component Structure**: Functional components with typed props interfaces
- **Hooks**: Custom hooks for shared logic, follow `use*` naming convention
- **Avoid useEffect**: Minimize `useEffect` usage, prefer server components when possible

### Mantine UI Patterns
- **Single UI System**: Mantine is the only styling system - no Tailwind, CSS modules, or raw CSS
- **Theme Tokens**: Always use Mantine theme tokens (`theme.colors`, `theme.spacing`, etc.)
- **sx Prop**: Use `sx` prop for component-specific styles
- **Forms**: Always use Mantine forms with React Hook Form + Zod validation
- **Component Props**: Follow Mantine component API patterns exactly

### Imports & File Organization
- **Absolute Imports**: Use `@/*` path aliases for all internal imports
- **Import Groups**: Group imports by: external libraries, internal modules, types, then relative imports
- **Barrel Exports**: Use `index.ts` files for clean imports from feature directories
- **Feature Structure**: Follow feature-based architecture with clear separation of concerns

### Error Handling & Logging
- **No console.log**: Never use `console.log` in production code
- **Structured Logging**: Use Pino for all logging with structured data
- **Error Boundaries**: Implement proper error boundaries for React components
- **API Error Handling**: Consistent error response patterns across API routes
- **Validation Errors**: Use Zod schemas for input validation with clear error messages

### Code Quality & Formatting
- **ESLint Configuration**: Follow ESLint rules (configured in `eslint.config.mjs`)
  - TypeScript ESLint for type-aware linting
  - React and React Hooks rules
  - Next.js specific rules via `eslint-config-next`
  - Flat config format (modern ESLint 9+ standard)
- **Prettier Configuration**: Code formatting (configured in `.prettierrc`)
  - 2-space indentation
  - Single quotes for strings (double quotes for JSX)
  - Semicolons always
  - Trailing commas (ES5 style)
  - 100 character line width
  - LF line endings
- **Magic Numbers**: Avoid magic numbers, extract to named constants
- **Large Functions**: Break down functions >50 lines into smaller, focused functions
- **Comments**: Add comments for complex business logic, avoid obvious comments
- **DRY Principle**: Eliminate code duplication through shared utilities

## 7. Architecture

The project follows a **Feature-Based Architecture** under `src/features`.

### `src/app/*`
Next.js App Router: routes, layouts, pages.
Pages must remain thin — logic stays in features.

### `src/features/*`
Domain-driven feature modules, each containing:
- UI components
- Hooks
- Domain logic
- Schema/validators
- Server actions

### `src/components/*`
Shared cross-feature UI components.

### `src/lib/*`
Integrations and global utilities:
- `prisma/` ORM client + seed
- `bling/` ERP integration
- `next-auth/` authentication
- `stripe/` checkout, portal, webhook handlers
- `brevo/` email templates and sending
- `inngest/` client, server, and job handlers
- `pino/` logging config
- `routes/` route constants and helpers (`isPrivateRoute`, `canAccessRoute`)

### `src/hooks/*`
Global client or server hooks (non-feature specific).

### `src/providers/*`
Root providers: SessionProvider, QueryClientProvider, AuthProvider, MantineProvider, ModalsProvider, Notifications. Wrapped in `src/providers/index.tsx`.

---

## 7.1 Routing & Access Control

The app uses **Next.js route groups** to separate public, auth, and private areas:

| Group    | Segment   | Layout        | Purpose |
|----------|-----------|---------------|---------|
| **Public**  | `(public)`  | `PublicLayout`  | Home `/`, preços, termos, política, manual |
| **Auth**    | `(auth)`    | `AuthLayout`    | Login, cadastre-se, esqueci/resetar/alterar senha |
| **Private** | `(private)` | `AdminLayout`   | Dashboard, campanhas, Bling, usuários, minha-conta, produto, pagamento |

- **Route definitions**: `src/lib/routes/routes.constants.ts` (`PRIVATE_ROUTES`, `AUTH_ROUTES`, `PUBLIC_ROUTES`). Private routes can declare `permissions` (e.g. `campaign.read`, `users.write`).
- **Auth redirects**: `src/proxy.ts` implements the auth middleware logic (JWT via `getToken`, redirect to login for unauthenticated private access, redirect to `/bling` for authenticated users on auth routes, `/sem-permissao` when role lacks permission). For redirects to run, the Next.js middleware file (`middleware.ts` at project or `src` root) must export this logic as the default handler (e.g. `export { proxy as default } from '@/proxy'` or equivalent) and use the same `config.matcher` if needed.
- **Permission checks**: Use `useAuth().hasPermission(permission)` and `AuthGuard` (with optional `roles`) for UI; `canAccessRoute(role, pathname)` in `src/lib/routes/routes.utils.ts` for server/edge logic.

---

## 7.2 Authentication & Session

- **NextAuth.js v4** with JWT strategy; Prisma adapter for User/Account/Session (`src/lib/next-auth/`).
- **Providers**: Credentials (email/password, optional 2FA via otplib) and Google OAuth.
- **Auth state**: `AuthProvider` and `useAuth()` expose `user`, `status`, `required2FA`, `signOut`, `update`, `hasPermission`. Session is refreshed by SessionProvider (`refetchInterval={3600}`).
- **Role-based access**: Permissions map to roles in `src/features/auth/services`; use `getPermissions(permission)` and `hasPermission` for consistent checks.

---

## 7.3 Request Flow (High Level)

1. **Request** → Next.js; if middleware is enabled and uses `proxy`, it runs JWT check and route-based redirects.
2. **Root layout** → `Providers` (Session → QueryClient → Auth → Mantine → Modals → Notifications).
3. **Route group layout** → `PublicLayout`, `AuthLayout`, or `AdminLayout` (private: header, nav, `UpgradeBanner`).
4. **Page** → Thin Server Component that renders a feature component (e.g. `Dashboard`, `CampaignDashboard`). Client interactivity uses `useAuth`, React Query, and Server Actions or API routes.
5. **Mutations** → Server Actions or API routes → Prisma and/or external APIs (Stripe, Bling). Async side effects (emails, syncs) are offloaded to **Inngest**.

---

## 8. Engineering Rules (Critical)

### 8.1 Code Generation Flow
All agents must follow this sequence before generating code:
1. Fetch required documentation URLs (Mantine, Next.js, Prisma).
2. Produce a detailed step-by-step plan or pseudocode.
3. Only then generate final code.

### 8.2 React & Next.js Rules
- Prefer **React Server Components**.
- Only add `"use client"` when necessary.
- Use **Server Actions** preferentially for mutations.
- Avoid `useEffect` and client state unless required.
- Do not use Pages Router patterns — App Router only.

### 8.3 Mantine UI Rules
- Mantine is the **only** UI and styling system.
- Do not use Tailwind and raw CSS unless absolutely necessary.
- Always use Mantine theme tokens, props, `sx`, `styles`, etc.
- Forms must use Mantine + React Hook Form + Zod.
- Any new component must comply with Mantine official patterns.

### 8.4 TypeScript Rules
- Always use TypeScript.
- Prefer `interface` over `type`.
- Avoid custom enums; use Prisma enums where applicable.
- Never duplicate Prisma types or enums.
- No `any`.
- Use `import type` for type-only imports.

### 8.5 Prisma & Database Rules
- Read Prisma docs before creating or modifying models.
- Schema: `prisma/schema.prisma`.
- After schema edits:
  - `npx prisma generate`
  - `npx prisma migrate dev`
- Always use Prisma Client enums and types.
- Never write raw SQL unless approved.

### 8.6 Logging & Debugging
- No `console.log`.
- Use Pino or structured error handling.

### 8.7 Code Quality (ESLint & Prettier)
- ESLint enforces code quality and best practices.
- Prettier enforces consistent code formatting.
- Commands:
  - `pnpm lint` - Check for linting errors
  - `pnpm lint:fix` - Auto-fix linting issues
  - `pnpm format` - Format all files
  - `pnpm format:check` - Check formatting without changes

## 9. Git Workflow

- Uses **Conventional Commits**.
- Husky prevents invalid commits.
- Lint-staged applies ESLint fixes and Prettier formatting on staged files.

## 10. Integrations

### NextAuth
- **Config**: `src/lib/next-auth/index.ts` (authOptions, providers, callbacks)
- **Adapter**: `src/lib/next-auth/adapter.ts` (Prisma adapter)
- **Types**: `src/types/next-auth.d.ts` for session/user extensions

### Stripe (Billing)
- **API routes**: `src/app/api/stripe/` — checkout, checkout-anon, portal, webhook
- **Webhook handlers**: `src/lib/stripe/webhook-handlers/` — checkout-session-completed, subscription-*, invoice-*, payment-intent-failed. Use shared helpers in `helpers.ts` and types in `types.ts`.
- **Billing actions**: `src/features/billing/actions/` (e.g. create-checkout-session)
- **Inngest**: Billing-related jobs (e.g. send-payment-confirmation-email) are registered in `src/lib/inngest/handlers/billing/`.

### Bling ERP
- **Client & data**: `src/lib/bling/` — API client, types, adapters, repository, utils
- **Feature UI & actions**: `src/features/bling/` — settings UI, `saveUserSettings` and other actions
- **Inngest**: Bling sync and alert jobs in `src/lib/inngest/handlers/bling/` (sync-products, scheduled-sync, notify-critical-alert, etc.)

### Inngest
- **Entry**: `src/app/api/inngest/route.ts` (GET, POST, PUT from `src/lib/inngest/server.ts`)
- **Server & functions**: `src/lib/inngest/server.ts` — registers all handlers (billing + bling)
- **Handlers**: `src/lib/inngest/handlers/` — billing and bling subfolders
- **Local dev**: Run `pnpm inngest:dev` with the app at `http://localhost:3000`

### Brevo (Email)
- **Config & sending**: `src/lib/brevo/` — templates (e.g. payment-failed, subscription-trial-ending) and sending logic

---

## 11. Best Practices for Development

### Where to Put New Code
- **New domain logic or screens** → `src/features/<feature-name>/` (components, pages, actions, schemas, services, types).
- **Shared UI used by multiple features** → `src/components/` (e.g. layout, commons).
- **New API client, auth config, or app-wide util** → `src/lib/<domain>/`.
- **New global hook** (not feature-specific) → `src/hooks/`.
- **New route or layout** → `src/app/` under the correct group: `(public)`, `(auth)`, or `(private)`.

### Auth & Permissions
- Use **`useAuth()`** for current user, status, and **`hasPermission(permission)`**; wrap role-sensitive UI in **`AuthGuard`** when needed.
- For new private routes, add the route and permissions in **`src/lib/routes/routes.constants.ts`** and ensure **`canAccessRoute`** in `routes.utils.ts` aligns with `getPermissions` in auth services.
- Do not duplicate role or permission checks; use the central permission helpers.

### Data & Mutations
- Prefer **Server Components** for initial data; use **Server Actions** for mutations from forms or buttons when possible.
- Use **React Query** for client-side fetching and cache; keep stale time and keys consistent (see `QUERY_STALE_TIME` in `src/lib/constants`).
- Always use **Prisma-generated types and enums**; never redefine them in the app.

### Forms & Validation
- Use **Mantine** form components with **React Hook Form** and **Zod** (and `@hookform/resolvers` / mantine-form-zod-resolver where applicable).
- Define Zod schemas in the feature (e.g. `src/features/<feature>/schemas/`) and reuse for Server Actions and API validation.

### Background Work
- Put long-running or async side effects (emails, external API syncs) in **Inngest** functions under `src/lib/inngest/handlers/`, and register them in `src/lib/inngest/server.ts`.
- Prefer event-driven triggers or cron; avoid blocking the request with heavy work.

### Before Committing
- Run **`pnpm typecheck`** and **`pnpm lint`** (and **`pnpm format`** or **`pnpm format:check`** if needed).
- Ensure no **`console.log`** or **`any`**; use Pino for logging and proper types.
- Verify new or changed routes are under the correct layout and, if private, listed in route constants with correct permissions.

---

## 12. Copilot Instructions

You are an experienced engineer specializing in TypeScript, Node.js, React, Next.js 16+ (App Router), and Mantine UI. Always use current and stable versions of these technologies.

### Source-of-Truth Documentation
Before creating or modifying any component, hook, layout, or UI logic:
- Always check the latest Mantine documentation at: **https://mantine.dev/llms.txt**
- Always consult: **https://nextjs.org/docs/llms-full.txt** for Next.js related code
- Always check: **https://www.prisma.io/docs/llms.txt** for database operations

### Development Approach
1. Begin with a detailed step-by-step plan written in pseudocode or structured outline.
2. If the user is requesting final production code, execute the plan directly.
3. All output must be correct, complete, functional, secure, and maintainable.
4. Explicitly specify directory structures, file names, and all imports/exports.
5. Avoid unnecessary imports or boilerplate.
6. Never rely on outdated patterns such as the Next.js Pages Router.

### Naming Conventions
- Directories use lowercase kebab-case (e.g., `components/auth-wizard`).
- Favor named exports over default exports.
- Never redefine or duplicate enums or types that already exist in Prisma Client.

### Mantine UI Guidelines
- Use Mantine UI (`@mantine/core`, `@mantine/hooks`, etc.) for all UI primitives and styling.
- Do not use fixed colors, spacing, or typography values.
- Use `sx`, `styles`, `classNames`, or `unstyled` APIs following official guidance.
- Respect Mantine’s responsive system, theme tokens, and customization patterns.

## 13. Agent Expectations
Agents are expected to:

* Always consult documentation URLs BEFORE generating code.
* Produce correct, production-ready outputs without TODOs or placeholders.
* Respect architecture boundaries.
* Provide explicit file paths and directory structures.
* Avoid guessing when requirements are unclear; request clarification instead.
* Maintain strict type safety.
* Follow all code style guidelines and naming conventions.
* Run `pnpm lint` and `pnpm typecheck` after any code changes.
* Use the routing, auth, and integration details in §7.1–7.3 and §10 when adding or changing routes, auth, or third-party integrations.

Failure to respect these constraints will result in invalid contributions.
