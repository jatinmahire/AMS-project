// Turns a stored AuditLog row into a human-readable summary sentence.
// Pure function: only reads from the row's own action/newValue/oldValue —
// any entity data the sentence needs (e.g. a linked worker's code) must
// already be embedded in that snapshot at write time (see auditLog.js
// callers), so this never has to issue its own DB queries.

function currency(amount) {
  return amount === undefined || amount === null ? '-' : Number(amount).toLocaleString('en-IN');
}

function workerLabel(v) {
  const w = v.worker || {};
  const name = [w.firstName, w.lastName].filter(Boolean).join(' ');
  return name ? `${name} (${w.workerCode || '-'})` : w.workerCode || 'Worker';
}

const TEMPLATES = {
  CREATE_WORKER: (v) => `New Worker registered: ${v.firstName} ${v.lastName} (${v.workerCode})`,
  UPDATE_WORKER: (v) => `Worker updated: ${v.firstName} ${v.lastName} (${v.workerCode})`,
  CREATE_CONTRACTOR: (v) => `New Contractor registered: ${v.contractorName} (${v.contractorCode})`,
  UPDATE_CONTRACTOR: (v) => `Contractor updated: ${v.contractorName} (${v.contractorCode})`,
  CREATE_SUPERVISOR: (v) => `New Supervisor registered: ${v.fullName} (${v.supervisorCode})`,
  UPDATE_SUPERVISOR: (v) => `Supervisor updated: ${v.fullName} (${v.supervisorCode})`,
  CREATE_FINE: (v) => `Fine recorded for Worker ${workerLabel(v)}: Rs ${currency(v.fineAmount)}`,
  UPDATE_FINE: (v) => `Fine updated for Worker ${workerLabel(v)}: Rs ${currency(v.fineAmount)}`,
  DELETE_FINE: (v) => `Fine deleted for Worker ${workerLabel(v)}`,
  CREATE_DAMAGE: (v) => `Damage/Loss recorded for Worker ${workerLabel(v)}: Rs ${currency(v.deductionAmount)}`,
  UPDATE_DAMAGE: (v) => `Damage/Loss updated for Worker ${workerLabel(v)}: Rs ${currency(v.deductionAmount)}`,
  DELETE_DAMAGE: (v) => `Damage/Loss record deleted for Worker ${workerLabel(v)}`,
  CREATE_ACCIDENT: (v) => `Accident recorded for Worker ${workerLabel(v)}: ${v.natureOfAccident || ''}`,
  UPDATE_ACCIDENT: (v) => `Accident record updated for Worker ${workerLabel(v)}`,
  DELETE_ACCIDENT: (v) => `Accident record deleted for Worker ${workerLabel(v)}`,
  CREATE_ADVANCE: (v) => `Advance recorded for Worker ${workerLabel(v)}: Rs ${currency(v.amount)}`,
  UPDATE_ADVANCE: (v) => `Advance updated for Worker ${workerLabel(v)}: Rs ${currency(v.amount)}`,
  DELETE_ADVANCE: (v) => `Advance deleted for Worker ${workerLabel(v)}`,
  CREATE_OVERTIME: (v) => `Overtime recorded for Worker ${workerLabel(v)}: ${v.hoursWorked} hrs`,
  UPDATE_OVERTIME: (v) => `Overtime updated for Worker ${workerLabel(v)}`,
  DELETE_OVERTIME: (v) => `Overtime record deleted for Worker ${workerLabel(v)}`,
  CREATE_ATTENDANCE: (v) => `Attendance marked for ${workerLabel(v)}`,
  UPDATE_ATTENDANCE: (v) => `Attendance updated for ${workerLabel(v)}`,
};

function buildAuditMessage(log) {
  const value = log.newValue || log.oldValue || {};
  const template = TEMPLATES[log.action];
  if (!template) return `${log.action} on ${log.entityType}`;
  try {
    return template(value);
  } catch {
    return `${log.action} on ${log.entityType}`;
  }
}

function actorLabel(user) {
  if (!user) return 'Someone';
  if (user.role === 'ADMIN') return user.fullName?.trim() || 'Admin';
  const role = user.role ? user.role.charAt(0) + user.role.slice(1).toLowerCase() : '';
  return `${role} ${user.fullName || user.loginId || ''}`.trim();
}

module.exports = { buildAuditMessage, actorLabel };
