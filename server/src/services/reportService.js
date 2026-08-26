const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const { monthRange } = require('../utils/dateRange');

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

async function calculateCompliance(workerCode) {
  const worker = await getWorkerByCode(workerCode);

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

  const tracker = await prisma.complianceTracker.upsert({
    where: { workerId: worker.id },
    update: {
      continuousDaysCount,
      lastCalculatedDate: new Date(),
      form90Generated: true,
      form90GeneratedAt: new Date(),
    },
    create: {
      workerId: worker.id,
      contractorId: worker.contractorId,
      continuousDaysCount,
      lastCalculatedDate: new Date(),
      form90Generated: true,
      form90GeneratedAt: new Date(),
    },
  });

  return { worker, tracker };
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
        select: { workerCode: true, firstName: true, lastName: true, contractor: { select: { contractorName: true } } },
      },
    },
    orderBy: { [config.dateField]: 'desc' },
  });
}

module.exports = { getIdCard, generateIdCard, calculateCompliance, statutoryRegister };
