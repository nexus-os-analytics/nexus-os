-- CreateEnum
CREATE TYPE "CampaignType" AS ENUM ('LIQUIDATION', 'OPPORTUNITY');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('DRAFT', 'ACTIVE', 'PAUSED', 'COMPLETED');

-- CreateTable
CREATE TABLE "campaigns" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "CampaignType" NOT NULL,
    "blingProductId" TEXT NOT NULL,
    "discountPercentage" INTEGER,
    "increasePercentage" INTEGER,
    "toneOfVoice" TEXT NOT NULL,
    "customInstructions" TEXT,
    "variations" JSONB NOT NULL,
    "selectedVariationId" TEXT,
    "status" "CampaignStatus" NOT NULL DEFAULT 'DRAFT',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "startedAt" TIMESTAMP(3),
    "endedAt" TIMESTAMP(3),
    "clicks" INTEGER NOT NULL DEFAULT 0,
    "conversions" INTEGER NOT NULL DEFAULT 0,
    "revenue" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "roi" DOUBLE PRECISION NOT NULL DEFAULT 0,

    CONSTRAINT "campaigns_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "campaigns_userId_type_status_idx" ON "campaigns"("userId", "type", "status");

-- CreateIndex
CREATE INDEX "campaigns_userId_createdAt_idx" ON "campaigns"("userId", "createdAt");

-- CreateIndex
CREATE INDEX "campaigns_blingProductId_status_idx" ON "campaigns"("blingProductId", "status");

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "campaigns" ADD CONSTRAINT "campaigns_blingProductId_fkey" FOREIGN KEY ("blingProductId") REFERENCES "bling_products"("blingProductId") ON DELETE CASCADE ON UPDATE CASCADE;
