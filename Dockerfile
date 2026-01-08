# syntax=docker/dockerfile:1

FROM node:20-alpine AS deps
WORKDIR /app
# Use pnpm via Corepack (project enforces pnpm)
RUN corepack enable && corepack prepare pnpm@10.27.0 --activate

# Only copy manifests for efficient caching
COPY package.json pnpm-lock.yaml ./

# Install production deps without running install scripts (postinstall runs prisma migrations/seeds)
RUN pnpm install --frozen-lockfile --ignore-scripts

FROM node:20-alpine AS builder
WORKDIR /app
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
RUN corepack enable && corepack prepare pnpm@10.27.0 --activate

COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Generate Prisma Client without touching the database
RUN pnpm exec prisma generate

# Build Next.js with standalone output (configured in next.config.ts)
RUN pnpm build

FROM node:20-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production
ENV PORT=3000

# Create non-root user for security
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Copy the minimal standalone server, static assets and public files
COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public

USER 1001
EXPOSE 3000

# Next.js standalone server entry
CMD ["node", "server.js"]
