const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const generateCode = require('../utils/codeGenerator');
const { fromToRange } = require('../utils/dateRange');
const { scopedContractorId: resolveScope } = require('../utils/scope');
const recordAudit = require('../utils/auditLog');

const summaryInclude = {
  contractor: { select: { contractorName: true, contractorCode: true } },
  designation: { select: { designationName: true } },
  labourCategory: { select: { categoryName: true, ratePerDay: true } },
};

async function list(user, { search, status, contractorId, from, to, page = 1, limit = 20 }) {
  page = Number(page) || 1;
  limit = Number(limit) || 20;
  const scopedContractorId = await resolveScope(user);
  const where = {
    ...(status ? { status } : {}),
    ...(contractorId ? { contractorId } : {}),
    ...(scopedContractorId ? { contractorId: scopedContractorId } : {}),
    ...(from || to ? { joinDate: fromToRange(from, to) } : {}),
    ...(search
      ? {
          OR: [
            { firstName: { contains: search, mode: 'insensitive' } },
            { lastName: { contains: search, mode: 'insensitive' } },
            { workerCode: { contains: search, mode: 'insensitive' } },
            { mobileNo: { contains: search, mode: 'insensitive' } },
            { idNumber: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.worker.findMany({
      where,
      include: summaryInclude,
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.worker.count({ where }),
  ]);

  return { data, total, page: Number(page), limit: Number(limit) };
}

async function getById(id, user) {
  const worker = await prisma.worker.findUnique({
    where: { id },
    include: { contractor: true, designation: true, labourCategory: true },
  });
  if (!worker) throw new ApiError(404, 'Worker not found');

  const scopedContractorId = await resolveScope(user);
  if (scopedContractorId && worker.contractorId !== scopedContractorId) {
    throw new ApiError(404, 'Worker not found');
  }

  return worker;
}

async function create(data, user) {
  const scopedContractorId = await resolveScope(user);
  if (scopedContractorId) data.contractorId = scopedContractorId;

  const workerCode = await generateCode('worker');
  const worker = await prisma.worker.create({ data: { ...data, workerCode } });
  await recordAudit({
    userId: user.id,
    action: 'CREATE_WORKER',
    entityType: 'Worker',
    entityId: worker.id,
    contractorId: worker.contractorId,
    newValue: worker,
  });
  return worker;
}

async function update(id, data, user) {
  const before = await getById(id, user);
  const worker = await prisma.worker.update({ where: { id }, data });
  await recordAudit({
    userId: user.id,
    action: 'UPDATE_WORKER',
    entityType: 'Worker',
    entityId: id,
    contractorId: worker.contractorId,
    oldValue: before,
    newValue: worker,
  });
  return worker;
}

async function updateStatus(id, status, user) {
  await getById(id, user);
  return prisma.worker.update({ where: { id }, data: { status } });
}

async function search(term, contractorId, user) {
  const scopedContractorId = await resolveScope(user);
  return prisma.worker.findMany({
    where: {
      status: 'ACTIVE',
      ...(contractorId ? { contractorId } : {}),
      ...(scopedContractorId ? { contractorId: scopedContractorId } : {}),
      OR: [
        { workerCode: { contains: term, mode: 'insensitive' } },
        { firstName: { contains: term, mode: 'insensitive' } },
        { lastName: { contains: term, mode: 'insensitive' } },
      ],
    },
    select: {
      id: true,
      workerCode: true,
      firstName: true,
      lastName: true,
      contractor: { select: { contractorName: true } },
      designation: { select: { designationName: true } },
    },
    take: 20,
  });
}

async function findByQrCode(qrCodeData, user) {
  const idCard = await prisma.idCard.findFirst({
    where: { qrCodeData },
    orderBy: { issueDate: 'desc' },
    include: {
      worker: { select: { id: true, workerCode: true, firstName: true, lastName: true, status: true, contractorId: true, contractor: { select: { contractorName: true } }, designation: { select: { designationName: true } } } },
    },
  });
  if (!idCard) throw new ApiError(404, 'No worker found for this QR code');

  const scopedContractorId = await resolveScope(user);
  if (scopedContractorId && idCard.worker.contractorId !== scopedContractorId) {
    throw new ApiError(404, 'No worker found for this QR code');
  }

  return idCard.worker;
}

module.exports = { list, getById, create, update, updateStatus, search, findByQrCode };
