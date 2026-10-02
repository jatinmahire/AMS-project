const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const { scopedContractorId: resolveScope } = require('../utils/scope');
const { STATUSES_BY_TYPE } = require('../validators/verificationValidator');

const TYPES = Object.keys(STATUSES_BY_TYPE);
const DECIDED = ['VERIFIED', 'REJECTED'];
const verifiedBySelect = { select: { fullName: true, loginId: true, role: true } };

function assertType(type) {
  if (!TYPES.includes(type)) throw new ApiError(400, `Unknown verification type: ${type}`);
}

async function assertContractorScope(worker, user) {
  const scopedContractorId = await resolveScope(user);
  if (scopedContractorId && worker.contractorId !== scopedContractorId) {
    throw new ApiError(404, 'Worker not found');
  }
}

// Every worker gets a row even without a WorkerVerification record yet — those display as
// PENDING, matching how the list should look on a fresh install with no attestations done.
async function listByType(type, user, { status, contractorId, search, page = 1, limit = 20 }) {
  assertType(type);
  page = Number(page) || 1;
  limit = Number(limit) || 20;
  const scopedContractorId = await resolveScope(user);

  const workers = await prisma.worker.findMany({
    where: {
      ...(contractorId ? { contractorId } : {}),
      ...(scopedContractorId ? { contractorId: scopedContractorId } : {}),
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
    select: { id: true, workerCode: true, firstName: true, lastName: true, contractor: { select: { contractorName: true } } },
    orderBy: { workerCode: 'asc' },
  });

  const verifications = await prisma.workerVerification.findMany({
    where: { type, workerId: { in: workers.map((w) => w.id) } },
    include: { verifiedByUser: verifiedBySelect },
  });
  const byWorkerId = new Map(verifications.map((v) => [v.workerId, v]));

  let merged = workers.map((w) => {
    const v = byWorkerId.get(w.id);
    return {
      workerId: w.id,
      workerCode: w.workerCode,
      workerName: `${w.firstName} ${w.lastName}`,
      contractorName: w.contractor?.contractorName || '-',
      status: v?.status || 'PENDING',
      verifiedByUser: v?.verifiedByUser || null,
      verifiedAt: v?.verifiedAt || null,
      referenceNo: v?.referenceNo || null,
    };
  });

  if (status) merged = merged.filter((m) => m.status === status);

  const total = merged.length;
  const data = merged.slice((page - 1) * limit, (page - 1) * limit + limit);
  return { data, total, page, limit };
}

async function getForEdit(type, workerId, user) {
  assertType(type);
  const worker = await prisma.worker.findUnique({
    where: { id: workerId },
    select: { id: true, workerCode: true, firstName: true, lastName: true, contractorId: true, contractor: { select: { contractorName: true } } },
  });
  if (!worker) throw new ApiError(404, 'Worker not found');
  await assertContractorScope(worker, user);

  const verification = await prisma.workerVerification.findUnique({
    where: { workerId_type: { workerId, type } },
    include: { verifiedByUser: verifiedBySelect },
  });

  return { worker, verification: verification || { workerId, type, status: 'PENDING' } };
}

async function upsert(type, workerId, data, documentUrl, user) {
  assertType(type);
  if (!STATUSES_BY_TYPE[type].includes(data.status)) {
    throw new ApiError(400, `Status ${data.status} is not allowed for ${type} verification`, { status: 'Invalid status for this verification' });
  }
  const worker = await prisma.worker.findUnique({ where: { id: workerId }, select: { id: true, contractorId: true } });
  if (!worker) throw new ApiError(404, 'Worker not found');
  await assertContractorScope(worker, user);

  const fields = {
    status: data.status,
    remarks: data.remarks ?? null,
    referenceNo: type === 'POLICE' ? data.referenceNo ?? null : null,
    verifiedByUserId: user.id,
    verifiedAt: DECIDED.includes(data.status) ? new Date() : null,
    ...(documentUrl ? { documentUrl } : {}),
  };

  return prisma.$transaction(async (tx) => {
    const record = await tx.workerVerification.upsert({
      where: { workerId_type: { workerId, type } },
      create: { workerId, type, ...fields },
      update: fields,
      include: { verifiedByUser: verifiedBySelect },
    });
    // Worker.policeVerified is a denormalised summary of this record, kept in sync here so
    // existing code that reads the boolean keeps working.
    if (type === 'POLICE') {
      await tx.worker.update({ where: { id: workerId }, data: { policeVerified: data.status === 'VERIFIED' } });
    }
    return record;
  });
}

module.exports = { listByType, getForEdit, upsert };
