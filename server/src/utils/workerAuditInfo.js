const prisma = require('../config/db');

// Fetches the small worker summary embedded into audit-log snapshots for
// worker-linked entities (Fine/Damage/Accident/Advance/Overtime), since those
// rows don't store the worker's name/code themselves. Also returns the
// worker's contractorId so callers can pass it to recordAudit for scoping.
async function getWorkerAuditInfo(workerId) {
  const worker = await prisma.worker.findUnique({
    where: { id: workerId },
    select: { workerCode: true, firstName: true, lastName: true, contractorId: true },
  });
  return worker || {};
}

module.exports = { getWorkerAuditInfo };
