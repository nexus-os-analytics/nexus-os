-- CreateEnum
CREATE TYPE "BlingJobSyncType" AS ENUM ('SALES', 'FULL');

-- CreateEnum
CREATE TYPE "BlingJobStatus" AS ENUM ('RUNNING', 'FAILED', 'DONE');

-- CreateTable
CREATE TABLE "bling_sync_jobs" (
    "id" TEXT NOT NULL,
    "integrationId" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "type" "BlingJobSyncType" NOT NULL,
    "totalBatches" INTEGER NOT NULL,
    "processedBatches" INTEGER NOT NULL DEFAULT 0,
    "status" "BlingJobStatus" NOT NULL DEFAULT 'RUNNING',
    "startedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "finishedAt" TIMESTAMP(3),
    "metadata" JSONB,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "bling_sync_jobs_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "bling_sync_jobs_integrationId_status_createdAt_idx" ON "bling_sync_jobs"("integrationId", "status", "createdAt");
