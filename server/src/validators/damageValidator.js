const { z } = require('zod');
const { optionalString } = require('./common');

const damageSchema = z.object({
  workerId: z.string().min(1, 'Worker is required'),
  particulars: z.string().min(1, 'Particulars are required'),
  damageDate: z.coerce.date({ errorMap: () => ({ message: 'Damage date is required' }) }),
  causeShown: optionalString(),
  nameOfWorksmen: optionalString(30),
  witnessName: optionalString(30),
  deductionAmount: z.coerce.number().positive('Deduction amount must be greater than 0'),
  installments: z.coerce.number().int().positive('Installments must be at least 1'),
  remarks: optionalString(),
});

module.exports = { damageSchema };
