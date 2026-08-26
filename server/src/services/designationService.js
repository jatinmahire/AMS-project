const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');

async function list() {
  return prisma.designation.findMany({ orderBy: { designationName: 'asc' } });
}

async function getById(id) {
  const designation = await prisma.designation.findUnique({ where: { id } });
  if (!designation) throw new ApiError(404, 'Designation not found');
  return designation;
}

async function create(data) {
  return prisma.designation.create({ data });
}

async function update(id, data) {
  await getById(id);
  return prisma.designation.update({ where: { id }, data });
}

async function remove(id) {
  await getById(id);
  await prisma.designation.delete({ where: { id } });
}

module.exports = { list, getById, create, update, remove };
