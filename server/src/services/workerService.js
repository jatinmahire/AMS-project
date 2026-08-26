const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const generateCode = require('../utils/codeGenerator');

const summaryInclude = {
  contractor: { select: { contractorName: true, contractorCode: true } },
  designation: { select: { designationName: true } },
  labourCategory: { select: { categoryName: true, ratePerDay: true } },
};

async function list({ search, status, contractorId, page = 1, limit = 20 }) {
  page = Number(page) || 1;
  limit = Number(limit) || 20;
  const where = {
    ...(status ? { status } : {}),
    ...(contractorId ? { contractorId } : {}),
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

async function getById(id) {
  const worker = await prisma.worker.findUnique({
    where: { id },
    include: { contractor: true, designation: true, labourCategory: true },
  });
  if (!worker) throw new ApiError(404, 'Worker not found');
  return worker;
}

async function create(data) {
  const workerCode = await generateCode('worker');
  return prisma.worker.create({ data: { ...data, workerCode } });
}

async function update(id, data) {
  await getById(id);
  return prisma.worker.update({ where: { id }, data });
}

async function updateStatus(id, status) {
  await getById(id);
  return prisma.worker.update({ where: { id }, data: { status } });
}

async function search(term) {
  return prisma.worker.findMany({
    where: {
      status: 'ACTIVE',
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

module.exports = { list, getById, create, update, updateStatus, search };
