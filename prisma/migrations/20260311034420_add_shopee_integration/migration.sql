-- CreateEnum
CREATE TYPE "ShopeeSyncStatus" AS ENUM ('IDLE', 'SYNCING', 'COMPLETED', 'FAILED');

-- CreateEnum
CREATE TYPE "ShopeeAlertType" AS ENUM ('FINE', 'RUPTURE', 'DEAD_STOCK', 'OPPORTUNITY', 'LIQUIDATION');

-- CreateEnum
CREATE TYPE "ShopeeRuptureRisk" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- CreateEnum
CREATE TYPE "ShopeeJobSyncType" AS ENUM ('ORDERS', 'FULL');

-- CreateEnum
CREATE TYPE "ShopeeJobStatus" AS ENUM ('RUNNING', 'FAILED', 'DONE');

-- AlterEnum
ALTER TYPE "IntegrationProvider" ADD VALUE 'SHOPEE';

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "shopeeSyncStatus" "ShopeeSyncStatus" NOT NULL DEFAULT 'IDLE';

-- CreateTable
CREATE TABLE "shopee_integrations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "shopId" TEXT NOT NULL,
    "accessToken" TEXT NOT NULL,
    "refreshToken" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "connectedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shopee_integrations_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shopee_products" (
    "id" TEXT NOT NULL,
    "shopeeItemId" TEXT NOT NULL,
    "shopeeCategoryId" TEXT,
    "title" TEXT NOT NULL,
    "sku" TEXT,
    "costPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "salePrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "currentStock" INTEGER NOT NULL DEFAULT 0,
    "thumbnail" TEXT,
    "permalink" TEXT,
    "status" TEXT,
    "integrationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shopee_products_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shopee_product_settings" (
    "id" TEXT NOT NULL,
    "shopeeItemId" TEXT NOT NULL,
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

    CONSTRAINT "shopee_product_settings_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shopee_categories" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "shopeeCategoryId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shopee_categories_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shopee_order_history" (
    "id" TEXT NOT NULL,
    "shopeeOrderSn" TEXT NOT NULL,
    "shopeeItemId" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "totalValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shopee_order_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shopee_stock_balance" (
    "id" TEXT NOT NULL,
    "shopeeItemId" TEXT NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shopee_stock_balance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shopee_alerts" (
    "id" TEXT NOT NULL,
    "shopeeItemId" TEXT NOT NULL,
    "type" "ShopeeAlertType" NOT NULL DEFAULT 'FINE',
    "risk" "ShopeeRuptureRisk" NOT NULL DEFAULT 'LOW',
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

    CONSTRAINT "shopee_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "shopee_sync_jobs" (
    "id" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "ShopeeJobSyncType" NOT NULL,
    "totalBatches" INTEGER NOT NULL,
    "processedBatches" INTEGER NOT NULL DEFAULT 0,
    "status" "ShopeeJobStatus" NOT NULL DEFAULT 'RUNNING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "shopee_sync_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "shopee_integrations_userId_key" ON "shopee_integrations"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "shopee_products_shopeeItemId_key" ON "shopee_products"("shopeeItemId");

-- CreateIndex
CREATE INDEX "shopee_products_shopeeItemId_integrationId_idx" ON "shopee_products"("shopeeItemId", "integrationId");

-- CreateIndex
CREATE UNIQUE INDEX "shopee_product_settings_shopeeItemId_key" ON "shopee_product_settings"("shopeeItemId");

-- CreateIndex
CREATE UNIQUE INDEX "shopee_categories_shopeeCategoryId_key" ON "shopee_categories"("shopeeCategoryId");

-- CreateIndex
CREATE INDEX "shopee_order_history_shopeeItemId_shopeeOrderSn_date_idx" ON "shopee_order_history"("shopeeItemId", "shopeeOrderSn", "date");

-- CreateIndex
CREATE UNIQUE INDEX "shopee_order_history_shopeeOrderSn_shopeeItemId_key" ON "shopee_order_history"("shopeeOrderSn", "shopeeItemId");

-- CreateIndex
CREATE INDEX "shopee_stock_balance_shopeeItemId_idx" ON "shopee_stock_balance"("shopeeItemId");

-- CreateIndex
CREATE UNIQUE INDEX "shopee_alerts_shopeeItemId_key" ON "shopee_alerts"("shopeeItemId");

-- CreateIndex
CREATE INDEX "shopee_alerts_shopeeItemId_type_risk_idx" ON "shopee_alerts"("shopeeItemId", "type", "risk");

-- CreateIndex
CREATE INDEX "shopee_sync_jobs_integrationId_status_createdAt_idx" ON "shopee_sync_jobs"("integrationId", "status", "createdAt");

-- AddForeignKey
ALTER TABLE "shopee_integrations" ADD CONSTRAINT "shopee_integrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopee_products" ADD CONSTRAINT "shopee_products_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "shopee_integrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopee_products" ADD CONSTRAINT "shopee_products_shopeeCategoryId_fkey" FOREIGN KEY ("shopeeCategoryId") REFERENCES "shopee_categories"("shopeeCategoryId") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopee_product_settings" ADD CONSTRAINT "shopee_product_settings_shopeeItemId_fkey" FOREIGN KEY ("shopeeItemId") REFERENCES "shopee_products"("shopeeItemId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopee_order_history" ADD CONSTRAINT "shopee_order_history_shopeeItemId_fkey" FOREIGN KEY ("shopeeItemId") REFERENCES "shopee_products"("shopeeItemId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopee_stock_balance" ADD CONSTRAINT "shopee_stock_balance_shopeeItemId_fkey" FOREIGN KEY ("shopeeItemId") REFERENCES "shopee_products"("shopeeItemId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "shopee_alerts" ADD CONSTRAINT "shopee_alerts_shopeeItemId_fkey" FOREIGN KEY ("shopeeItemId") REFERENCES "shopee_products"("shopeeItemId") ON DELETE CASCADE ON UPDATE CASCADE;
