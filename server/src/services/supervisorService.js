const bcrypt = require('bcrypt');
const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const generateCode = require('../utils/codeGenerator');
const recordAudit = require('../utils/auditLog');

async function list({ search, status, page = 1, limit = 20 }) {
  page = Number(page) || 1;
  limit = Number(limit) || 20;
  const where = {
    ...(status ? { status } : {}),
    ...(search
      ? {
          OR: [
            { fullName: { contains: search, mode: 'insensitive' } },
            { supervisorCode: { contains: search, mode: 'insensitive' } },
            { contactNo: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.supervisor.findMany({
      where,
      include: {
        assignedContractor: { select: { contractorName: true } },
        user: { select: { loginId: true } },
      },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.supervisor.count({ where }),
  ]);

  return { data, total, page: Number(page), limit: Number(limit) };
}

async function getById(id) {
  const supervisor = await prisma.supervisor.findUnique({
    where: { id },
    include: { assignedContractor: true, user: { select: { loginId: true } } },
  });
  if (!supervisor) throw new ApiError(404, 'Supervisor not found');
  return supervisor;
}

async function create(data, userId) {
  const { password, ...supervisorData } = data;
  if (!password) {
    throw new ApiError(400, 'Password is required', { password: 'Password is required' });
  }

  const supervisorCode = await generateCode('supervisor');
  const loginId = supervisorCode;
  const passwordHash = await bcrypt.hash(password, 10);

  const supervisor = await prisma.$transaction(async (tx) => {
    const created = await tx.supervisor.create({ data: { ...supervisorData, supervisorCode } });
    await tx.user.create({
      data: { loginId, passwordHash, role: 'SUPERVISOR', fullName: created.fullName, supervisorId: created.id },
    });
    return created;
  });

  await recordAudit({
    userId,
    action: 'CREATE_SUPERVISOR',
    entityType: 'Supervisor',
    entityId: supervisor.id,
    contractorId: supervisor.assignedContractorId,
    newValue: supervisor,
  });

  return { ...supervisor, loginId };
}

async function update(id, data, userId) {
  const before = await getById(id);
  const { password, ...supervisorData } = data;
  const updated = await prisma.supervisor.update({ where: { id }, data: supervisorData });
  await recordAudit({
    userId,
    action: 'UPDATE_SUPERVISOR',
    entityType: 'Supervisor',
    entityId: id,
    contractorId: updated.assignedContractorId,
    oldValue: before,
    newValue: updated,
  });
  return updated;
}

async function updateStatus(id, status) {
  await getById(id);
  return prisma.supervisor.update({ where: { id }, data: { status } });
}

module.exports = { list, getById, create, update, updateStatus };
