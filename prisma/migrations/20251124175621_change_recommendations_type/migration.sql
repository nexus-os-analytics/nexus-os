-- AlterTable
ALTER TABLE "bling_alerts" ALTER COLUMN "recommendations" DROP NOT NULL,
ALTER COLUMN "recommendations" SET DATA TYPE TEXT;
