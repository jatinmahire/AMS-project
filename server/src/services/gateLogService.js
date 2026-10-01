const prisma = require('../config/db');
const { fromToRange, dayRange } = require('../utils/dateRange');

async function list({ date, from, to, workerId, contractorId, page = 1, limit = 50 }) {
  page = Number(page) || 1;
  limit = Number(limit) || 50;
  const where = {
    ...(workerId ? { workerId } : {}),
    ...(contractorId ? { worker: { contractorId } } : {}),
    ...(date ? { timestamp: dayRange(date) } : from || to ? { timestamp: fromToRange(from, to) } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.gateLog.findMany({
      where,
      include: {
        worker: { select: { workerCode: true, firstName: true, lastName: true, contractor: { select: { contractorName: true } } } },
      },
      orderBy: { timestamp: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.gateLog.count({ where }),
  ]);

  return { data, total, page: Number(page), limit: Number(limit) };
}

async function create(data) {
  return prisma.gateLog.create({ data });
}

module.exports = { list, create };
