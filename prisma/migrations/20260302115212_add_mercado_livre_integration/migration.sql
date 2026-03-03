-- CreateEnum
CREATE TYPE "IntegrationProvider" AS ENUM ('BLING', 'MERCADO_LIVRE');

-- CreateEnum
CREATE TYPE "MeliSyncStatus" AS ENUM ('IDLE', 'SYNCING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "MeliAlertType" AS ENUM ('FINE', 'RUPTURE', 'DEAD_STOCK', 'OPPORTUNITY', 'LIQUIDATION');

-- CreateEnum
CREATE TYPE "MeliRuptureRisk" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "MeliJobSyncType" AS ENUM ('ORDERS', 'FULL');

-- CreateEnum
CREATE TYPE "MeliJobStatus" AS ENUM ('RUNNING', 'FAILED', 'DONE');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "activeIntegrationProvider" "IntegrationProvider",
ADD COLUMN     "meliSyncStatus" "MeliSyncStatus" NOT NULL DEFAULT 'IDLE';

-- CreateTable
CREATE TABLE "meli_integrations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "meliUserId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "tokenType" TEXT NOT NULL,
    "scope" TEXT NOT NULL,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meli_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meli_products" (
    "id" TEXT NOT NULL,
    "meliItemId" TEXT NOT NULL,
    "meliCategoryId" TEXT,
    "title" TEXT NOT NULL,
    "sku" TEXT,
    "costPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "salePrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currentStock" INTEGER NOT NULL DEFAULT 0,
    "thumbnail" TEXT,
    "permalink" TEXT,
    "listingType" TEXT,
    "status" TEXT,
    "integrationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meli_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meli_product_settings" (
    "id" TEXT NOT NULL,
    "meliItemId" TEXT NOT NULL,
    "leadTimeDays" INTEGER NOT NULL DEFAULT 15,
    "safetyDays" INTEGER NOT NULL DEFAULT 5,
    "criticalDaysRemainingThreshold" INTEGER NOT NULL DEFAULT 7,
    "highDaysRemainingThreshold" INTEGER NOT NULL DEFAULT 15,
    "mediumDaysRemainingThreshold" INTEGER NOT NULL DEFAULT 30,
    "opportunityGrowthThresholdPct" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "opportunityDemandVvd" DOUBLE PRECISION NOT NULL DEFAULT 1,
    "deadStockCapitalThreshold" DOUBLE PRECISION NOT NULL DEFAULT 5000,
    "capitalOptimizationThreshold" DOUBLE PRECISION NOT NULL DEFAULT 10000,
    "ruptureCapitalThreshold" DOUBLE PRECISION NOT NULL DEFAULT 5000,
    "liquidationDiscount" DOUBLE PRECISION NOT NULL DEFAULT 0.3,
    "costFactor" DOUBLE PRECISION NOT NULL DEFAULT 0.8,
    "liquidationExcessCapitalThreshold" DOUBLE PRECISION NOT NULL DEFAULT 2000,
    "fineExcessCapitalMax" DOUBLE PRECISION NOT NULL DEFAULT 5000,

    CONSTRAINT "meli_product_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meli_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "meliCategoryId" TEXT NOT NULL,
    "meliParentId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meli_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meli_order_history" (
    "id" TEXT NOT NULL,
    "meliOrderId" TEXT NOT NULL,
    "meliItemId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "totalValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meli_order_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meli_stock_balance" (
    "id" TEXT NOT NULL,
    "meliItemId" TEXT NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meli_stock_balance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meli_alerts" (
    "id" TEXT NOT NULL,
    "meliItemId" TEXT NOT NULL,
    "type" "MeliAlertType" NOT NULL DEFAULT 'FINE',
    "risk" "MeliRuptureRisk" NOT NULL DEFAULT 'LOW',
    "vvdReal" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vvd30" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "vvd7" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "daysRemaining" INTEGER NOT NULL DEFAULT 0,
    "reorderPoint" INTEGER NOT NULL DEFAULT 0,
    "growthTrend" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "capitalStuck" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "daysSinceLastSale" INTEGER NOT NULL DEFAULT 0,
    "suggestedPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "discount" INTEGER NOT NULL DEFAULT 0,
    "discountAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "estimatedDeadline" INTEGER NOT NULL DEFAULT 0,
    "recoverableAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "daysOutOfStock" INTEGER NOT NULL DEFAULT 0,
    "estimatedLostSales" INTEGER NOT NULL DEFAULT 0,
    "estimatedLostAmount" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "idealStock" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "excessUnits" INTEGER NOT NULL DEFAULT 0,
    "excessPercentage" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "excessCapital" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "message" TEXT,
    "recommendations" JSONB,
    "lastCriticalNotifiedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "jobId" TEXT,

    CONSTRAINT "meli_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "meli_sync_jobs" (
    "id" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "MeliJobSyncType" NOT NULL,
    "totalBatches" INTEGER NOT NULL,
    "processedBatches" INTEGER NOT NULL DEFAULT 0,
    "status" "MeliJobStatus" NOT NULL DEFAULT 'RUNNING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "meli_sync_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "meli_integrations_userId_key" ON "meli_integrations"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "meli_products_meliItemId_key" ON "meli_products"("meliItemId");

-- CreateIndex
CREATE INDEX "meli_products_meliItemId_integrationId_idx" ON "meli_products"("meliItemId", "integrationId");

-- CreateIndex
CREATE UNIQUE INDEX "meli_product_settings_meliItemId_key" ON "meli_product_settings"("meliItemId");

-- CreateIndex
CREATE UNIQUE INDEX "meli_categories_meliCategoryId_key" ON "meli_categories"("meliCategoryId");

-- CreateIndex
CREATE INDEX "meli_order_history_meliItemId_meliOrderId_date_idx" ON "meli_order_history"("meliItemId", "meliOrderId", "date");

-- CreateIndex
CREATE UNIQUE INDEX "meli_order_history_meliOrderId_meliItemId_key" ON "meli_order_history"("meliOrderId", "meliItemId");

-- CreateIndex
CREATE INDEX "meli_stock_balance_meliItemId_idx" ON "meli_stock_balance"("meliItemId");

-- CreateIndex
CREATE UNIQUE INDEX "meli_alerts_meliItemId_key" ON "meli_alerts"("meliItemId");

-- CreateIndex
CREATE INDEX "meli_alerts_meliItemId_type_risk_idx" ON "meli_alerts"("meliItemId", "type", "risk");

-- CreateIndex
CREATE INDEX "meli_sync_jobs_integrationId_status_createdAt_idx" ON "meli_sync_jobs"("integrationId", "status", "createdAt");

-- AddForeignKey
ALTER TABLE "meli_integrations" ADD CONSTRAINT "meli_integrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meli_products" ADD CONSTRAINT "meli_products_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "meli_integrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meli_products" ADD CONSTRAINT "meli_products_meliCategoryId_fkey" FOREIGN KEY ("meliCategoryId") REFERENCES "meli_categories"("meliCategoryId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meli_product_settings" ADD CONSTRAINT "meli_product_settings_meliItemId_fkey" FOREIGN KEY ("meliItemId") REFERENCES "meli_products"("meliItemId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meli_order_history" ADD CONSTRAINT "meli_order_history_meliItemId_fkey" FOREIGN KEY ("meliItemId") REFERENCES "meli_products"("meliItemId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meli_stock_balance" ADD CONSTRAINT "meli_stock_balance_meliItemId_fkey" FOREIGN KEY ("meliItemId") REFERENCES "meli_products"("meliItemId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "meli_alerts" ADD CONSTRAINT "meli_alerts_meliItemId_fkey" FOREIGN KEY ("meliItemId") REFERENCES "meli_products"("meliItemId") ON DELETE CASCADE ON UPDATE CASCADE;
