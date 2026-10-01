const prisma = require('../config/db');
const ApiError = require('../utils/ApiError');
const { monthRange } = require('../utils/dateRange');
const { resolvePresentDays } = require('../config/payrollConstants');

// Shared per-worker wage base for a contractor + month, used by both the
// Muster Roll and the PF Chalan so the two reports never compute
// attendance/deduction figures differently.
async function computeWageRows({ contractorId, month }) {
  if (!contractorId) throw new ApiError(400, 'Contractor is required');
  if (!month) throw new ApiError(400, 'Month is required');

  const range = monthRange(month);

  const workers = await prisma.worker.findMany({
    where: { contractorId, status: 'ACTIVE' },
    include: { designation: true, labourCategory: true },
    orderBy: { workerCode: 'asc' },
  });
  const workerIds = workers.map((w) => w.id);

  const [attendances, overtimes, fines, damages, repayments, holidays] = await Promise.all([
    prisma.attendance.findMany({ where: { workerId: { in: workerIds }, date: range } }),
    prisma.overtime.findMany({ where: { workerId: { in: workerIds }, otDate: range } }),
    prisma.fine.findMany({ where: { workerId: { in: workerIds }, offenceDate: range } }),
    prisma.damage.findMany({ where: { workerId: { in: workerIds }, damageDate: range } }),
    prisma.advanceRepayment.findMany({
      where: { dueDate: range, advance: { workerId: { in: workerIds } } },
      include: { advance: { select: { workerId: true } } },
    }),
    prisma.holiday.findMany({ where: { date: range, OR: [{ contractorId }, { contractorId: null }] } }),
  ]);

  const weeklyOffCount = holidays.filter((h) => h.type === 'WEEKLY_OFF').length;
  const paidHolidayCount = holidays.filter((h) => h.type === 'PAID_LEAVE').length;

  return workers.map((worker, index) => {
    const workerAttendance = attendances.filter((a) => a.workerId === worker.id);
    const presentCount = workerAttendance.filter((a) => a.status === 'PRESENT').length;
    const halfDayCount = workerAttendance.filter((a) => a.status === 'HALF_DAY').length;
    const absentCount = workerAttendance.filter((a) => a.status === 'ABSENT').length;

    const presentDays = resolvePresentDays({ presentCount, halfDayCount });
    const ratePerDay = Number(worker.labourCategory.ratePerDay);

    const otEarnings = overtimes.filter((o) => o.workerId === worker.id).reduce((sum, o) => sum + Number(o.otEarnings), 0);
    const fineAmount = fines.filter((f) => f.workerId === worker.id).reduce((sum, f) => sum + Number(f.fineAmount), 0);
    const damageAmount = damages.filter((d) => d.workerId === worker.id).reduce((sum, d) => sum + Number(d.deductionAmount), 0);
    const advanceDeduction = repayments
      .filter((r) => r.advance.workerId === worker.id)
      .reduce((sum, r) => sum + Number(r.amount), 0);

    const basicWage = presentDays.pending ? null : presentDays.value * ratePerDay;
    const netPay = presentDays.pending ? null : basicWage + otEarnings - advanceDeduction - fineAmount - damageAmount;

    return {
      srNo: index + 1,
      worker,
      presentCount,
      halfDayCount,
      absentCount,
      attendanceCount: presentCount + halfDayCount + absentCount,
      totalDaysWorked: presentDays.value,
      totalDaysWorkedPending: presentDays.pending,
      weeklyOff: weeklyOffCount,
      paidHolidays: paidHolidayCount,
      ratePerDay,
      basicWage,
      otEarnings,
      advanceDeduction,
      fineAmount,
      damageAmount,
      netPay,
    };
  });
}

module.exports = { computeWageRows };
