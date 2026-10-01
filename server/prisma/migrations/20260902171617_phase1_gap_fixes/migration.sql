-- AlterTable
ALTER TABLE "Contractor" ADD COLUMN     "establishmentName" TEXT,
ADD COLUMN     "principalEmployerAddress" TEXT,
ADD COLUMN     "principalEmployerName" TEXT,
ADD COLUMN     "rc" TEXT,
ADD COLUMN     "taluka" TEXT,
ADD COLUMN     "village" TEXT;

-- AlterTable
ALTER TABLE "Damage" ADD COLUMN     "nameOfWorksmen" TEXT,
ALTER COLUMN "causeShown" DROP NOT NULL,
ALTER COLUMN "causeShown" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Fine" ADD COLUMN     "dateRealised" TIMESTAMP(3),
ALTER COLUMN "causeShown" DROP NOT NULL,
ALTER COLUMN "causeShown" SET DATA TYPE TEXT;

-- AlterTable
ALTER TABLE "Policy" ADD COLUMN     "remarks" TEXT;

-- AlterTable
ALTER TABLE "Worker" ADD COLUMN     "fatherOrHusbandName" TEXT,
ADD COLUMN     "taluka" TEXT,
ADD COLUMN     "village" TEXT;
