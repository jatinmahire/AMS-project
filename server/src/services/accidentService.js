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
    ...(from || to ? { accidentDate: fromToRange(from, to) } : {}),
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

async function create(data, userId) {
  const worker = await getWorkerAuditInfo(data.workerId);
  return prisma.$transaction(async (tx) => {
    const result = await tx.accident.create({ data });
    await recordAudit(
      { userId, action: 'CREATE_ACCIDENT', entityType: 'Accident', entityId: result.id, contractorId: worker.contractorId, newValue: { ...result, worker } },
      tx
    );
    return result;
  });
}

async function update(id, data, userId) {
  const before = await prisma.accident.findUnique({ where: { id } });
  if (!before) throw new ApiError(404, 'Accident record not found');
  const worker = await getWorkerAuditInfo(before.workerId);
  return prisma.$transaction(async (tx) => {
    const result = await tx.accident.update({ where: { id }, data });
    await recordAudit(
      { userId, action: 'UPDATE_ACCIDENT', entityType: 'Accident', entityId: id, contractorId: worker.contractorId, oldValue: { ...before, worker }, newValue: { ...result, worker } },
      tx
    );
    return result;
  });
}

async function remove(id, userId) {
  const before = await prisma.accident.findUnique({ where: { id } });
  if (!before) throw new ApiError(404, 'Accident record not found');
  const worker = await getWorkerAuditInfo(before.workerId);
  return prisma.$transaction(async (tx) => {
    await tx.accident.delete({ where: { id } });
    await recordAudit(
      { userId, action: 'DELETE_ACCIDENT', entityType: 'Accident', entityId: id, contractorId: worker.contractorId, oldValue: { ...before, worker }, newValue: null },
      tx
    );
  });
}

module.exports = { list, getById, create, update, remove };
