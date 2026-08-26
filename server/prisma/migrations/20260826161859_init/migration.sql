-- CreateEnum
CREATE TYPE "Role" AS ENUM ('ADMIN', 'SUPERVISOR', 'CONTRACTOR');

-- CreateEnum
CREATE TYPE "Gender" AS ENUM ('MALE', 'FEMALE', 'OTHER');

-- CreateEnum
CREATE TYPE "LabourType" AS ENUM ('SKILLED', 'SEMI_SKILLED', 'UNSKILLED', 'HIGH_SKILLED');

-- CreateEnum
CREATE TYPE "EntityStatus" AS ENUM ('ACTIVE', 'INACTIVE', 'BLACKLISTED');

-- CreateEnum
CREATE TYPE "IdType" AS ENUM ('AADHAAR', 'PAN', 'VOTER_ID');

-- CreateEnum
CREATE TYPE "AttendanceStatus" AS ENUM ('PRESENT', 'ABSENT', 'HALF_DAY');

-- CreateEnum
CREATE TYPE "AttendanceSource" AS ENUM ('QR_SCAN', 'MANUAL');

-- CreateEnum
CREATE TYPE "GateDirection" AS ENUM ('INWARD', 'OUTWARD');

-- CreateEnum
CREATE TYPE "HolidayType" AS ENUM ('WEEKLY_OFF', 'PAID_LEAVE');

-- CreateEnum
CREATE TYPE "RepaymentStatus" AS ENUM ('PENDING', 'PAID');

-- CreateEnum
CREATE TYPE "DocType" AS ENUM ('SHOP_ACT', 'PF_CODE', 'ESIC_CODE', 'PTEC', 'PTRC', 'MLWF_CODE', 'BOCW_LICENSE', 'LABOUR_LICENSE', 'WC_POLICY');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "loginId" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "role" "Role" NOT NULL,
    "fullName" TEXT,
    "contractorId" TEXT,
    "supervisorId" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "lastLoginAt" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Contractor" (
    "id" TEXT NOT NULL,
    "contractorCode" TEXT NOT NULL,
    "contractorName" TEXT NOT NULL,
    "contactPerson" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "email2" TEXT,
    "email3" TEXT,
    "email4" TEXT,
    "address" TEXT NOT NULL,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "aadhaarNo" TEXT NOT NULL,
    "panNo" TEXT NOT NULL,
    "wcPolicyNo" TEXT,
    "wcStartDate" TIMESTAMP(3),
    "wcExpiryDate" TIMESTAMP(3),
    "serviceType" TEXT,
    "serviceTaxNo" TEXT,
    "shopActLicenseNo" TEXT,
    "shopActExpiryDate" TIMESTAMP(3),
    "labourLicenseNo" TEXT,
    "labourLicenseStart" TIMESTAMP(3),
    "labourLicenseExpiry" TIMESTAMP(3),
    "bocwNo" TEXT,
    "bocwStartDate" TIMESTAMP(3),
    "bocwExpiryDate" TIMESTAMP(3),
    "rcCount" INTEGER,
    "pfEstablishmentCode" TEXT,
    "esicEstablishmentCode" TEXT,
    "mlwfNo" TEXT,
    "ptecNo" TEXT,
    "ptrcNo" TEXT,
    "buildingName" TEXT,
    "status" "EntityStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Contractor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ContractorDocument" (
    "id" TEXT NOT NULL,
    "contractorId" TEXT NOT NULL,
    "docType" "DocType" NOT NULL,
    "fileUrl" TEXT NOT NULL,
    "uploadedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ContractorDocument_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Supervisor" (
    "id" TEXT NOT NULL,
    "supervisorCode" TEXT NOT NULL,
    "fullName" TEXT NOT NULL,
    "gender" "Gender" NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "contactNo" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "aadhaarNo" TEXT NOT NULL,
    "aadhaarFrontUrl" TEXT,
    "aadhaarBackUrl" TEXT,
    "street" TEXT,
    "city" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "assignedContractorId" TEXT,
    "status" "EntityStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Supervisor_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Designation" (
    "id" TEXT NOT NULL,
    "designationCode" TEXT NOT NULL,
    "designationName" TEXT NOT NULL,

    CONSTRAINT "Designation_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LabourCategory" (
    "id" TEXT NOT NULL,
    "categoryCode" TEXT NOT NULL,
    "categoryName" "LabourType" NOT NULL,
    "ratePerDay" DECIMAL(65,30) NOT NULL,

    CONSTRAINT "LabourCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Worker" (
    "id" TEXT NOT NULL,
    "workerCode" TEXT NOT NULL,
    "firstName" TEXT NOT NULL,
    "middleName" TEXT,
    "lastName" TEXT NOT NULL,
    "dob" TIMESTAMP(3) NOT NULL,
    "gender" "Gender" NOT NULL,
    "maritalStatus" TEXT,
    "mobileNo" TEXT NOT NULL,
    "permanentAddress" TEXT NOT NULL,
    "currentAddress" TEXT,
    "city" TEXT,
    "district" TEXT,
    "state" TEXT,
    "pincode" TEXT,
    "contractorId" TEXT NOT NULL,
    "designationId" TEXT NOT NULL,
    "labourCategoryId" TEXT NOT NULL,
    "idType" "IdType" NOT NULL,
    "idNumber" TEXT NOT NULL,
    "idFrontUrl" TEXT,
    "idBackUrl" TEXT,
    "bankPassbookUrl" TEXT,
    "photoUrl" TEXT,
    "bocwRegistrationNo" TEXT,
    "bocwIssueDate" TIMESTAMP(3),
    "bocwValidDate" TIMESTAMP(3),
    "pfNumber" TEXT,
    "uanNumber" TEXT,
    "esicNumber" TEXT,
    "panNumber" TEXT,
    "ipNumber" TEXT,
    "policeVerified" BOOLEAN NOT NULL DEFAULT false,
    "joinDate" TIMESTAMP(3) NOT NULL,
    "bankName" TEXT,
    "bankBranch" TEXT,
    "accountNo" TEXT,
    "ifscCode" TEXT,
    "nomineeName" TEXT,
    "nomineeRelation" TEXT,
    "nomineeChildrenCount" INTEGER,
    "nomineeQualification" TEXT,
    "nomineeMobile" TEXT,
    "sector" TEXT,
    "status" "EntityStatus" NOT NULL DEFAULT 'ACTIVE',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Worker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Attendance" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "day" TEXT NOT NULL,
    "inTime" TEXT NOT NULL,
    "outTime" TEXT,
    "status" "AttendanceStatus" NOT NULL,
    "buildingNo" TEXT,
    "markedByUserId" TEXT NOT NULL,
    "source" "AttendanceSource" NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Attendance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "GateLog" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "direction" "GateDirection" NOT NULL,
    "gateNo" TEXT NOT NULL,
    "timestamp" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "GateLog_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Damage" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "imageUrl" TEXT,
    "particulars" TEXT NOT NULL,
    "damageDate" TIMESTAMP(3) NOT NULL,
    "causeShown" BOOLEAN NOT NULL,
    "witnessName" TEXT,
    "deductionAmount" DECIMAL(65,30) NOT NULL,
    "installments" INTEGER NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Damage_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Fine" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "offence" TEXT NOT NULL,
    "offenceDate" TIMESTAMP(3) NOT NULL,
    "causeShown" BOOLEAN NOT NULL,
    "witnessName" TEXT,
    "wagePeriod" TEXT,
    "wagesPayable" DECIMAL(65,30),
    "fineAmount" DECIMAL(65,30) NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Fine_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Accident" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "accidentDate" TIMESTAMP(3) NOT NULL,
    "form24ReportDate" TIMESTAMP(3),
    "natureOfAccident" TEXT NOT NULL,
    "dateReturnToWork" TIMESTAMP(3),
    "daysAbsent" INTEGER NOT NULL,
    "photoUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Accident_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Advance" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "advanceDate" TIMESTAMP(3) NOT NULL,
    "wagesPeriod" TEXT,
    "wagesPayable" DECIMAL(65,30),
    "amount" DECIMAL(65,30) NOT NULL,
    "purpose" TEXT NOT NULL,
    "installmentsCount" INTEGER NOT NULL,
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Advance_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AdvanceRepayment" (
    "id" TEXT NOT NULL,
    "advanceId" TEXT NOT NULL,
    "installmentNo" INTEGER NOT NULL,
    "dueDate" TIMESTAMP(3) NOT NULL,
    "amount" DECIMAL(65,30) NOT NULL,
    "paidStatus" "RepaymentStatus" NOT NULL DEFAULT 'PENDING',
    "paidDate" TIMESTAMP(3),

    CONSTRAINT "AdvanceRepayment_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Overtime" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "otDate" TIMESTAMP(3) NOT NULL,
    "hoursWorked" DECIMAL(65,30) NOT NULL,
    "normalWageRate" DECIMAL(65,30) NOT NULL,
    "otWageRate" DECIMAL(65,30) NOT NULL,
    "otEarnings" DECIMAL(65,30) NOT NULL,
    "datePaid" TIMESTAMP(3),
    "remarks" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Overtime_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Policy" (
    "id" TEXT NOT NULL,
    "contractorId" TEXT NOT NULL,
    "policyName" TEXT NOT NULL,
    "policyNumber" TEXT NOT NULL,
    "insuranceCompany" TEXT NOT NULL,
    "projectName" TEXT,
    "policyDate" TIMESTAMP(3) NOT NULL,
    "validDate" TIMESTAMP(3) NOT NULL,
    "workerCount" INTEGER NOT NULL,
    "projectValue" DECIMAL(65,30),
    "personValue" DECIMAL(65,30),
    "fileUrl" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Policy_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Holiday" (
    "id" TEXT NOT NULL,
    "type" "HolidayType" NOT NULL,
    "date" TIMESTAMP(3) NOT NULL,
    "notes" TEXT,
    "contractorId" TEXT,

    CONSTRAINT "Holiday_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "IdCard" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "contractorId" TEXT NOT NULL,
    "validityMonths" INTEGER NOT NULL,
    "issueDate" TIMESTAMP(3) NOT NULL,
    "expiryDate" TIMESTAMP(3) NOT NULL,
    "qrCodeData" TEXT NOT NULL,

    CONSTRAINT "IdCard_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ComplianceTracker" (
    "id" TEXT NOT NULL,
    "workerId" TEXT NOT NULL,
    "contractorId" TEXT NOT NULL,
    "continuousDaysCount" INTEGER NOT NULL DEFAULT 0,
    "lastCalculatedDate" TIMESTAMP(3),
    "form90Generated" BOOLEAN NOT NULL DEFAULT false,
    "form90GeneratedAt" TIMESTAMP(3),

    CONSTRAINT "ComplianceTracker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "AuditLog" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "action" TEXT NOT NULL,
    "entityType" TEXT NOT NULL,
    "entityId" TEXT NOT NULL,
    "oldValue" JSONB,
    "newValue" JSONB,
    "timestamp" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_loginId_key" ON "User"("loginId");

-- CreateIndex
CREATE UNIQUE INDEX "User_contractorId_key" ON "User"("contractorId");

-- CreateIndex
CREATE UNIQUE INDEX "User_supervisorId_key" ON "User"("supervisorId");

-- CreateIndex
CREATE UNIQUE INDEX "Contractor_contractorCode_key" ON "Contractor"("contractorCode");

-- CreateIndex
CREATE UNIQUE INDEX "Contractor_aadhaarNo_key" ON "Contractor"("aadhaarNo");

-- CreateIndex
CREATE UNIQUE INDEX "Contractor_panNo_key" ON "Contractor"("panNo");

-- CreateIndex
CREATE UNIQUE INDEX "Supervisor_supervisorCode_key" ON "Supervisor"("supervisorCode");

-- CreateIndex
CREATE UNIQUE INDEX "Supervisor_aadhaarNo_key" ON "Supervisor"("aadhaarNo");

-- CreateIndex
CREATE UNIQUE INDEX "Designation_designationCode_key" ON "Designation"("designationCode");

-- CreateIndex
CREATE UNIQUE INDEX "LabourCategory_categoryCode_key" ON "LabourCategory"("categoryCode");

-- CreateIndex
CREATE UNIQUE INDEX "Worker_workerCode_key" ON "Worker"("workerCode");

-- CreateIndex
CREATE UNIQUE INDEX "Worker_idNumber_key" ON "Worker"("idNumber");

-- CreateIndex
CREATE INDEX "Worker_contractorId_idx" ON "Worker"("contractorId");

-- CreateIndex
CREATE INDEX "Worker_designationId_idx" ON "Worker"("designationId");

-- CreateIndex
CREATE INDEX "Worker_labourCategoryId_idx" ON "Worker"("labourCategoryId");

-- CreateIndex
CREATE INDEX "Attendance_date_idx" ON "Attendance"("date");

-- CreateIndex
CREATE UNIQUE INDEX "Attendance_workerId_date_key" ON "Attendance"("workerId", "date");

-- CreateIndex
CREATE INDEX "GateLog_workerId_timestamp_idx" ON "GateLog"("workerId", "timestamp");

-- CreateIndex
CREATE INDEX "Damage_workerId_damageDate_idx" ON "Damage"("workerId", "damageDate");

-- CreateIndex
CREATE INDEX "Fine_workerId_offenceDate_idx" ON "Fine"("workerId", "offenceDate");

-- CreateIndex
CREATE INDEX "Accident_workerId_accidentDate_idx" ON "Accident"("workerId", "accidentDate");

-- CreateIndex
CREATE INDEX "Advance_workerId_advanceDate_idx" ON "Advance"("workerId", "advanceDate");

-- CreateIndex
CREATE INDEX "Overtime_workerId_otDate_idx" ON "Overtime"("workerId", "otDate");

-- CreateIndex
CREATE UNIQUE INDEX "ComplianceTracker_workerId_key" ON "ComplianceTracker"("workerId");

-- CreateIndex
CREATE INDEX "AuditLog_entityType_entityId_idx" ON "AuditLog"("entityType", "entityId");

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "Contractor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "User" ADD CONSTRAINT "User_supervisorId_fkey" FOREIGN KEY ("supervisorId") REFERENCES "Supervisor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ContractorDocument" ADD CONSTRAINT "ContractorDocument_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "Contractor"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Supervisor" ADD CONSTRAINT "Supervisor_assignedContractorId_fkey" FOREIGN KEY ("assignedContractorId") REFERENCES "Contractor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Worker" ADD CONSTRAINT "Worker_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "Contractor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Worker" ADD CONSTRAINT "Worker_designationId_fkey" FOREIGN KEY ("designationId") REFERENCES "Designation"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Worker" ADD CONSTRAINT "Worker_labourCategoryId_fkey" FOREIGN KEY ("labourCategoryId") REFERENCES "LabourCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Attendance" ADD CONSTRAINT "Attendance_markedByUserId_fkey" FOREIGN KEY ("markedByUserId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "GateLog" ADD CONSTRAINT "GateLog_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Damage" ADD CONSTRAINT "Damage_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Fine" ADD CONSTRAINT "Fine_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Accident" ADD CONSTRAINT "Accident_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Advance" ADD CONSTRAINT "Advance_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AdvanceRepayment" ADD CONSTRAINT "AdvanceRepayment_advanceId_fkey" FOREIGN KEY ("advanceId") REFERENCES "Advance"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Overtime" ADD CONSTRAINT "Overtime_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Policy" ADD CONSTRAINT "Policy_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "Contractor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Holiday" ADD CONSTRAINT "Holiday_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "Contractor"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdCard" ADD CONSTRAINT "IdCard_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "IdCard" ADD CONSTRAINT "IdCard_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "Contractor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceTracker" ADD CONSTRAINT "ComplianceTracker_workerId_fkey" FOREIGN KEY ("workerId") REFERENCES "Worker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ComplianceTracker" ADD CONSTRAINT "ComplianceTracker_contractorId_fkey" FOREIGN KEY ("contractorId") REFERENCES "Contractor"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "AuditLog" ADD CONSTRAINT "AuditLog_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
