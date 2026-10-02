-- CreateEnum
CREATE TYPE "VerificationType" AS ENUM ('AADHAAR', 'POLICE');

-- CreateEnum
CREATE TYPE "VerificationStatus" AS ENUM ('PENDING', 'VERIFIED', 'REJECTED', 'NOT_REQUIRED');

-- CreateTable
CREATE TABLE "WorkerVerification" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "type" "VerificationType" NOT NULL,
    "status" "VerificationStatus" NOT NULL DEFAULT 'PENDING',
    "verifiedByUserId" TEXT,
    "verifiedAt" TIMESTAMP(3),
    "referenceNo" TEXT,
    "remarks" TEXT,
    "documentUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "WorkerVerification_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "WorkerVerification_workerId_type_key" ON "WorkerVerification"("workerId", "type");

-- AddForeignKey
ALTER TABLE "WorkerVerification" ADD CONSTRAINT "WorkerVerification_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "WorkerVerification" ADD CONSTRAINT "WorkerVerification_verifiedByUserId_fkey" FOREIGN KEY ("verifiedByUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
