-- AlterTable
ALTER TABLE "User" ADD COLUMN     "onboardingCompleted" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "user_settings" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "capitalCost" DOUBLE PRECISION NOT NULL DEFAULT 3.0,
    "storageCost" DOUBLE PRECISION NOT NULL DEFAULT 0.5,
    "defaultRestockTime" INTEGER NOT NULL DEFAULT 7,
    "safetyDays" INTEGER NOT NULL DEFAULT 3,
    "recoveryTarget" DOUBLE PRECISION NOT NULL DEFAULT 80.0,
    "maxRecoveryPeriod" INTEGER NOT NULL DEFAULT 30,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "user_settings_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "user_settings_userId_key" ON "user_settings"("userId");

-- AddForeignKey
ALTER TABLE "user_settings" ADD CONSTRAINT "user_settings_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
