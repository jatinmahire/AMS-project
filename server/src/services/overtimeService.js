const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const recordAudit = require('../utils/auditLog');
const { getWorkerAuditInfo } = require('../utils/workerAuditInfo');
const { fromToRange } = require('../utils/dateRange');

async function list({ contractorId, from, to, workerId, search, page = 1, limit = 50 }) {
  page = Number(page) || 1;
  limit = Number(limit) || 50;
  const where = {
    ...(workerId ? { workerId } : {}),
    ...(from || to ? { otDate: fromToRange(from, to) } : {}),
    ...(contractorId || search
      ? {
          worker: {
            ...(contractorId ? { contractorId } : {}),
            ...(search
              ? {
                  OR: [
                    { firstName: { contains: search, mode: 'insensitive' } },
                    { lastName: { contains: search, mode: 'insensitive' } },
                    { workerCode: { contains: search, mode: 'insensitive' } },
                  ],
                }
              : {}),
          },
        }
      : {}),
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

async function create(data, userId) {
  const otEarnings = Number((data.hoursWorked * data.otWageRate).toFixed(2));
  const worker = await getWorkerAuditInfo(data.workerId);
  return prisma.$transaction(async (tx) => {
    const result = await tx.overtime.create({ data: { ...data, otEarnings } });
    await recordAudit(
      { userId, action: 'CREATE_OVERTIME', entityType: 'Overtime', entityId: result.id, contractorId: worker.contractorId, newValue: { ...result, worker } },
      tx
    );
    return result;
  });
}

async function update(id, data, userId) {
  const before = await prisma.overtime.findUnique({ where: { id } });
  if (!before) throw new ApiError(404, 'Overtime record not found');
  const otEarnings = Number((data.hoursWorked * data.otWageRate).toFixed(2));
  const worker = await getWorkerAuditInfo(before.workerId);

  return prisma.$transaction(async (tx) => {
    const result = await tx.overtime.update({ where: { id }, data: { ...data, otEarnings } });
    await recordAudit(
      { userId, action: 'UPDATE_OVERTIME', entityType: 'Overtime', entityId: id, contractorId: worker.contractorId, oldValue: { ...before, worker }, newValue: { ...result, worker } },
      tx
    );
    return result;
  });
}

async function remove(id, userId) {
  const before = await prisma.overtime.findUnique({ where: { id } });
  if (!before) throw new ApiError(404, 'Overtime record not found');
  const worker = await getWorkerAuditInfo(before.workerId);
  return prisma.$transaction(async (tx) => {
    await tx.overtime.delete({ where: { id } });
    await recordAudit(
      { userId, action: 'DELETE_OVERTIME', entityType: 'Overtime', entityId: id, contractorId: worker.contractorId, oldValue: { ...before, worker }, newValue: null },
      tx
    );
  });
}

module.exports = { list, getById, create, update, remove };
