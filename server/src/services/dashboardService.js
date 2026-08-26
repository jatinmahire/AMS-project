const prisma = require('../config/db');

function todayDateOnly() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

async function getCounts() {
  const [contractorCount, supervisorCount, workerCount, presentTodayCount] = await Promise.all([
    prisma.contractor.count(),
    prisma.supervisor.count(),
    prisma.worker.count(),
    prisma.attendance.count({ where: { date: todayDateOnly(), status: 'PRESENT' } }),
  ]);

  return { contractorCount, supervisorCount, workerCount, presentTodayCount };
}

module.exports = { getCounts };
