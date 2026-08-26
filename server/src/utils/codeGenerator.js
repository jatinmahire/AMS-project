const prisma = require('../config/db');

const RESOURCES = {
  contractor: { model: 'contractor', field: 'contractorCode', prefix: 'CON' },
  supervisor: { model: 'supervisor', field: 'supervisorCode', prefix: 'SUP' },
  worker: { model: 'worker', field: 'workerCode', prefix: 'WRK' },
};

async function generateCode(resource) {
  const { model, field, prefix } = RESOURCES[resource];

  const existing = await prisma[model].findMany({
    where: { [field]: { startsWith: prefix } },
    select: { [field]: true },
  });

  const maxNumber = existing.reduce((max, row) => {
    const numericPart = row[field].slice(prefix.length);
    const value = parseInt(numericPart, 10);
    return Number.isNaN(value) ? max : Math.max(max, value);
  }, 0);

  const nextNumber = maxNumber + 1;
  return `${prefix}${String(nextNumber).padStart(3, '0')}`;
}

module.exports = generateCode;
