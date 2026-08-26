const { z } = require('zod');
const { optionalString, optionalNumber } = require('./common');

const policySchema = z.object({
  contractorId: z.string().min(1, 'Contractor is required'),
  policyName: z.string().min(1, 'Policy name is required'),
  policyNumber: z.string().min(1, 'Policy number is required'),
  insuranceCompany: z.string().min(1, 'Insurance company is required'),
  projectName: optionalString(150),
  policyDate: z.coerce.date({ errorMap: () => ({ message: 'Policy date is required' }) }),
  validDate: z.coerce.date({ errorMap: () => ({ message: 'Valid date is required' }) }),
  workerCount: z.coerce.number().int().nonnegative('Worker count cannot be negative'),
  projectValue: optionalNumber(),
  personValue: optionalNumber(),
});

module.exports = { policySchema };
