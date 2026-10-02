const prisma = require('../config/db');
const { scopedContractorId } = require('../utils/scope');
const { buildAuditMessage, actorLabel } = require('../utils/auditMessage');
const { fromToRange } = require('../utils/dateRange');

function todayDateOnly() {
  const now = new Date();
  return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), now.getUTCDate()));
}

async function getCounts() {
  const [contractorCount, supervisorCount, workerCount, presentTodayCount] = await Promise.all([
    prisma.contractor.count(),
    prisma.supervisor.count(),
    prisma.worker.count(),
    prisma.attendance.count({ where: { date: todayDateOnly(), status: 'PRESENT' } }),
  ]);

  return { contractorCount, supervisorCount, workerCount, presentTodayCount };
}

const LICENSE_FIELDS = [
  { field: 'shopActExpiryDate', label: 'Shop Act license' },
  { field: 'labourLicenseExpiry', label: 'Labour license' },
  { field: 'wcExpiryDate', label: 'WC policy' },
  { field: 'bocwExpiryDate', label: 'BOCW registration' },
];

const EXPIRY_WARNING_DAYS = 30;
const COMPLIANCE_WARNING_THRESHOLD = 80;

async function getAlerts() {
  const alerts = [];
  const today = todayDateOnly();
  const warningDate = new Date(today.getTime() + EXPIRY_WARNING_DAYS * 24 * 60 * 60 * 1000);

  const workersMissingKyc = await prisma.worker.findMany({
    where: {
      status: 'ACTIVE',
      OR: [{ idFrontUrl: null }, { idBackUrl: null }, { photoUrl: null }],
    },
    select: { id: true, workerCode: true, firstName: true, lastName: true },
  });
  for (const worker of workersMissingKyc) {
    alerts.push({
      type: 'MISSING_KYC',
      message: `${worker.firstName} ${worker.lastName} (${worker.workerCode}) has incomplete KYC documents`,
      entityId: worker.id,
      entityType: 'worker',
    });
  }

  const contractors = await prisma.contractor.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true, contractorName: true, ...Object.fromEntries(LICENSE_FIELDS.map((f) => [f.field, true])) },
  });
  for (const contractor of contractors) {
    for (const { field, label } of LICENSE_FIELDS) {
      const expiryDate = contractor[field];
      if (!expiryDate) continue;
      if (expiryDate < today) {
        alerts.push({
          type: 'LICENSE_EXPIRED',
          message: `${contractor.contractorName}'s ${label} expired on ${expiryDate.toISOString().slice(0, 10)}`,
          entityId: contractor.id,
          entityType: 'contractor',
        });
      } else if (expiryDate <= warningDate) {
        alerts.push({
          type: 'LICENSE_EXPIRING',
          message: `${contractor.contractorName}'s ${label} expires on ${expiryDate.toISOString().slice(0, 10)}`,
          entityId: contractor.id,
          entityType: 'contractor',
        });
      }
    }
  }

  const approachingCompliance = await prisma.complianceTracker.findMany({
    where: { continuousDaysCount: { gte: COMPLIANCE_WARNING_THRESHOLD, lt: 90 } },
    include: { worker: { select: { id: true, workerCode: true, firstName: true, lastName: true } } },
  });
  for (const tracker of approachingCompliance) {
    alerts.push({
      type: 'COMPLIANCE_APPROACHING',
      message: `${tracker.worker.firstName} ${tracker.worker.lastName} (${tracker.worker.workerCode}) is at ${tracker.continuousDaysCount} continuous days — approaching the 90-day threshold`,
      entityId: tracker.worker.id,
      entityType: 'worker',
    });
  }

  return alerts;
}

async function getSupervisorCounts(user) {
  const supervisor = await prisma.supervisor.findUnique({ where: { id: user.supervisorId } });
  const contractorId = supervisor?.assignedContractorId;

  if (!contractorId) {
    return { assignedWorkerCount: 0, activeTodayCount: 0 };
  }

  const [assignedWorkerCount, activeTodayCount] = await Promise.all([
    prisma.worker.count({ where: { contractorId, status: 'ACTIVE' } }),
    prisma.attendance.count({
      where: { date: todayDateOnly(), status: 'PRESENT', worker: { contractorId } },
    }),
  ]);

  return { assignedWorkerCount, activeTodayCount };
}

async function getContractorCounts(user) {
  const contractorId = await scopedContractorId(user);

  if (!contractorId) {
    return { totalWorkerCount: 0, presentTodayCount: 0 };
  }

  const [totalWorkerCount, presentTodayCount] = await Promise.all([
    prisma.worker.count({ where: { contractorId } }),
    prisma.attendance.count({
      where: { date: todayDateOnly(), status: 'PRESENT', worker: { contractorId } },
    }),
  ]);

  return { totalWorkerCount, presentTodayCount };
}

function toActivityRow(log) {
  return {
    id: log.id,
    action: log.action,
    entityType: log.entityType,
    entityId: log.entityId,
    message: buildAuditMessage(log),
    actor: actorLabel(log.user),
    timestamp: log.timestamp,
  };
}

async function getRecentActivity(user, limit = 15) {
  const contractorId = await scopedContractorId(user);
  const logs = await prisma.auditLog.findMany({
    where: { ...(contractorId ? { contractorId } : {}) },
    include: { user: { select: { fullName: true, loginId: true, role: true } } },
    orderBy: { timestamp: 'desc' },
    take: Number(limit) || 15,
  });

  return logs.map(toActivityRow);
}

async function listActivity(user, { action, from, to, page = 1, limit = 20 }) {
  page = Number(page) || 1;
  limit = Number(limit) || 20;
  const contractorId = await scopedContractorId(user);
  const where = {
    ...(contractorId ? { contractorId } : {}),
    ...(action ? { action } : {}),
    ...(from || to ? { timestamp: fromToRange(from, to) } : {}),
  };

  const [logs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: { user: { select: { fullName: true, loginId: true, role: true } } },
      orderBy: { timestamp: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { data: logs.map(toActivityRow), total, page, limit };
}

const DAY_MS = 24 * 60 * 60 * 1000;

function overviewRange(range) {
  const today = todayDateOnly();
  if (range === 'yesterday') {
    const day = new Date(today.getTime() - DAY_MS);
    return { from: day, to: day };
  }
  if (range === 'week') {
    return { from: new Date(today.getTime() - 6 * DAY_MS), to: today };
  }
  return { from: today, to: today };
}

// Rounds to whole percentages that always add up to exactly 100 (largest-remainder),
// so the gauge arcs and the list beneath it never disagree.
function percentagesOf(counts) {
  const sum = counts.reduce((a, b) => a + b, 0);
  if (sum === 0) return counts.map(() => 0);
  const raw = counts.map((c) => (c / sum) * 100);
  const floors = raw.map(Math.floor);
  let remainder = 100 - floors.reduce((a, b) => a + b, 0);
  raw
    .map((value, index) => ({ index, frac: value - Math.floor(value) }))
    .sort((a, b) => b.frac - a.frac)
    .forEach(({ index }) => {
      if (remainder > 0) {
        floors[index] += 1;
        remainder -= 1;
      }
    });
  return floors;
}

async function getAttendanceOverview(user, range = 'today') {
  const key = ['today', 'yesterday', 'week'].includes(range) ? range : 'today';
  const { from, to } = overviewRange(key);
  const contractorId = await scopedContractorId(user);
  const workerScope = contractorId ? { worker: { contractorId } } : {};

  const [byStatus, overtimeRows] = await Promise.all([
    prisma.attendance.groupBy({
      by: ['status'],
      where: { date: { gte: from, lte: to }, ...workerScope },
      _count: { _all: true },
    }),
    prisma.overtime.findMany({
      where: { otDate: { gte: from, lt: new Date(to.getTime() + DAY_MS) }, ...workerScope },
      select: { workerId: true, otDate: true },
    }),
  ]);

  const countOf = (status) => byStatus.find((row) => row.status === status)?._count._all || 0;
  const present = countOf('PRESENT');
  const absent = countOf('ABSENT');
  const total = byStatus.reduce((sum, row) => sum + row._count._all, 0);
  const overtime = new Set(overtimeRows.map((row) => `${row.workerId}|${row.otDate.toISOString().slice(0, 10)}`)).size;

  const counts = [present, absent, overtime];
  const [presentPct, absentPct, overtimePct] = percentagesOf(counts);

  return {
    range: key,
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
    total,
    segments: [
      { key: 'present', label: 'Present', count: present, percent: presentPct },
      { key: 'absent', label: 'Absent', count: absent, percent: absentPct },
      { key: 'overtime', label: 'Overtime', count: overtime, percent: overtimePct },
    ],
  };
}

const RECENT_REGISTRATIONS_LIMIT = 8;

function toRegistrationRow(type, row) {
  const base = { type, createdAt: row.createdAt, photoUrl: null };
  if (type === 'WORKER') {
    return { ...base, id: row.id, code: row.workerCode, name: `${row.firstName} ${row.lastName}`, photoUrl: row.photoUrl };
  }
  if (type === 'CONTRACTOR') {
    return { ...base, id: row.id, code: row.contractorCode, name: row.contractorName };
  }
  return { ...base, id: row.id, code: row.supervisorCode, name: row.fullName };
}

async function getRecentRegistrations(type = 'ALL') {
  const take = RECENT_REGISTRATIONS_LIMIT;

  if (type === 'WORKER') {
    const rows = await prisma.worker.findMany({
      orderBy: { createdAt: 'desc' },
      take,
      select: { id: true, workerCode: true, firstName: true, lastName: true, photoUrl: true, createdAt: true },
    });
    return rows.map((r) => toRegistrationRow('WORKER', r));
  }
  if (type === 'CONTRACTOR') {
    const rows = await prisma.contractor.findMany({
      orderBy: { createdAt: 'desc' },
      take,
      select: { id: true, contractorCode: true, contractorName: true, createdAt: true },
    });
    return rows.map((r) => toRegistrationRow('CONTRACTOR', r));
  }
  if (type === 'SUPERVISOR') {
    const rows = await prisma.supervisor.findMany({
      orderBy: { createdAt: 'desc' },
      take,
      select: { id: true, supervisorCode: true, fullName: true, createdAt: true },
    });
    return rows.map((r) => toRegistrationRow('SUPERVISOR', r));
  }

  const [workers, contractors, supervisors] = await Promise.all([
    prisma.worker.findMany({
      orderBy: { createdAt: 'desc' },
      take,
      select: { id: true, workerCode: true, firstName: true, lastName: true, photoUrl: true, createdAt: true },
    }),
    prisma.contractor.findMany({
      orderBy: { createdAt: 'desc' },
      take,
      select: { id: true, contractorCode: true, contractorName: true, createdAt: true },
    }),
    prisma.supervisor.findMany({
      orderBy: { createdAt: 'desc' },
      take,
      select: { id: true, supervisorCode: true, fullName: true, createdAt: true },
    }),
  ]);

  const merged = [
    ...workers.map((r) => toRegistrationRow('WORKER', r)),
    ...contractors.map((r) => toRegistrationRow('CONTRACTOR', r)),
    ...supervisors.map((r) => toRegistrationRow('SUPERVISOR', r)),
  ];

  return merged.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, take);
}

module.exports = {
  getCounts,
  getAlerts,
  getSupervisorCounts,
  getContractorCounts,
  getRecentActivity,
  listActivity,
  getRecentRegistrations,
  getAttendanceOverview,
};
