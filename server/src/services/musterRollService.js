const { computeWageRows } = require('./wageCalculationService');

// No per-worker shift schedule exists in the schema — every worker under a
// contractor follows one standard site shift. Fixed here as a single named
// constant so it can become per-contractor configurable later without
// touching the calculation below.
const STANDARD_SHIFT = { workingHoursFrom: '09:00', workingHoursTo: '18:00', intervalFrom: '13:00', intervalTo: '14:00' };

async function getMusterRoll({ contractorId, month }) {
  const rows = await computeWageRows({ contractorId, month });

  return rows.map((row) => ({
    srNo: row.srNo,
    workerCode: row.worker.workerCode,
    uanNumber: row.worker.uanNumber,
    fullName: `${row.worker.firstName} ${row.worker.middleName ? row.worker.middleName + ' ' : ''}${row.worker.lastName}`,
    gender: row.worker.gender,
    dob: row.worker.dob,
    doj: row.worker.joinDate,
    designation: row.worker.designation.designationName,
    ...STANDARD_SHIFT,
    attendanceCount: row.attendanceCount,
    totalDaysWorked: row.totalDaysWorked,
    totalDaysWorkedPending: row.totalDaysWorkedPending,
    weeklyOff: row.weeklyOff,
    absentDays: row.absentCount,
    paidHolidays: row.paidHolidays,
    ratePerDay: row.ratePerDay,
    otEarnings: row.otEarnings,
    advanceDeduction: row.advanceDeduction,
    fineAmount: row.fineAmount,
    damageAmount: row.damageAmount,
    netPay: row.netPay,
  }));
}

module.exports = { getMusterRoll };
