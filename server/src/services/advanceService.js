const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const recordAudit = require('../utils/auditLog');
const { monthRange } = require('../utils/dateRange');

async function list({ contractorId, month, workerId, page = 1, limit = 50 }) {
  page = Number(page) || 1;
  limit = Number(limit) || 50;
  const where = {
    ...(workerId ? { workerId } : {}),
    ...(contractorId ? { worker: { contractorId } } : {}),
    ...(month ? { advanceDate: monthRange(month) } : {}),
  };

  const [data, total] = await Promise.all([
    prisma.advance.findMany({
      where,
      include: {
        worker: { select: { workerCode: true, firstName: true, lastName: true, contractor: { select: { contractorName: true } } } },
        repayments: true,
      },
      orderBy: { advanceDate: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.advance.count({ where }),
  ]);

  return { data, total, page: Number(page), limit: Number(limit) };
}

async function getById(id) {
  const advance = await prisma.advance.findUnique({
    where: { id },
    include: { worker: true, repayments: { orderBy: { installmentNo: 'asc' } } },
  });
  if (!advance) throw new ApiError(404, 'Advance record not found');
  return advance;
}

function buildRepaymentRows(advanceId, amount, installmentsCount, advanceDate) {
  const baseAmount = Math.floor((amount / installmentsCount) * 100) / 100;
  const rows = [];
  let allocated = 0;

  for (let i = 1; i <= installmentsCount; i++) {
    const dueDate = new Date(advanceDate);
    dueDate.setMonth(dueDate.getMonth() + i);

    const isLast = i === installmentsCount;
    const installmentAmount = isLast ? Number((amount - allocated).toFixed(2)) : baseAmount;
    allocated += installmentAmount;

    rows.push({ advanceId, installmentNo: i, dueDate, amount: installmentAmount });
  }

  return rows;
}

async function create(data) {
  return prisma.$transaction(async (tx) => {
    const advance = await tx.advance.create({ data });
    const repaymentRows = buildRepaymentRows(advance.id, data.amount, data.installmentsCount, data.advanceDate);
    await tx.advanceRepayment.createMany({ data: repaymentRows });
    return tx.advance.findUnique({ where: { id: advance.id }, include: { repayments: true } });
  });
}

async function update(id, data, userId) {
  const before = await prisma.advance.findUnique({ where: { id } });
  if (!before) throw new ApiError(404, 'Advance record not found');
  return prisma.$transaction(async (tx) => {
    const result = await tx.advance.update({ where: { id }, data });
    await recordAudit({ userId, action: 'UPDATE', entityType: 'Advance', entityId: id, oldValue: before, newValue: result }, tx);
    return result;
  });
}

async function remove(id, userId) {
  const before = await prisma.advance.findUnique({ where: { id } });
  if (!before) throw new ApiError(404, 'Advance record not found');
  return prisma.$transaction(async (tx) => {
    await tx.advance.delete({ where: { id } });
    await recordAudit({ userId, action: 'DELETE', entityType: 'Advance', entityId: id, oldValue: before, newValue: null }, tx);
  });
}

module.exports = { list, getById, create, update, remove };
