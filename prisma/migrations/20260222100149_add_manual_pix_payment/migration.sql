-- CreateEnum
CREATE TYPE "PixPaymentStatus" AS ENUM ('AGUARDANDO_PAGAMENTO', 'PAGAMENTO_CONFIRMADO', 'PAGAMENTO_RECUSADO', 'EXPIRADO');

-- CreateTable
CREATE TABLE "manual_pix_payments" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "amount" DECIMAL(10,2) NOT NULL,
    "status" "PixPaymentStatus" NOT NULL DEFAULT 'AGUARDANDO_PAGAMENTO',
    "pixKey" TEXT NOT NULL,
    "pixExternalId" TEXT NOT NULL,
    "qrCodePayload" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "manual_pix_payments_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "manual_pix_payments_userId_status_idx" ON "manual_pix_payments"("userId", "status");

-- CreateIndex
CREATE INDEX "manual_pix_payments_status_createdAt_idx" ON "manual_pix_payments"("status", "createdAt");

-- AddForeignKey
ALTER TABLE "manual_pix_payments" ADD CONSTRAINT "manual_pix_payments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
