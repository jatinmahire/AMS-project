const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const { scopedContractorId: resolveScope } = require('../utils/scope');

async function lookupWorker(code, user) {
  const worker = await prisma.worker.findUnique({
    where: { workerCode: code },
    include: { contractor: true, designation: true, labourCategory: true },
  });
  if (!worker) throw new ApiError(404, `No worker found with code ${code}`);

  const scopedContractorId = await resolveScope(user);
  if (scopedContractorId && worker.contractorId !== scopedContractorId) {
    throw new ApiError(404, `No worker found with code ${code}`);
  }

  return worker;
}

async function lookupContractor(code) {
  const contractor = await prisma.contractor.findUnique({
    where: { contractorCode: code },
    include: { documents: true },
  });
  if (!contractor) throw new ApiError(404, `No contractor found with code ${code}`);
  return contractor;
}

async function lookupSupervisor(code) {
  const supervisor = await prisma.supervisor.findUnique({
    where: { supervisorCode: code },
    include: { assignedContractor: true },
  });
  if (!supervisor) throw new ApiError(404, `No supervisor found with code ${code}`);
  return supervisor;
}

module.exports = { lookupWorker, lookupContractor, lookupSupervisor };
