/*
  Warnings:

  - The `recommendations` column on the `bling_alerts` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - A unique constraint covering the columns `[productId]` on the table `bling_alerts` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "bling_alerts" ADD COLUMN     "finalRecommendation" JSONB,
ADD COLUMN     "jobId" TEXT,
ADD COLUMN     "metrics" JSONB,
ADD COLUMN     "pricing" JSONB,
ADD COLUMN     "riskLabel" TEXT,
DROP COLUMN "recommendations",
ADD COLUMN     "recommendations" TEXT[];

-- CreateIndex
CREATE UNIQUE INDEX "bling_alerts_productId_key" ON "bling_alerts"("productId");
