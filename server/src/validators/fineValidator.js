const { z } = require('zod');
const { optionalString, optionalNumber, optionalNonNegativeNumber, optionalDate } = require('./common');

const fineSchema = z.object({
  workerId: z.string().min(1, 'Worker is required'),
  offence: z.string().min(1, 'Offence is required'),
  offenceDate: z.coerce.date({ errorMap: () => ({ message: 'Offence date is required' }) }),
  causeShown: optionalString(),
  witnessName: optionalString(30),
  wagePeriod: optionalString(50),
  wagesPayable: optionalNonNegativeNumber('Wages payable must not be negative'),
  fineAmount: z.coerce.number().positive('Fine amount must be greater than 0'),
  dateRealised: optionalDate(),
  remarks: optionalString(),
});

module.exports = { fineSchema };
