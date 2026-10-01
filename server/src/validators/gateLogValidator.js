const { z } = require('zod');

const gateLogSchema = z.object({
  workerId: z.string().min(1, 'Worker is required'),
  direction: z.enum(['INWARD', 'OUTWARD'], { errorMap: () => ({ message: 'Select a direction' }) }),
  gateNo: z.string().min(1, 'Gate number is required').max(20),
  timestamp: z.coerce.date({ errorMap: () => ({ message: 'Timestamp is required' }) }),
});

module.exports = { gateLogSchema };
