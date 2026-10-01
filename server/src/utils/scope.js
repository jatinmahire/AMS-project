const prisma = require('../config/db');

async function scopedContractorId(user) {
  if (!user) return null;
  if (user.role === 'CONTRACTOR') return user.contractorId || null;
  if (user.role === 'SUPERVISOR') {
    const supervisor = await prisma.supervisor.findUnique({ where: { id: user.supervisorId } });
    return supervisor?.assignedContractorId || null;
  }
  return null;
}

module.exports = { scopedContractorId };
