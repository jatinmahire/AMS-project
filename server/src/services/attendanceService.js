const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const recordAudit = require('../utils/auditLog');
const { getWorkerAuditInfo } = require('../utils/workerAuditInfo');
const { scopedContractorId: resolveScope } = require('../utils/scope');

const DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

function dayOf(date) {
  return DAYS[new Date(date).getUTCDay()];
}

async function list(user, { date, workerId, contractorId, page = 1, limit = 50 }) {
  page = Number(page) || 1;
  limit = Number(limit) || 50;
  const scopedContractorId = await resolveScope(user);
  const where = {
    ...(date ? { date: new Date(date) } : {}),
    ...(workerId ? { workerId } : {}),
    ...(contractorId ? { worker: { contractorId } } : {}),
    ...(scopedContractorId ? { worker: { contractorId: scopedContractorId } } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.attendance.findMany({
      where,
      include: {
        worker: { select: { workerCode: true, firstName: true, lastName: true, contractor: { select: { contractorName: true } } } },
        markedByUser: { select: { fullName: true, loginId: true, role: true } },
      },
      orderBy: { date: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.attendance.count({ where }),
  ]);

  return { data, total, page: Number(page), limit: Number(limit) };
}

async function getById(id, user) {
  const attendance = await prisma.attendance.findUnique({
    where: { id },
    include: { worker: true, markedByUser: { select: { fullName: true, loginId: true, role: true } } },
  });
  if (!attendance) throw new ApiError(404, 'Attendance record not found');

  const scopedContractorId = await resolveScope(user);
  if (scopedContractorId && attendance.worker.contractorId !== scopedContractorId) {
    throw new ApiError(404, 'Attendance record not found');
  }

  return attendance;
}

async function assertWorkerInScope(workerId, scopedContractorId) {
  if (!scopedContractorId) return;
  const worker = await prisma.worker.findUnique({ where: { id: workerId }, select: { contractorId: true } });
  if (!worker || worker.contractorId !== scopedContractorId) {
    throw new ApiError(404, 'Worker not found');
  }
}

async function create(data, userId, user) {
  const scopedContractorId = await resolveScope(user);
  await assertWorkerInScope(data.workerId, scopedContractorId);

  const existing = await prisma.attendance.findUnique({
    where: { workerId_date: { workerId: data.workerId, date: data.date } },
  });
  if (existing) {
    throw new ApiError(409, 'Attendance is already marked for this worker on this date', {
      date: 'Attendance already exists for this date',
    });
  }

  const worker = await getWorkerAuditInfo(data.workerId);

  return prisma.$transaction(async (tx) => {
    const result = await tx.attendance.create({
      data: {
        ...data,
        day: dayOf(data.date),
        source: 'MANUAL',
        markedByUserId: userId,
      },
    });
    await recordAudit(
      {
        userId,
        action: 'CREATE_ATTENDANCE',
        entityType: 'Attendance',
        entityId: result.id,
        contractorId: worker.contractorId,
        newValue: { ...result, worker },
      },
      tx
    );
    return result;
  });
}

async function update(id, data, userId, user) {
  const before = await prisma.attendance.findUnique({ where: { id }, include: { worker: true } });
  if (!before) throw new ApiError(404, 'Attendance record not found');

  const scopedContractorId = await resolveScope(user);
  if (scopedContractorId && before.worker.contractorId !== scopedContractorId) {
    throw new ApiError(404, 'Attendance record not found');
  }
  if (data.workerId) await assertWorkerInScope(data.workerId, scopedContractorId);

  const worker = await getWorkerAuditInfo(before.workerId);

  const updated = await prisma.$transaction(async (tx) => {
    const result = await tx.attendance.update({
      where: { id },
      data: { ...data, day: dayOf(data.date) },
    });
    await recordAudit(
      {
        userId,
        action: 'UPDATE_ATTENDANCE',
        entityType: 'Attendance',
        entityId: id,
        contractorId: worker.contractorId,
        oldValue: { ...before, worker },
        newValue: { ...result, worker },
      },
      tx
    );
    return result;
  });

  return updated;
}

function todayDateOnly() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

function nowTimeString() {
  const now = new Date();
  return `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;
}

function workerSummary(worker) {
  return { name: `${worker.firstName} ${worker.lastName}`, code: worker.workerCode, photoUrl: worker.photoUrl };
}

// Accepts the new "AMS:<workerCode>" format and, for backward compatibility, a bare
// workerCode (the format older-generated ID cards may still carry).
function extractWorkerCode(raw) {
  const text = String(raw || '').trim();
  const prefixed = /^AMS:(.+)$/i.exec(text);
  if (prefixed) return prefixed[1].trim();
  if (/^WRK\d+$/i.test(text)) return text;
  return null;
}

async function scan(code, userId, user) {
  const workerCode = extractWorkerCode(code);
  if (!workerCode) throw new ApiError(400, 'Not a valid AMS QR code');

  const worker = await prisma.worker.findFirst({ where: { workerCode: { equals: workerCode, mode: 'insensitive' } } });
  const scopedContractorId = await resolveScope(user);
  if (!worker || (scopedContractorId && worker.contractorId !== scopedContractorId)) {
    throw new ApiError(404, 'Worker not found or not under your contractor');
  }

  if (worker.status !== 'ACTIVE') {
    return { action: 'INACTIVE', worker: workerSummary(worker) };
  }

  const date = todayDateOnly();
  const existing = await prisma.attendance.findUnique({ where: { workerId_date: { workerId: worker.id, date } } });

  if (!existing) {
    await prisma.$transaction(async (tx) => {
      const result = await tx.attendance.create({
        data: { workerId: worker.id, date, day: dayOf(date), inTime: nowTimeString(), status: 'PRESENT', source: 'QR_SCAN', markedByUserId: userId },
      });
      await recordAudit(
        { userId, action: 'CREATE_ATTENDANCE', entityType: 'Attendance', entityId: result.id, contractorId: worker.contractorId, newValue: { ...result, worker } },
        tx
      );
    });
    return { action: 'CHECK_IN', worker: workerSummary(worker) };
  }

  if (!existing.outTime) {
    await prisma.$transaction(async (tx) => {
      const result = await tx.attendance.update({ where: { id: existing.id }, data: { outTime: nowTimeString() } });
      await recordAudit(
        {
          userId,
          action: 'UPDATE_ATTENDANCE',
          entityType: 'Attendance',
          entityId: existing.id,
          contractorId: worker.contractorId,
          oldValue: { ...existing, worker },
          newValue: { ...result, worker },
        },
        tx
      );
    });
    return { action: 'CHECK_OUT', worker: workerSummary(worker) };
  }

  return { action: 'ALREADY_COMPLETE', worker: workerSummary(worker) };
}

module.exports = { list, getById, create, update, scan };
