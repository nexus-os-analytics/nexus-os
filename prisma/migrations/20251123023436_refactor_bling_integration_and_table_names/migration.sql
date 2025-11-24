/*
  Warnings:

  - You are about to drop the `ApiKey` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `AuditLog` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BlingOrder` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `BlingProduct` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `DataRegistry` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `LoginActivity` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `ProductAlert` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `SecurityIncident` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `User` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `user_settings` table. If the table is not empty, all the data it contains will be lost.

*/
-- CreateEnum
CREATE TYPE "BlingAlertType" AS ENUM ('RUPTURE', 'DEAD_STOCK', 'OPPORTUNITY');

-- CreateEnum
CREATE TYPE "BlingRuptureRisk" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'CRITICAL');

-- DropForeignKey
ALTER TABLE "public"."ApiKey" DROP CONSTRAINT "ApiKey_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."AuditLog" DROP CONSTRAINT "AuditLog_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."BlingProduct" DROP CONSTRAINT "BlingProduct_integrationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."LoginActivity" DROP CONSTRAINT "LoginActivity_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProductAlert" DROP CONSTRAINT "ProductAlert_blingProductId_fkey";

-- DropForeignKey
ALTER TABLE "public"."ProductAlert" DROP CONSTRAINT "ProductAlert_integrationId_fkey";

-- DropForeignKey
ALTER TABLE "public"."SecurityIncident" DROP CONSTRAINT "SecurityIncident_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."accounts" DROP CONSTRAINT "accounts_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."bling_integrations" DROP CONSTRAINT "bling_integrations_userId_fkey";

-- DropForeignKey
ALTER TABLE "public"."sessions" DROP CONSTRAINT "sessions_user_id_fkey";

-- DropForeignKey
ALTER TABLE "public"."user_settings" DROP CONSTRAINT "user_settings_userId_fkey";

-- DropTable
DROP TABLE "public"."ApiKey";

-- DropTable
DROP TABLE "public"."AuditLog";

-- DropTable
DROP TABLE "public"."BlingOrder";

-- DropTable
DROP TABLE "public"."BlingProduct";

-- DropTable
DROP TABLE "public"."DataRegistry";

-- DropTable
DROP TABLE "public"."LoginActivity";

-- DropTable
DROP TABLE "public"."ProductAlert";

-- DropTable
DROP TABLE "public"."SecurityIncident";

-- DropTable
DROP TABLE "public"."User";

-- DropTable
DROP TABLE "public"."user_settings";

-- DropEnum
DROP TYPE "public"."AlertType";

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

    CONSTRAINT "users_pkey" PRIMARY KEY ("id")
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
CREATE TABLE "bling_products" (
    "id" TEXT NOT NULL,
    "blingProductId" TEXT NOT NULL,
    "categoryId" TEXT,
    "name" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "costPrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "salePrice" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "avgMonthlySales" DOUBLE PRECISION DEFAULT 0,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "image" TEXT,
    "shortDescription" TEXT,
    "lastSaleDate" TIMESTAMP(3),
    "integrationId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bling_products_pkey" PRIMARY KEY ("id")
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
    "date" TIMESTAMP(3) NOT NULL,
    "productId" TEXT NOT NULL,
    "productSku" TEXT NOT NULL,
    "quantity" INTEGER NOT NULL DEFAULT 0,
    "totalValue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bling_sales_history_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bling_stock_balance" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "productSku" TEXT NOT NULL,
    "stock" INTEGER NOT NULL DEFAULT 0,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bling_stock_balance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bling_alerts" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "type" "BlingAlertType" NOT NULL,
    "risk" "BlingRuptureRisk",
    "recommendations" JSONB NOT NULL,
    "generatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "acknowledged" BOOLEAN NOT NULL DEFAULT false,
    "executedAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bling_alerts_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "bling_product_settings" (
    "id" TEXT NOT NULL,
    "productId" TEXT NOT NULL,
    "leadTimeDays" INTEGER NOT NULL DEFAULT 15,
    "safetyDays" INTEGER NOT NULL DEFAULT 5,
    "recoveryTarget" DOUBLE PRECISION NOT NULL DEFAULT 0.8,
    "opportunityGrowthThreshold" DOUBLE PRECISION NOT NULL DEFAULT 0.3,
    "liquidationIdleThresholdDays" INTEGER NOT NULL DEFAULT 90,
    "liquidationMaxDays" INTEGER NOT NULL DEFAULT 30,
    "minSalesForOpportunity" INTEGER NOT NULL DEFAULT 3,
    "newProductMinDays" INTEGER NOT NULL DEFAULT 30,
    "minHistoryDaysForDecision" INTEGER NOT NULL DEFAULT 7,

    CONSTRAINT "bling_product_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "users_email_key" ON "users"("email");

-- CreateIndex
CREATE INDEX "users_email_createdAt_deletedAt_idx" ON "users"("email", "createdAt", "deletedAt");

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
CREATE UNIQUE INDEX "bling_products_blingProductId_key" ON "bling_products"("blingProductId");

-- CreateIndex
CREATE UNIQUE INDEX "bling_categories_blingCategoryId_key" ON "bling_categories"("blingCategoryId");

-- CreateIndex
CREATE INDEX "bling_sales_history_productId_idx" ON "bling_sales_history"("productId");

-- CreateIndex
CREATE UNIQUE INDEX "bling_sales_history_blingSaleId_productId_key" ON "bling_sales_history"("blingSaleId", "productId");

-- CreateIndex
CREATE INDEX "bling_stock_balance_productId_productSku_idx" ON "bling_stock_balance"("productId", "productSku");

-- CreateIndex
CREATE INDEX "bling_alerts_productId_type_generatedAt_idx" ON "bling_alerts"("productId", "type", "generatedAt");

-- CreateIndex
CREATE UNIQUE INDEX "bling_product_settings_productId_key" ON "bling_product_settings"("productId");

-- AddForeignKey
ALTER TABLE "accounts" ADD CONSTRAINT "accounts_user_id_fkey" FOREIGN KEY ("user_id") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

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
ALTER TABLE "bling_products" ADD CONSTRAINT "bling_products_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "bling_categories"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bling_sales_history" ADD CONSTRAINT "bling_sales_history_productId_fkey" FOREIGN KEY ("productId") REFERENCES "bling_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bling_stock_balance" ADD CONSTRAINT "bling_stock_balance_productId_fkey" FOREIGN KEY ("productId") REFERENCES "bling_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bling_alerts" ADD CONSTRAINT "bling_alerts_productId_fkey" FOREIGN KEY ("productId") REFERENCES "bling_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "bling_product_settings" ADD CONSTRAINT "bling_product_settings_productId_fkey" FOREIGN KEY ("productId") REFERENCES "bling_products"("id") ON DELETE CASCADE ON UPDATE CASCADE;
