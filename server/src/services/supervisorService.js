const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const generateCode = require('../utils/codeGenerator');

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
      include: { assignedContractor: { select: { contractorName: true } } },
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
    include: { assignedContractor: true },
  });
  if (!supervisor) throw new ApiError(404, 'Supervisor not found');
  return supervisor;
}

async function create(data) {
  const supervisorCode = await generateCode('supervisor');
  return prisma.supervisor.create({ data: { ...data, supervisorCode } });
}

async function update(id, data) {
  await getById(id);
  return prisma.supervisor.update({ where: { id }, data });
}

async function updateStatus(id, status) {
  await getById(id);
  return prisma.supervisor.update({ where: { id }, data: { status } });
}

module.exports = { list, getById, create, update, updateStatus };
