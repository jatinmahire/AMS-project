const { z } = require('zod');
const { optionalString } = require('./common');

const holidaySchema = z.object({
  type: z.enum(['WEEKLY_OFF', 'PAID_LEAVE'], { errorMap: () => ({ message: 'Select a holiday type' }) }),
  date: z.coerce.date({ errorMap: () => ({ message: 'Date is required' }) }),
  notes: optionalString(),
  contractorId: optionalString(),
});

module.exports = { holidaySchema };
