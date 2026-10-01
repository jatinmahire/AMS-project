const { computeWageRows } = require('./wageCalculationService');
const { PF_WAGE_CEILING, PF_EMPLOYEE_RATE, PF_EMPLOYER_RATE } = require('../config/payrollConstants');

function round2(n) {
  return Math.round(n * 100) / 100;
}

async function getPfChalan({ contractorId, month }) {
  const rows = await computeWageRows({ contractorId, month });

  return rows.map((row) => {
    if (row.totalDaysWorkedPending) {
      return {
        srNo: row.srNo,
        workerCode: row.worker.workerCode,
        fullName: `${row.worker.firstName} ${row.worker.lastName}`,
        uanNumber: row.worker.uanNumber,
        pfNumber: row.worker.pfNumber,
        basicWage: null,
        pfWages: null,
        employeeContribution: null,
        employerContribution: null,
        totalContribution: null,
        pending: true,
      };
    }

    const pfWages = Math.min(row.basicWage, PF_WAGE_CEILING);
    const employeeContribution = round2(pfWages * PF_EMPLOYEE_RATE);
    const employerContribution = round2(pfWages * PF_EMPLOYER_RATE);

    return {
      srNo: row.srNo,
      workerCode: row.worker.workerCode,
      fullName: `${row.worker.firstName} ${row.worker.lastName}`,
      uanNumber: row.worker.uanNumber,
      pfNumber: row.worker.pfNumber,
      basicWage: round2(row.basicWage),
      pfWages: round2(pfWages),
      employeeContribution,
      employerContribution,
      totalContribution: round2(employeeContribution + employerContribution),
      pending: false,
    };
  });
}

module.exports = { getPfChalan };
