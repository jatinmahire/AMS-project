const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const recordAudit = require('../utils/auditLog');
const { monthRange } = require('../utils/dateRange');

async function list({ contractorId, month, workerId, page = 1, limit = 50 }) {
  page = Number(page) || 1;
  limit = Number(limit) || 50;
  const where = {
    ...(workerId ? { workerId } : {}),
    ...(contractorId ? { worker: { contractorId } } : {}),
    ...(month ? { offenceDate: monthRange(month) } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.fine.findMany({
      where,
      include: { worker: { select: { workerCode: true, firstName: true, lastName: true, contractor: { select: { contractorName: true } } } } },
      orderBy: { offenceDate: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.fine.count({ where }),
  ]);

  return { data, total, page: Number(page), limit: Number(limit) };
}

async function getById(id) {
  const fine = await prisma.fine.findUnique({ where: { id }, include: { worker: true } });
  if (!fine) throw new ApiError(404, 'Fine record not found');
  return fine;
}

async function create(data) {
  return prisma.fine.create({ data });
}

async function update(id, data, userId) {
  const before = await prisma.fine.findUnique({ where: { id } });
  if (!before) throw new ApiError(404, 'Fine record not found');
  return prisma.$transaction(async (tx) => {
    const result = await tx.fine.update({ where: { id }, data });
    await recordAudit({ userId, action: 'UPDATE', entityType: 'Fine', entityId: id, oldValue: before, newValue: result }, tx);
    return result;
  });
}

async function remove(id, userId) {
  const before = await prisma.fine.findUnique({ where: { id } });
  if (!before) throw new ApiError(404, 'Fine record not found');
  return prisma.$transaction(async (tx) => {
    await tx.fine.delete({ where: { id } });
    await recordAudit({ userId, action: 'DELETE', entityType: 'Fine', entityId: id, oldValue: before, newValue: null }, tx);
  });
}

module.exports = { list, getById, create, update, remove };
