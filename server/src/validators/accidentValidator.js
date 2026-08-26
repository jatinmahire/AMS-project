const { z } = require('zod');
const { optionalDate } = require('./common');

const accidentSchema = z.object({
  workerId: z.string().min(1, 'Worker is required'),
  accidentDate: z.coerce.date({ errorMap: () => ({ message: 'Accident date is required' }) }),
  form24ReportDate: optionalDate(),
  natureOfAccident: z.string().min(1, 'Nature of accident is required'),
  dateReturnToWork: optionalDate(),
  daysAbsent: z.coerce.number().int().min(0, 'Days absent cannot be negative'),
});

module.exports = { accidentSchema };
