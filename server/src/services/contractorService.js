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
            { contractorName: { contains: search, mode: 'insensitive' } },
            { contractorCode: { contains: search, mode: 'insensitive' } },
            { contactPerson: { contains: search, mode: 'insensitive' } },
            { phone: { contains: search, mode: 'insensitive' } },
          ],
        }
      : {}),
  };

  const [data, total] = await Promise.all([
    prisma.contractor.findMany({
      where,
      include: { user: { select: { loginId: true } } },
      orderBy: { createdAt: 'desc' },
      skip: (page - 1) * limit,
      take: limit,
    }),
    prisma.contractor.count({ where }),
  ]);

  return { data, total, page: Number(page), limit: Number(limit) };
}

async function getById(id) {
  const contractor = await prisma.contractor.findUnique({
    where: { id },
    include: { documents: true, user: { select: { loginId: true } } },
  });
  if (!contractor) throw new ApiError(404, 'Contractor not found');
  return contractor;
}

async function create(data, userId) {
  const { password, ...contractorData } = data;
  if (!password) {
    throw new ApiError(400, 'Password is required', { password: 'Password is required' });
  }

  const contractorCode = await generateCode('contractor');
  const loginId = contractorCode;
  const passwordHash = await bcrypt.hash(password, 10);

  const contractor = await prisma.$transaction(async (tx) => {
    const created = await tx.contractor.create({ data: { ...contractorData, contractorCode } });
    await tx.user.create({
      data: { loginId, passwordHash, role: 'CONTRACTOR', fullName: created.contractorName, contractorId: created.id },
    });
    return created;
  });

  await recordAudit({
    userId,
    action: 'CREATE_CONTRACTOR',
    entityType: 'Contractor',
    entityId: contractor.id,
    contractorId: contractor.id,
    newValue: contractor,
  });

  return { ...contractor, loginId };
}

async function update(id, data, userId) {
  const before = await getById(id);
  const { password, ...contractorData } = data;
  const updated = await prisma.contractor.update({ where: { id }, data: contractorData });
  await recordAudit({
    userId,
    action: 'UPDATE_CONTRACTOR',
    entityType: 'Contractor',
    entityId: id,
    contractorId: id,
    oldValue: before,
    newValue: updated,
  });
  return updated;
}

async function updateStatus(id, status) {
  await getById(id);
  return prisma.contractor.update({ where: { id }, data: { status } });
}

async function addDocument(contractorId, docType, fileUrl) {
  await getById(contractorId);
  return prisma.contractorDocument.create({ data: { contractorId, docType, fileUrl } });
}

async function removeDocument(documentId) {
  const doc = await prisma.contractorDocument.findUnique({ where: { id: documentId } });
  if (!doc) throw new ApiError(404, 'Document not found');
  await prisma.contractorDocument.delete({ where: { id: documentId } });
}

async function listForDropdown() {
  return prisma.contractor.findMany({
    where: { status: 'ACTIVE' },
    select: { id: true, contractorCode: true, contractorName: true },
    orderBy: { contractorName: 'asc' },
  });
}

module.exports = { list, getById, create, update, updateStatus, addDocument, removeDocument, listForDropdown };
