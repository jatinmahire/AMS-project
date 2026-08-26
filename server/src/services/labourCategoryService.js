const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');

async function list() {
  return prisma.labourCategory.findMany({ orderBy: { categoryCode: 'asc' } });
}

async function getById(id) {
  const category = await prisma.labourCategory.findUnique({ where: { id } });
  if (!category) throw new ApiError(404, 'Labour category not found');
  return category;
}

async function create(data) {
  return prisma.labourCategory.create({ data });
}

async function update(id, data) {
  await getById(id);
  return prisma.labourCategory.update({ where: { id }, data });
}

async function remove(id) {
  await getById(id);
  await prisma.labourCategory.delete({ where: { id } });
}

module.exports = { list, getById, create, update, remove };
