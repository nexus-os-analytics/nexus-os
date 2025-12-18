-- AlterEnum
ALTER TYPE "BlingAlertType" ADD VALUE 'LIQUIDATION';

-- AlterTable
ALTER TABLE "bling_product_settings" ADD COLUMN     "costFactor" DOUBLE PRECISION NOT NULL DEFAULT 0.8,
ADD COLUMN     "fineExcessCapitalMax" DOUBLE PRECISION NOT NULL DEFAULT 5000,
ADD COLUMN     "liquidationExcessCapitalThreshold" DOUBLE PRECISION NOT NULL DEFAULT 2000;
