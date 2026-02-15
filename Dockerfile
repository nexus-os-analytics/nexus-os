FROM node:20-alpine AS deps
WORKDIR /app

RUN corepack enable && corepack prepare pnpm@10.27.0 --activate
COPY package.json pnpm-lock.yaml ./

RUN --mount=type=cache,id=pnpm,target=/root/.local/share/pnpm/store \
    pnpm install --frozen-lockfile --ignore-scripts

FROM node:20-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production
RUN corepack enable && corepack prepare pnpm@10.27.0 --activate

ARG DATABASE_URL=postgresql://user:password@db:5432/nexus_db?schema=public
ENV DATABASE_URL=$DATABASE_URL

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client without touching the database
RUN pnpm exec prisma generate

# Build Next.js with standalone output (configured in next.config.ts)
RUN --mount=type=cache,id=nextjs,target=/app/.next/cache \
    pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV HOST=0.0.0.0
ENV PORT=3000

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Copy the minimal standalone server, static assets and public files
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

# Ensure Next.js cache directory exists and is writable by the runtime user
RUN mkdir -p /app/.next/cache && chown -R nextjs:nodejs /app

USER 1001
EXPOSE 3000

# Next.js standalone server entry
ENTRYPOINT ["sh", "-c", "HOSTNAME=0.0.0.0 PORT=3000 node server.js"]
