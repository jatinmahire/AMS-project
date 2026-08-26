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
    ...(month ? { otDate: monthRange(month) } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.overtime.findMany({
      where,
      include: { worker: { select: { workerCode: true, firstName: true, lastName: true, contractor: { select: { contractorName: true } } } } },
      orderBy: { otDate: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.overtime.count({ where }),
  ]);

  return { data, total, page: Number(page), limit: Number(limit) };
}

async function getById(id) {
  const overtime = await prisma.overtime.findUnique({ where: { id }, include: { worker: true } });
  if (!overtime) throw new ApiError(404, 'Overtime record not found');
  return overtime;
}

async function create(data) {
  const otEarnings = Number((data.hoursWorked * data.otWageRate).toFixed(2));
  return prisma.overtime.create({ data: { ...data, otEarnings } });
}

async function update(id, data, userId) {
  const before = await prisma.overtime.findUnique({ where: { id } });
  if (!before) throw new ApiError(404, 'Overtime record not found');
  const otEarnings = Number((data.hoursWorked * data.otWageRate).toFixed(2));

  return prisma.$transaction(async (tx) => {
    const result = await tx.overtime.update({ where: { id }, data: { ...data, otEarnings } });
    await recordAudit({ userId, action: 'UPDATE', entityType: 'Overtime', entityId: id, oldValue: before, newValue: result }, tx);
    return result;
  });
}

async function remove(id, userId) {
  const before = await prisma.overtime.findUnique({ where: { id } });
  if (!before) throw new ApiError(404, 'Overtime record not found');
  return prisma.$transaction(async (tx) => {
    await tx.overtime.delete({ where: { id } });
    await recordAudit({ userId, action: 'DELETE', entityType: 'Overtime', entityId: id, oldValue: before, newValue: null }, tx);
  });
}

module.exports = { list, getById, create, update, remove };
