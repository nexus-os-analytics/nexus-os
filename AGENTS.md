# Project Context & Agent Guidelines

## 1. Purpose
This document provides the required context, architecture, and execution rules for all agents contributing to the **NexusOS** codebase.
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

**Name:** NexusOS
**Version:** 2.0.0
**Framework:** Next.js 15+ (App Router, Turbopack)
**Type:** Full-Stack SaaS Platform with authentication, ERP integrations, background jobs, and dashboards.

## 4. Tech Stack

### Core
- **Next.js 15+** (App Router only)
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
- **Biome** as linter/formatter (replaces ESLint/Prettier)

### Dev Tools
- Husky + Commitlint
- Turbopack for dev and build
- TypeScript type checks
- Prisma migrations + deploy
- Seed scripts via tsx

## 5. Architecture

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
- `bling/` ERP
- `next-auth/` authentication
- `inngest/` job definitions
- `pino/` logging config

### `src/hooks/*`
Global client or server hooks (non-feature specific).

## 6. Engineering Rules (Critical)

### 6.1 Code Generation Flow
All agents must follow this sequence before generating code:
1. Fetch required documentation URLs (Mantine, Next.js, Prisma).
2. Produce a detailed step-by-step plan or pseudocode.
3. Only then generate final code.

### 6.2 React & Next.js Rules
- Prefer **React Server Components**.
- Only add `"use client"` when necessary.
- Use **Server Actions** preferentially for mutations.
- Avoid `useEffect` and client state unless required.
- Do not use Pages Router patterns — App Router only.

### 6.3 Mantine UI Rules
- Mantine is the **only** UI and styling system.
- Avoid Tailwind and raw CSS unless absolutely necessary.
- Use Mantine theme tokens, props, `sx`, `styles`, etc.
- Forms must use Mantine + React Hook Form + Zod.
- Any new component must comply with Mantine official patterns.

### 6.4 TypeScript Rules
- Always use TypeScript.
- Prefer `interface` over `type`.
- Avoid custom enums; use Prisma enums where applicable.
- Never duplicate Prisma types or enums.
- No `any`.
- Use `import type` for type-only imports.

### 6.5 Prisma & Database Rules
- Read Prisma docs before creating or modifying models.
- Schema: `prisma/schema.prisma`.
- After schema edits:
  - `npx prisma generate`
  - `npx prisma migrate dev`
- Always use Prisma Client enums and types.
- Never write raw SQL unless approved.

### 6.6 Logging & Debugging
- No `console.log`.
- Use Pino or structured error handling.

### 6.7 Code Quality (Biome)
- Biome enforces code style and linting.
- Commands:
  - `pnpm lint`
  - `pnpm format`

## 7. Git Workflow

- Uses **Conventional Commits**.
- Husky prevents invalid commits.
- Lint-staged applies Biome fixes on staged files.

## 8. Integrations

### Bling ERP
Located in:
- `src/lib/bling`
- `src/features/bling`

### Inngest
Background jobs in:
- `src/inngest`

### NextAuth
Configured in:
- `src/lib/next-auth`

## 9. Development Commands

```bash
pnpm dev        # Development server (Turbopack)
pnpm build      # Build for production
pnpm start      # Serve production build
pnpm lint       # Biome checks
pnpm format     # Biome formatting
pnpm typecheck  # TypeScript type checking
pnpm seed       # Run database seed
pnpm inngest:dev # Inngest local worker
````

## 10. Agent Expectations

Agents are expected to:

* Always consult documentation URLs BEFORE generating code.
* Produce correct, production-ready outputs without TODOs or placeholders.
* Respect architecture boundaries.
* Provide explicit file paths and directory structures.
* Avoid guessing when requirements are unclear; request clarification instead.
* Maintain strict type safety.

Failure to respect these constraints will result in invalid contributions.
