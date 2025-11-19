/*
  Warnings:

  - Added the required column `integrationId` to the `BlingProduct` table without a default value. This is not possible if the table is not empty.
  - Added the required column `integrationId` to the `ProductAlert` table without a default value. This is not possible if the table is not empty.

*/
-- DropIndex
DROP INDEX "public"."ProductAlert_sku_idx";

-- DropIndex
DROP INDEX "public"."ProductAlert_sku_key";

-- DropIndex
DROP INDEX "public"."ProductAlert_type_idx";

-- AlterTable
ALTER TABLE "BlingProduct" ADD COLUMN     "integrationId" TEXT NOT NULL,
ADD COLUMN     "lastSaleDate" TIMESTAMP(3),
ADD COLUMN     "stockAmount" INTEGER;

-- AlterTable
ALTER TABLE "ProductAlert" ADD COLUMN     "integrationId" TEXT NOT NULL;

-- CreateIndex
CREATE INDEX "ProductAlert_sku_type_idx" ON "ProductAlert"("sku", "type");

-- AddForeignKey
ALTER TABLE "ProductAlert" ADD CONSTRAINT "ProductAlert_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "bling_integrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BlingProduct" ADD CONSTRAINT "BlingProduct_integrationId_fkey" FOREIGN KEY ("integrationId") REFERENCES "bling_integrations"("id") ON DELETE CASCADE ON UPDATE CASCADE;
