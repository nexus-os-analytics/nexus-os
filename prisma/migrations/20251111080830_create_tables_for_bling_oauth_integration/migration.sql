-- CreateEnum
CREATE TYPE "AlertType" AS ENUM ('rupture', 'dead_stock', 'opportunity');

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
CREATE TABLE "ProductAlert" (
    "id" TEXT NOT NULL,
    "type" "AlertType" NOT NULL,
    "productName" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "imageUrl" TEXT,
    "category" TEXT NOT NULL,
    "daysRemaining" INTEGER,
    "stockAmount" INTEGER,
    "vvd" DOUBLE PRECISION,
    "replenishmentTime" INTEGER,
    "safetyDays" INTEGER,
    "capitalTied" DOUBLE PRECISION,
    "daysSinceLastSale" INTEGER,
    "lastSaleDate" TIMESTAMP(3),
    "costPrice" DOUBLE PRECISION,
    "sellingPrice" DOUBLE PRECISION,
    "salesGrowth" DOUBLE PRECISION,
    "vvdLast7Days" DOUBLE PRECISION,
    "vvdPrevious7Days" DOUBLE PRECISION,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "blingProductId" TEXT,

    CONSTRAINT "ProductAlert_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlingProduct" (
    "id" TEXT NOT NULL,
    "blingId" TEXT NOT NULL,
    "sku" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "category" TEXT,
    "price" DOUBLE PRECISION,
    "costPrice" DOUBLE PRECISION,
    "imageUrl" TEXT,
    "lastSynced" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "BlingProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BlingOrder" (
    "id" TEXT NOT NULL,
    "blingId" TEXT NOT NULL,
    "orderNumber" TEXT NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "total" DOUBLE PRECISION NOT NULL,
    "items" JSONB NOT NULL,

    CONSTRAINT "BlingOrder_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "bling_integrations_userId_key" ON "bling_integrations"("userId");

-- CreateIndex
CREATE UNIQUE INDEX "ProductAlert_sku_key" ON "ProductAlert"("sku");

-- CreateIndex
CREATE INDEX "ProductAlert_sku_idx" ON "ProductAlert"("sku");

-- CreateIndex
CREATE INDEX "ProductAlert_type_idx" ON "ProductAlert"("type");

-- CreateIndex
CREATE UNIQUE INDEX "BlingProduct_blingId_key" ON "BlingProduct"("blingId");

-- CreateIndex
CREATE UNIQUE INDEX "BlingProduct_sku_key" ON "BlingProduct"("sku");

-- CreateIndex
CREATE UNIQUE INDEX "BlingOrder_blingId_key" ON "BlingOrder"("blingId");

-- AddForeignKey
ALTER TABLE "bling_integrations" ADD CONSTRAINT "bling_integrations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductAlert" ADD CONSTRAINT "ProductAlert_blingProductId_fkey" FOREIGN KEY ("blingProductId") REFERENCES "BlingProduct"("id") ON DELETE SET NULL ON UPDATE CASCADE;
