const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const recordAudit = require('../utils/auditLog');

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function dayOf(date) {
  return DAYS[new Date(date).getUTCDay()];
}

async function list({ date, workerId, contractorId, page = 1, limit = 50 }) {
  page = Number(page) || 1;
  limit = Number(limit) || 50;
  const where = {
    ...(date ? { date: new Date(date) } : {}),
    ...(workerId ? { workerId } : {}),
    ...(contractorId ? { worker: { contractorId } } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.attendance.findMany({
      where,
      include: {
        worker: { select: { workerCode: true, firstName: true, lastName: true, contractor: { select: { contractorName: true } } } },
      },
      orderBy: { date: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.attendance.count({ where }),
  ]);

  return { data, total, page: Number(page), limit: Number(limit) };
}

async function getById(id) {
  const attendance = await prisma.attendance.findUnique({ where: { id }, include: { worker: true } });
  if (!attendance) throw new ApiError(404, 'Attendance record not found');
  return attendance;
}

async function create(data, userId) {
  const existing = await prisma.attendance.findUnique({
    where: { workerId_date: { workerId: data.workerId, date: data.date } },
  });
  if (existing) {
    throw new ApiError(409, 'Attendance is already marked for this worker on this date', {
      date: 'Attendance already exists for this date',
    });
  }

  return prisma.attendance.create({
    data: {
      ...data,
      day: dayOf(data.date),
      source: 'MANUAL',
      markedByUserId: userId,
    },
  });
}

async function update(id, data, userId) {
  const before = await prisma.attendance.findUnique({ where: { id } });
  if (!before) throw new ApiError(404, 'Attendance record not found');

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.attendance.update({
      where: { id },
      data: { ...data, day: dayOf(data.date) },
    });
    await recordAudit(
      {
        userId,
        action: 'UPDATE',
        entityType: 'Attendance',
        entityId: id,
        oldValue: before,
        newValue: result,
      },
      tx
    );
    return result;
  });

  return updated;
}

module.exports = { list, getById, create, update };
