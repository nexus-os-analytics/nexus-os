# Project Context & Agent Guidelines

## 🚀 Project Overview
**Name**: NexusOS / Next.js Base
**Type**: SaaS Boilerplate / ERP Integration
**Description**: A robust Full-Stack Next.js 15 application designed for SaaS products, featuring built-in authentication, database management, background jobs, and ERP integrations (Bling).

## 🛠 Tech Stack
- **Framework**: Next.js 15 (App Router)
- **Language**: TypeScript (Strict Mode)
- **Package Manager**: pnpm (>=10)
- **UI Library**: Mantine UI v8
- **Styling**: PostCSS / Mantine Modules
- **Database**: PostgreSQL
- **ORM**: Prisma ORM
- **Auth**: NextAuth.js v4
- **State/Data**: TanStack React Query v5
- **Validation**: Zod + React Hook Form
- **Background Jobs**: Inngest
- **Linting/Formatting**: Biome
- **Logging**: Pino

## 📂 Architecture
The project follows a **Feature-Based Architecture** inside `src/features`.
- **`src/features/*`**: Contains domain-specific logic (components, hooks, utils).
- **`src/app/*`**: Next.js App Router pages (should be thin wrappers around feature components).
- **`src/components/*`**: Shared/Generic UI components (Atomic design).
- **`src/lib/*`**: Third-party integrations (Bling, Brevo, Inngest, Prisma).
- **`src/hooks/*`**: Global hooks.

## 📏 Coding Rules & Standards

### 1. Code Quality (Biome)
- **Linter/Formatter**: We use **Biome** instead of ESLint/Prettier.
- **Strict Rules**:
  - No `console.log` (Use `pino` logger or proper error handling).
  - No `any` types.
  - No CommonJS (`require`).
  - Always use `import type` for type-only imports.
- **Commands**:
  - `pnpm lint`: Check for issues.
  - `pnpm format`: Fix formatting.

### 2. Component Design
- Use **Mantine UI** components as the base.
- Prefer **Functional Components**.
- Use **Server Components** by default, add `'use client'` only when interactivity is needed.
- **Forms**: Use `react-hook-form` with `zod` resolvers (`mantine-form-zod-resolver` or standard resolvers).

### 3. Data Fetching
- **Server Side**: Use Prisma directly in Server Components or Server Actions.
- **Client Side**: Use **TanStack React Query** for data fetching and caching.
- **Mutations**: Use Server Actions or API routes via React Query mutations.

### 4. Database (Prisma)
- Schema is located at `prisma/schema.prisma`.
- Always run `npx prisma generate` after schema changes.
- Use `npx prisma migrate dev` for local migrations.

### 5. Git & Commits
- Follow **Conventional Commits** (e.g., `feat: add user profile`, `fix: login bug`).
- Husky hooks are enabled to enforce linting and commit message format.

## 📦 Key Libraries & Integrations
- **Bling ERP**: Integration logic in `src/lib/bling` and `src/features/bling`.
- **Inngest**: Background jobs defined in `src/inngest`.
- **NextAuth**: Configuration in `src/lib/next-auth`.

## 🚀 Development Commands
```bash
pnpm dev        # Start development server
pnpm build      # Build for production
pnpm start      # Start production server
pnpm lint       # Run Biome checks
pnpm format     # Run Biome formatting
pnpm typecheck  # Run TypeScript checks
```
