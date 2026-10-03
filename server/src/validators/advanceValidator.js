const { z } = require('zod');
const { optionalString, optionalNumber, optionalNonNegativeNumber } = require('./common');

const advanceSchema = z.object({
  workerId: z.string().min(1, 'Worker is required'),
  advanceDate: z.coerce.date({ errorMap: () => ({ message: 'Advance date is required' }) }),
  wagesPeriod: optionalString(50),
  wagesPayable: optionalNonNegativeNumber('Wages payable must not be negative'),
  amount: z.coerce.number().positive('Amount must be greater than 0'),
  purpose: z.string().min(1, 'Purpose is required'),
  installmentsCount: z.coerce.number().int().positive('Installments must be at least 1'),
  remarks: optionalString(),
});

module.exports = { advanceSchema };
