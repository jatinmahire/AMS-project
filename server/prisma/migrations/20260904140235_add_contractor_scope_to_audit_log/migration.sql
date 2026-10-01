-- AlterTable
ALTER TABLE "AuditLog" ADD COLUMN     "contractorId" TEXT;

-- CreateIndex
CREATE INDEX "AuditLog_contractorId_timestamp_idx" ON "AuditLog"("contractorId", "timestamp");

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "Contractor"("id") ON DELETE SET NULL ON UPDATE CASCADE;
