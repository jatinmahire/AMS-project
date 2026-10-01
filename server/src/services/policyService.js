const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const { scopedContractorId } = require('../utils/scope');

async function list(user, { contractorId, page = 1, limit = 50 }) {
  page = Number(page) || 1;
  limit = Number(limit) || 50;
  const scoped = await scopedContractorId(user);
  const where = { ...(contractorId ? { contractorId } : {}), ...(scoped ? { contractorId: scoped } : {}) };

  const [data, total] = await Promise.all([
    prisma.policy.findMany({
      where,
      include: { contractor: { select: { contractorName: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.policy.count({ where }),
  ]);

  return { data, total, page: Number(page), limit: Number(limit) };
}

async function getById(id, user) {
  const policy = await prisma.policy.findUnique({ where: { id }, include: { contractor: true } });
  if (!policy) throw new ApiError(404, 'Policy not found');

  const scoped = await scopedContractorId(user);
  if (scoped && policy.contractorId !== scoped) {
    throw new ApiError(404, 'Policy not found');
  }

  return policy;
}

async function create(data) {
  return prisma.policy.create({ data });
}

async function update(id, data) {
  await getById(id);
  return prisma.policy.update({ where: { id }, data });
}

async function remove(id) {
  await getById(id);
  await prisma.policy.delete({ where: { id } });
}

module.exports = { list, getById, create, update, remove };
