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
    ...(month ? { damageDate: monthRange(month) } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.damage.findMany({
      where,
      include: { worker: { select: { workerCode: true, firstName: true, lastName: true, contractor: { select: { contractorName: true } } } } },
      orderBy: { damageDate: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.damage.count({ where }),
  ]);

  return { data, total, page: Number(page), limit: Number(limit) };
}

async function getById(id) {
  const damage = await prisma.damage.findUnique({ where: { id }, include: { worker: true } });
  if (!damage) throw new ApiError(404, 'Damage record not found');
  return damage;
}

async function create(data) {
  return prisma.damage.create({ data });
}

async function update(id, data, userId) {
  const before = await prisma.damage.findUnique({ where: { id } });
  if (!before) throw new ApiError(404, 'Damage record not found');
  return prisma.$transaction(async (tx) => {
    const result = await tx.damage.update({ where: { id }, data });
    await recordAudit({ userId, action: 'UPDATE', entityType: 'Damage', entityId: id, oldValue: before, newValue: result }, tx);
    return result;
  });
}

async function remove(id, userId) {
  const before = await prisma.damage.findUnique({ where: { id } });
  if (!before) throw new ApiError(404, 'Damage record not found');
  return prisma.$transaction(async (tx) => {
    await tx.damage.delete({ where: { id } });
    await recordAudit({ userId, action: 'DELETE', entityType: 'Damage', entityId: id, oldValue: before, newValue: null }, tx);
  });
}

module.exports = { list, getById, create, update, remove };
