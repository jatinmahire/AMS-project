const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const { scopedContractorId } = require('../utils/scope');
const { dayRange } = require('../utils/dateRange');
const { LICENSE_EXPIRY_WINDOW_DAYS, COMPLIANCE_90_DAY_THRESHOLD } = require('../config/notificationConfig');

const LICENSE_FIELDS = [
  { field: 'shopActExpiryDate', label: 'Shop Act license' },
  { field: 'labourLicenseExpiry', label: 'Labour license' },
  { field: 'wcExpiryDate', label: 'WC policy' },
  { field: 'bocwExpiryDate', label: 'BOCW registration' },
];

const GATE_LOG_SCAN_WINDOW_DAYS = 30;

async function createIfNotExists({ type, message, entityType, entityId, contractorId }) {
  const existing = await prisma.notification.findFirst({ where: { type, entityId, entityType, isRead: false } });
  if (existing) return null;
  return prisma.notification.create({ data: { type, message, entityType, entityId, contractorId } });
}

async function checkKycMissing() {
  const workers = await prisma.worker.findMany({
    where: { status: 'ACTIVE', OR: [{ idFrontUrl: null }, { idBackUrl: null }, { photoUrl: null }] },
    select: { id: true, workerCode: true, firstName: true, lastName: true, contractorId: true },
  });
  for (const w of workers) {
    await createIfNotExists({
      type: 'KYC_MISSING',
      message: `${w.firstName} ${w.lastName} (${w.workerCode}) has incomplete KYC documents`,
      entityType: 'worker',
      entityId: w.id,
      contractorId: w.contractorId,
    });
  }
}

async function checkCompliance90Day() {
  const trackers = await prisma.complianceTracker.findMany({
    where: { continuousDaysCount: { gte: COMPLIANCE_90_DAY_THRESHOLD }, form90Generated: false },
    include: { worker: { select: { workerCode: true, firstName: true, lastName: true } } },
  });
  for (const t of trackers) {
    await createIfNotExists({
      type: 'COMPLIANCE_90_DAY',
      message: `${t.worker.firstName} ${t.worker.lastName} (${t.worker.workerCode}) has reached ${t.continuousDaysCount} continuous days — 90-Days Form not yet generated`,
      entityType: 'worker',
      entityId: t.workerId,
      contractorId: t.contractorId,
    });
  }
}

async function checkGateMismatch() {
  // Bounded to a recent window so this stays a fast daily check rather than
  // re-scanning the entire gate log history every run.
  const since = new Date(Date.now() - GATE_LOG_SCAN_WINDOW_DAYS * 24 * 60 * 60 * 1000);
  const gateLogs = await prisma.gateLog.findMany({
    where: { timestamp: { gte: since } },
    include: { worker: { select: { workerCode: true, firstName: true, lastName: true, contractorId: true } } },
  });

  for (const log of gateLogs) {
    const day = new Date(Date.UTC(log.timestamp.getUTCFullYear(), log.timestamp.getUTCMonth(), log.timestamp.getUTCDate()));
    const attendance = await prisma.attendance.findUnique({
      where: { workerId_date: { workerId: log.workerId, date: day } },
    });
    if (attendance) continue;

    await createIfNotExists({
      type: 'GATE_MISMATCH',
      message: `${log.worker.firstName} ${log.worker.lastName} (${log.worker.workerCode}) had a gate ${log.direction.toLowerCase()} entry on ${day.toISOString().slice(0, 10)} with no matching attendance record`,
      entityType: 'gateLog',
      entityId: log.id,
      contractorId: log.worker.contractorId,
    });
  }
}

async function checkLicenseExpiring() {
  const today = new Date();
  const warningDate = new Date(today.getTime() + LICENSE_EXPIRY_WINDOW_DAYS * 24 * 60 * 60 * 1000);

  const contractors = await prisma.contractor.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true, contractorName: true, ...Object.fromEntries(LICENSE_FIELDS.map((f) => [f.field, true])) },
  });
  for (const c of contractors) {
    for (const { field, label } of LICENSE_FIELDS) {
      const expiryDate = c[field];
      if (!expiryDate || expiryDate > warningDate) continue;
      await createIfNotExists({
        type: 'LICENSE_EXPIRING',
        message: `${c.contractorName}'s ${label} expires on ${expiryDate.toISOString().slice(0, 10)}`,
        entityType: 'contractor',
        entityId: c.id,
        contractorId: c.id,
      });
    }
  }

  const policies = await prisma.policy.findMany({
    where: { validDate: { lte: warningDate } },
    select: { id: true, policyName: true, validDate: true, contractorId: true, contractor: { select: { contractorName: true } } },
  });
  for (const p of policies) {
    await createIfNotExists({
      type: 'LICENSE_EXPIRING',
      message: `${p.contractor.contractorName}'s policy "${p.policyName}" expires on ${p.validDate.toISOString().slice(0, 10)}`,
      entityType: 'policy',
      entityId: p.id,
      contractorId: p.contractorId,
    });
  }
}

async function runNotificationChecks() {
  await checkKycMissing();
  await checkCompliance90Day();
  await checkGateMismatch();
  await checkLicenseExpiring();
}

async function list(user, { page = 1, limit = 20, isRead, date } = {}) {
  page = Number(page) || 1;
  limit = Number(limit) || 20;
  const scoped = await scopedContractorId(user);
  const where = {
    ...(scoped ? { contractorId: scoped } : {}),
    ...(isRead !== undefined && isRead !== '' ? { isRead: isRead === 'true' } : {}),
    ...(date === 'today' ? { createdAt: dayRange(new Date().toISOString().slice(0, 10)) } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.notification.findMany({
      where,
      include: { contractor: { select: { contractorName: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.notification.count({ where }),
  ]);

  return { data, total, page, limit };
}

async function markAsRead(id, user) {
  const notification = await prisma.notification.findUnique({ where: { id } });
  if (!notification) throw new ApiError(404, 'Notification not found');

  const scoped = await scopedContractorId(user);
  if (scoped && notification.contractorId !== scoped) {
    throw new ApiError(404, 'Notification not found');
  }

  return prisma.notification.update({ where: { id }, data: { isRead: true } });
}

async function markAllAsRead(user) {
  const scoped = await scopedContractorId(user);
  await prisma.notification.updateMany({
    where: { isRead: false, ...(scoped ? { contractorId: scoped } : {}) },
    data: { isRead: true },
  });
}

module.exports = { runNotificationChecks, list, markAsRead, markAllAsRead };
