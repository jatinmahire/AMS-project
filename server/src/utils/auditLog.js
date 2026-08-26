const prisma = require('../config/db');

function toJson(value) {
  return value === undefined || value === null ? value : JSON.parse(JSON.stringify(value));
}

async function recordAudit({ userId, action, entityType, entityId, oldValue, newValue }, tx = prisma) {
  await tx.auditLog.create({
    data: { userId, action, entityType, entityId, oldValue: toJson(oldValue), newValue: toJson(newValue) },
  });
}

module.exports = recordAudit;
