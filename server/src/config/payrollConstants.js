// How many days of pay a HALF_DAY attendance status counts toward a worker's
// present-days count for wage calculation. Confirmed by the client: 0.5 days.
const HALF_DAY_PAY_WEIGHT = 0.5;

function resolvePresentDays({ presentCount, halfDayCount }) {
  if (halfDayCount > 0 && HALF_DAY_PAY_WEIGHT === null) {
    return { value: null, pending: true };
  }
  return { value: presentCount + halfDayCount * (HALF_DAY_PAY_WEIGHT ?? 0), pending: false };
}

// PF (Provident Fund) statutory figures. These are the commonly-cited
// defaults under the EPF Act — NOT yet confirmed by the client for this
// deployment. Compliance numbers must not ship silently as fact: verify
// with the client before relying on these for an actual PF filing.
const PF_WAGE_CEILING = 15000; // default pending client confirmation
const PF_EMPLOYEE_RATE = 0.12; // default pending client confirmation
const PF_EMPLOYER_RATE = 0.12; // default pending client confirmation

module.exports = {
  HALF_DAY_PAY_WEIGHT,
  resolvePresentDays,
  PF_WAGE_CEILING,
  PF_EMPLOYEE_RATE,
  PF_EMPLOYER_RATE,
};
