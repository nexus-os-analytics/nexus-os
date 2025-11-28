-- CreateEnum
CREATE TYPE "BlingSyncStatus" AS ENUM ('IDLE', 'SYNCING', 'COMPLETED', 'FAILED');

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "blingSyncStatus" "BlingSyncStatus" NOT NULL DEFAULT 'IDLE';
