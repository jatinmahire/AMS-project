const { z } = require('zod');
const { optionalString } = require('./common');

const attendanceSchema = z.object({
  workerId: z.string().min(1, 'Worker is required'),
  date: z.coerce.date({ errorMap: () => ({ message: 'Date is required' }) }),
  inTime: z.string().min(1, 'In time is required'),
  outTime: optionalString(10),
  status: z.enum(['PRESENT', 'ABSENT', 'HALF_DAY'], { errorMap: () => ({ message: 'Select attendance status' }) }),
  buildingNo: optionalString(50),
});

const scanSchema = z.object({
  code: z.string().min(1, 'QR code is required'),
});

module.exports = { attendanceSchema, scanSchema };
