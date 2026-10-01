-- CreateEnum
CREATE TYPE "NotificationType" AS ENUM ('KYC_MISSING', 'COMPLIANCE_90_DAY', 'GATE_MISMATCH', 'LICENSE_EXPIRING');

-- CreateTable
CREATE TABLE "Notification" (
    "id" TEXT NOT NULL,
    "type" "NotificationType" NOT NULL,
    "message" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "contractorId" TEXT NOT NULL,
    "isRead" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE INDEX "Notification_contractorId_isRead_idx" ON "Notification"("contractorId", "isRead");

-- CreateIndex
CREATE INDEX "Notification_type_entityId_idx" ON "Notification"("type", "entityId");

-- AddForeignKey
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "Contractor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
