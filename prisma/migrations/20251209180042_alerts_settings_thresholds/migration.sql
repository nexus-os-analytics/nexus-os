/*
  Warnings:

  - You are about to drop the column `liquidationIdleThresholdDays` on the `bling_product_settings` table. All the data in the column will be lost.
  - You are about to drop the column `liquidationMaxDays` on the `bling_product_settings` table. All the data in the column will be lost.
  - You are about to drop the column `minHistoryDaysForDecision` on the `bling_product_settings` table. All the data in the column will be lost.
  - You are about to drop the column `minSalesForOpportunity` on the `bling_product_settings` table. All the data in the column will be lost.
  - You are about to drop the column `newProductMinDays` on the `bling_product_settings` table. All the data in the column will be lost.
  - You are about to drop the column `opportunityGrowthThreshold` on the `bling_product_settings` table. All the data in the column will be lost.
  - You are about to drop the column `recoveryTarget` on the `bling_product_settings` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "bling_product_settings" DROP COLUMN "liquidationIdleThresholdDays",
DROP COLUMN "liquidationMaxDays",
DROP COLUMN "minHistoryDaysForDecision",
DROP COLUMN "minSalesForOpportunity",
DROP COLUMN "newProductMinDays",
DROP COLUMN "opportunityGrowthThreshold",
DROP COLUMN "recoveryTarget",
ADD COLUMN     "capitalOptimizationThreshold" DOUBLE PRECISION NOT NULL DEFAULT 10000,
ADD COLUMN     "criticalDaysRemainingThreshold" INTEGER NOT NULL DEFAULT 7,
ADD COLUMN     "deadStockCapitalThreshold" DOUBLE PRECISION NOT NULL DEFAULT 5000,
ADD COLUMN     "highDaysRemainingThreshold" INTEGER NOT NULL DEFAULT 15,
ADD COLUMN     "liquidationDiscount" DOUBLE PRECISION NOT NULL DEFAULT 0.3,
ADD COLUMN     "mediumDaysRemainingThreshold" INTEGER NOT NULL DEFAULT 30,
ADD COLUMN     "opportunityDemandVvd" DOUBLE PRECISION NOT NULL DEFAULT 1,
ADD COLUMN     "opportunityGrowthThresholdPct" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
ADD COLUMN     "ruptureCapitalThreshold" DOUBLE PRECISION NOT NULL DEFAULT 5000;
