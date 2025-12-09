-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('SUPER_ADMIN', 'ADMIN', 'USER', 'GUEST');

-- CreateEnum
CREATE TYPE "BlingAlertType" AS ENUM ('FINE', 'RUPTURE', 'DEAD_STOCK', 'OPPORTUNITY');

-- CreateEnum
CREATE TYPE "BlingRuptureRisk" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "BlingSyncStatus" AS ENUM ('IDLE', 'SYNCING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "BlingJobSyncType" AS ENUM ('SALES', 'FULL');

-- CreateEnum
CREATE TYPE "BlingJobStatus" AS ENUM ('RUNNING', 'FAILED', 'DONE');

-- CreateTable
CREATE TABLE "users" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "hashedPassword" TEXT,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "image" TEXT,
    "phone" TEXT,
    "acceptedTerms" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "deletedAt" TIMESTAMP(3),
    "retentionUntil" TIMESTAMP(3),
    "twoFactorSecret" TEXT,
    "resetToken" TEXT,
    "resetTokenExpiry" TIMESTAMP(3),
    "isTwoFactorEnabled" BOOLEAN NOT NULL DEFAULT false,
    "failedAttempts" INTEGER NOT NULL DEFAULT 0,
    "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false,
    "lockedUntil" TIMESTAMP(3),
    "emailVerified" TIMESTAMP(3),
    "blingSyncStatus" "BlingSyncStatus" NOT NULL DEFAULT 'IDLE',

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "accounts" (
    "id" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "provider" TEXT NOT NULL,
    "provider_account_id" TEXT NOT NULL,
    "refresh_token" TEXT,
    "access_token" TEXT,
    "expires_at" INTEGER,
    "token_type" TEXT,
    "scope" TEXT,
    "id_token" TEXT,
    "session_state" TEXT,

    CONSTRAINT "accounts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "user_invitations" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "role" "UserRole" NOT NULL DEFAULT 'USER',
    "invitedByUserId" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "consumedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "user_invitations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "sessions" (
    "id" TEXT NOT NULL,
    "session_token" TEXT NOT NULL,
    "user_id" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "sessions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "verification_tokens" (
    "identifier" TEXT NOT NULL,
    "token" TEXT NOT NULL,
    "expires" TIMESTAMP(3) NOT NULL
);

-- CreateTable
CREATE TABLE "audit_logs" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "action" TEXT NOT NULL,
    "resource" TEXT NOT NULL,
    "payload" JSONB,
    "metadata" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "audit_logs_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "security_incidents" (
    "id" TEXT NOT NULL,
    "userId" TEXT,
    "type" TEXT NOT NULL,
    "details" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "security_incidents_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "login_activities" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "successful" BOOLEAN NOT NULL,
    "ip" TEXT NOT NULL,
    "device" TEXT,
    "geo" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "login_activities_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "api_keys" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "key" TEXT NOT NULL,
    "scopes" TEXT[],
    "expiresAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "revoked" BOOLEAN NOT NULL DEFAULT false,

    CONSTRAINT "api_keys_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "data_registries" (
    "id" TEXT NOT NULL,
    "location" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "data_registries_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bling_integrations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "tokenType" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bling_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bling_products" (
    "id" TEXT NOT NULL,
    "blingProductId" TEXT NOT NULL,
    "blingCategoryId" TEXT,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "costPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "salePrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currentStock" INTEGER NOT NULL DEFAULT 0,
    "image" TEXT,
    "shortDescription" TEXT,
    "integrationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bling_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bling_product_settings" (
    "id" TEXT NOT NULL,
    "blingProductId" TEXT NOT NULL,
    "leadTimeDays" INTEGER NOT NULL DEFAULT 15,
    "safetyDays" INTEGER NOT NULL DEFAULT 5,
    "recoveryTarget" DOUBLE PRECISION NOT NULL DEFAULT 0.8,
    "opportunityGrowthThreshold" DOUBLE PRECISION NOT NULL DEFAULT 0.3,
    "liquidationIdleThresholdDays" INTEGER NOT NULL DEFAULT 30,
    "liquidationMaxDays" INTEGER NOT NULL DEFAULT 30,
    "minSalesForOpportunity" INTEGER NOT NULL DEFAULT 3,
    "newProductMinDays" INTEGER NOT NULL DEFAULT 30,
    "minHistoryDaysForDecision" INTEGER NOT NULL DEFAULT 7,

    CONSTRAINT "bling_product_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bling_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "blingCategoryId" TEXT NOT NULL,
    "blingParentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bling_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bling_sales_history" (
    "id" TEXT NOT NULL,
    "blingSaleId" TEXT NOT NULL,
    "blingProductId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "totalValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bling_sales_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bling_stock_balance" (
    "id" TEXT NOT NULL,
    "blingProductId" TEXT NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bling_stock_balance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bling_alerts" (
    "id" TEXT NOT NULL,
    "blingProductId" TEXT NOT NULL,
    "type" "BlingAlertType" NOT NULL DEFAULT 'FINE',
    "risk" "BlingRuptureRisk" NOT NULL DEFAULT 'LOW',
    "vvdReal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vvd30" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vvd7" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "daysRemaining" INTEGER NOT NULL DEFAULT 0,
    "reorderPoint" INTEGER NOT NULL DEFAULT 0,
    "growthTrend" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "capitalStuck" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "daysSinceLastSale" INTEGER NOT NULL DEFAULT 0,
    "suggestedPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estimatedDeadline" INTEGER NOT NULL DEFAULT 0,
    "recoverableAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "daysOutOfStock" INTEGER NOT NULL DEFAULT 0,
    "estimatedLostSales" INTEGER NOT NULL DEFAULT 0,
    "estimatedLostAmount" INTEGER NOT NULL DEFAULT 0,
    "message" TEXT,
    "recommendations" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "jobId" TEXT,

    CONSTRAINT "bling_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bling_sync_jobs" (
    "id" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "BlingJobSyncType" NOT NULL,
    "totalBatches" INTEGER NOT NULL,
    "processedBatches" INTEGER NOT NULL DEFAULT 0,
    "status" "BlingJobStatus" NOT NULL DEFAULT 'RUNNING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bling_sync_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_createdAt_deletedAt_idx" ON "users"("email", "createdAt", "deletedAt");

-- CreateIndex
CREATE UNIQUE INDEX "accounts_provider_provider_account_id_key" ON "accounts"("provider", "provider_account_id");

-- CreateIndex
CREATE UNIQUE INDEX "user_invitations_token_key" ON "user_invitations"("token");

-- CreateIndex
CREATE INDEX "user_invitations_email_token_expiresAt_consumedAt_idx" ON "user_invitations"("email", "token", "expiresAt", "consumedAt");

-- CreateIndex
CREATE UNIQUE INDEX "sessions_session_token_key" ON "sessions"("session_token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_token_key" ON "verification_tokens"("token");

-- CreateIndex
CREATE UNIQUE INDEX "verification_tokens_identifier_token_key" ON "verification_tokens"("identifier", "token");

-- CreateIndex
CREATE INDEX "audit_logs_userId_createdAt_idx" ON "audit_logs"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "security_incidents_userId_createdAt_idx" ON "security_incidents"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "login_activities_userId_createdAt_idx" ON "login_activities"("userId", "createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "api_keys_key_key" ON "api_keys"("key");

-- CreateIndex
CREATE INDEX "api_keys_key_userId_createdAt_idx" ON "api_keys"("key", "userId", "createdAt");

-- CreateIndex
CREATE INDEX "data_registries_createdAt_idx" ON "data_registries"("createdAt");

-- CreateIndex
CREATE UNIQUE INDEX "bling_integrations_userId_key" ON "bling_integrations"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "bling_products_blingProductId_key" ON "bling_products"("blingProductId");

-- CreateIndex
CREATE INDEX "bling_products_blingProductId_integrationId_idx" ON "bling_products"("blingProductId", "integrationId");

-- CreateIndex
CREATE UNIQUE INDEX "bling_product_settings_blingProductId_key" ON "bling_product_settings"("blingProductId");

-- CreateIndex
CREATE UNIQUE INDEX "bling_categories_blingCategoryId_key" ON "bling_categories"("blingCategoryId");

-- CreateIndex
CREATE INDEX "bling_sales_history_blingProductId_blingSaleId_date_idx" ON "bling_sales_history"("blingProductId", "blingSaleId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "bling_sales_history_blingSaleId_blingProductId_key" ON "bling_sales_history"("blingSaleId", "blingProductId");

-- CreateIndex
CREATE INDEX "bling_stock_balance_blingProductId_idx" ON "bling_stock_balance"("blingProductId");

-- CreateIndex
CREATE UNIQUE INDEX "bling_alerts_blingProductId_key" ON "bling_alerts"("blingProductId");

-- CreateIndex
CREATE INDEX "bling_alerts_blingProductId_type_risk_idx" ON "bling_alerts"("blingProductId", "type", "risk");

-- CreateIndex
CREATE INDEX "bling_sync_jobs_integrationId_status_createdAt_idx" ON "bling_sync_jobs"("integrationId", "status", "createdAt");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "user_invitations" ADD CONSTRAINT "user_invitations_invitedByUserId_fkey" FOREIGN KEY ("invitedByUserId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "sessions" ADD CONSTRAINT "sessions_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "audit_logs" ADD CONSTRAINT "audit_logs_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "security_incidents" ADD CONSTRAINT "security_incidents_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "login_activities" ADD CONSTRAINT "login_activities_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "api_keys" ADD CONSTRAINT "api_keys_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bling_integrations" ADD CONSTRAINT "bling_integrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bling_products" ADD CONSTRAINT "bling_products_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "bling_integrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bling_products" ADD CONSTRAINT "bling_products_blingCategoryId_fkey" FOREIGN KEY ("blingCategoryId") REFERENCES "bling_categories"("blingCategoryId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bling_product_settings" ADD CONSTRAINT "bling_product_settings_blingProductId_fkey" FOREIGN KEY ("blingProductId") REFERENCES "bling_products"("blingProductId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bling_sales_history" ADD CONSTRAINT "bling_sales_history_blingProductId_fkey" FOREIGN KEY ("blingProductId") REFERENCES "bling_products"("blingProductId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bling_stock_balance" ADD CONSTRAINT "bling_stock_balance_blingProductId_fkey" FOREIGN KEY ("blingProductId") REFERENCES "bling_products"("blingProductId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bling_alerts" ADD CONSTRAINT "bling_alerts_blingProductId_fkey" FOREIGN KEY ("blingProductId") REFERENCES "bling_products"("blingProductId") ON DELETE CASCADE ON UPDATE CASCADE;
