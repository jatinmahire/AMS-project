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
    ...(from || to ? { offenceDate: fromToRange(from, to) } : {}),
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

async function create(data, userId) {
  const worker = await getWorkerAuditInfo(data.workerId);
  return prisma.$transaction(async (tx) => {
    const result = await tx.fine.create({ data });
    await recordAudit(
      { userId, action: 'CREATE_FINE', entityType: 'Fine', entityId: result.id, contractorId: worker.contractorId, newValue: { ...result, worker } },
      tx
    );
    return result;
  });
}

async function update(id, data, userId) {
  const before = await prisma.fine.findUnique({ where: { id } });
  if (!before) throw new ApiError(404, 'Fine record not found');
  const worker = await getWorkerAuditInfo(before.workerId);
  return prisma.$transaction(async (tx) => {
    const result = await tx.fine.update({ where: { id }, data });
    await recordAudit(
      { userId, action: 'UPDATE_FINE', entityType: 'Fine', entityId: id, contractorId: worker.contractorId, oldValue: { ...before, worker }, newValue: { ...result, worker } },
      tx
    );
    return result;
  });
}

async function remove(id, userId) {
  const before = await prisma.fine.findUnique({ where: { id } });
  if (!before) throw new ApiError(404, 'Fine record not found');
  const worker = await getWorkerAuditInfo(before.workerId);
  return prisma.$transaction(async (tx) => {
    await tx.fine.delete({ where: { id } });
    await recordAudit(
      { userId, action: 'DELETE_FINE', entityType: 'Fine', entityId: id, contractorId: worker.contractorId, oldValue: { ...before, worker }, newValue: null },
      tx
    );
  });
}

module.exports = { list, getById, create, update, remove };
