const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');

async function list({ contractorId, page = 1, limit = 100 }) {
  page = Number(page) || 1;
  limit = Number(limit) || 100;
  const where = contractorId ? { OR: [{ contractorId }, { contractorId: null }] } : {};

  const [data, total] = await Promise.all([
    prisma.holiday.findMany({
      where,
      include: { contractor: { select: { contractorName: true } } },
      orderBy: { date: 'asc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.holiday.count({ where }),
  ]);

  return { data, total, page: Number(page), limit: Number(limit) };
}

async function getById(id) {
  const holiday = await prisma.holiday.findUnique({ where: { id } });
  if (!holiday) throw new ApiError(404, 'Holiday not found');
  return holiday;
}

async function create(data) {
  return prisma.holiday.create({ data });
}

async function update(id, data) {
  await getById(id);
  return prisma.holiday.update({ where: { id }, data });
}

async function remove(id) {
  await getById(id);
  await prisma.holiday.delete({ where: { id } });
}

module.exports = { list, getById, create, update, remove };
