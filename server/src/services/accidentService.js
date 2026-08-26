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
    ...(month ? { accidentDate: monthRange(month) } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.accident.findMany({
      where,
      include: { worker: { select: { workerCode: true, firstName: true, lastName: true, contractor: { select: { contractorName: true } } } } },
      orderBy: { accidentDate: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.accident.count({ where }),
  ]);

  return { data, total, page: Number(page), limit: Number(limit) };
}

async function getById(id) {
  const accident = await prisma.accident.findUnique({ where: { id }, include: { worker: true } });
  if (!accident) throw new ApiError(404, 'Accident record not found');
  return accident;
}

async function create(data) {
  return prisma.accident.create({ data });
}

async function update(id, data, userId) {
  const before = await prisma.accident.findUnique({ where: { id } });
  if (!before) throw new ApiError(404, 'Accident record not found');
  return prisma.$transaction(async (tx) => {
    const result = await tx.accident.update({ where: { id }, data });
    await recordAudit({ userId, action: 'UPDATE', entityType: 'Accident', entityId: id, oldValue: before, newValue: result }, tx);
    return result;
  });
}

async function remove(id, userId) {
  const before = await prisma.accident.findUnique({ where: { id } });
  if (!before) throw new ApiError(404, 'Accident record not found');
  return prisma.$transaction(async (tx) => {
    await tx.accident.delete({ where: { id } });
    await recordAudit({ userId, action: 'DELETE', entityType: 'Accident', entityId: id, oldValue: before, newValue: null }, tx);
  });
}

module.exports = { list, getById, create, update, remove };
