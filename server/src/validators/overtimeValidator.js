const { z } = require('zod');
const { optionalString } = require('./common');

const overtimeSchema = z.object({
  workerId: z.string().min(1, 'Worker is required'),
  otDate: z.coerce.date({ errorMap: () => ({ message: 'Overtime date is required' }) }),
  hoursWorked: z.coerce.number().positive('Hours worked must be greater than 0'),
  normalWageRate: z.coerce.number().positive('Normal wage rate must be greater than 0'),
  otWageRate: z.coerce.number().positive('OT wage rate must be greater than 0'),
  remarks: optionalString(),
});

module.exports = { overtimeSchema };
