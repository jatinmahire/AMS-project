const { z } = require('zod');
const { optionalString, optionalNumber } = require('./common');

const fineSchema = z.object({
  workerId: z.string().min(1, 'Worker is required'),
  offence: z.string().min(1, 'Offence is required'),
  offenceDate: z.coerce.date({ errorMap: () => ({ message: 'Offence date is required' }) }),
  causeShown: z.preprocess((v) => v === 'true' || v === true, z.boolean()),
  witnessName: optionalString(150),
  wagePeriod: optionalString(50),
  wagesPayable: optionalNumber(),
  fineAmount: z.coerce.number().positive('Fine amount must be greater than 0'),
  remarks: optionalString(),
});

module.exports = { fineSchema };
