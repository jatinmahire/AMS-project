const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const { monthRange, fromToRange } = require('../utils/dateRange');
const { scopedContractorId: resolveScope } = require('../utils/scope');
const { TITLE_BAR_TEXT, LEGAL_BOILERPLATE_MARATHI } = require('../templates/form90Marathi');

async function getWorkerByCode(workerCode) {
  const worker = await prisma.worker.findUnique({
    where: { workerCode },
    include: { contractor: true, designation: true, labourCategory: true },
  });
  if (!worker) throw new ApiError(404, `No worker found with code ${workerCode}`);
  return worker;
}

async function getIdCard(workerCode) {
  const worker = await getWorkerByCode(workerCode);
  const idCard = await prisma.idCard.findFirst({
    where: { workerId: worker.id },
    orderBy: { issueDate: 'desc' },
  });
  return { worker, idCard };
}

async function generateIdCard(workerId, validityMonths) {
  const worker = await prisma.worker.findUnique({ where: { id: workerId } });
  if (!worker) throw new ApiError(404, 'Worker not found');

  const issueDate = new Date();
  const expiryDate = new Date(issueDate);
  expiryDate.setMonth(expiryDate.getMonth() + validityMonths);

  return prisma.idCard.create({
    data: {
      workerId,
      contractorId: worker.contractorId,
      validityMonths,
      issueDate,
      expiryDate,
      qrCodeData: worker.workerCode,
    },
  });
}

const DAY_MS = 24 * 60 * 60 * 1000;

async function generateForm90ReferenceNo() {
  const year = new Date().getFullYear();
  const prefix = `F90/${year}/`;
  const existing = await prisma.complianceTracker.findMany({
    where: { form90ReferenceNo: { startsWith: prefix } },
    select: { form90ReferenceNo: true },
  });
  const maxSeq = existing.reduce((max, row) => {
    const seq = parseInt(row.form90ReferenceNo.slice(prefix.length), 10);
    return Number.isNaN(seq) ? max : Math.max(max, seq);
  }, 0);
  return `${prefix}${String(maxSeq + 1).padStart(3, '0')}`;
}

async function calculateCompliance(workerCode, user) {
  const worker = await getWorkerByCode(workerCode);

  const scopedContractorId = await resolveScope(user);
  if (scopedContractorId && worker.contractorId !== scopedContractorId) {
    throw new ApiError(404, `No worker found with code ${workerCode}`);
  }

  const latest = await prisma.attendance.findFirst({
    where: { workerId: worker.id },
    orderBy: { date: 'desc' },
  });

  let continuousDaysCount = 0;

  if (latest) {
    const attendances = await prisma.attendance.findMany({
      where: { workerId: worker.id },
      select: { date: true, status: true },
    });
    const byDate = new Map(attendances.map((a) => [a.date.toISOString().slice(0, 10), a.status]));

    let cursor = new Date(latest.date);
    while (byDate.get(cursor.toISOString().slice(0, 10)) === 'PRESENT') {
      continuousDaysCount += 1;
      cursor = new Date(cursor.getTime() - DAY_MS);
    }
  }

  const existingTracker = await prisma.complianceTracker.findUnique({ where: { workerId: worker.id } });
  const referenceFields = existingTracker?.form90ReferenceNo
    ? {}
    : { form90ReferenceNo: await generateForm90ReferenceNo(), form90ReferenceDate: new Date() };

  const tracker = await prisma.complianceTracker.upsert({
    where: { workerId: worker.id },
    update: {
      continuousDaysCount,
      lastCalculatedDate: new Date(),
      form90Generated: true,
      form90GeneratedAt: new Date(),
      ...referenceFields,
    },
    create: {
      workerId: worker.id,
      contractorId: worker.contractorId,
      continuousDaysCount,
      lastCalculatedDate: new Date(),
      form90Generated: true,
      form90GeneratedAt: new Date(),
      ...referenceFields,
    },
  });

  return { worker, tracker, legalText: LEGAL_BOILERPLATE_MARATHI, titleBarText: TITLE_BAR_TEXT };
}

async function form90History(user, { contractorId, from, to, page = 1, limit = 20 }) {
  page = Number(page) || 1;
  limit = Number(limit) || 20;

  const scopedContractorId = await resolveScope(user);
  const effectiveContractorId = scopedContractorId || contractorId;

  const where = {
    form90Generated: true,
    ...(effectiveContractorId ? { contractorId: effectiveContractorId } : {}),
    ...(from || to ? { form90GeneratedAt: fromToRange(from, to) } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.complianceTracker.findMany({
      where,
      include: {
        worker: { select: { workerCode: true, firstName: true, lastName: true } },
        contractor: { select: { contractorName: true } },
      },
      orderBy: { form90GeneratedAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.complianceTracker.count({ where }),
  ]);

  return { data, total, page, limit };
}

const STATUTORY_MODELS = {
  advance: { model: 'advance', dateField: 'advanceDate' },
  accident: { model: 'accident', dateField: 'accidentDate' },
  damage: { model: 'damage', dateField: 'damageDate' },
  fine: { model: 'fine', dateField: 'offenceDate' },
  overtime: { model: 'overtime', dateField: 'otDate' },
};

async function statutoryRegister(type, { contractorId, month }) {
  const config = STATUTORY_MODELS[type];
  if (!config) throw new ApiError(400, 'Unknown register type');

  const where = {
    ...(contractorId ? { worker: { contractorId } } : {}),
    ...(month ? { [config.dateField]: monthRange(month) } : {}),
  };

  return prisma[config.model].findMany({
    where,
    include: {
      worker: {
        select: {
          workerCode: true,
          firstName: true,
          lastName: true,
          gender: true,
          designation: { select: { designationName: true } },
          contractor: { select: { contractorName: true } },
        },
      },
      ...(type === 'advance' ? { repayments: { orderBy: { installmentNo: 'asc' } } } : {}),
    },
    orderBy: { [config.dateField]: 'desc' },
  });
}

module.exports = { getIdCard, generateIdCard, calculateCompliance, form90History, statutoryRegister };
