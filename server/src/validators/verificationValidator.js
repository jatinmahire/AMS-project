const { z } = require('zod');
const { optionalString } = require('./common');

const STATUSES_BY_TYPE = {
  AADHAAR: ['PENDING', 'VERIFIED', 'REJECTED'],
  POLICE: ['PENDING', 'VERIFIED', 'REJECTED', 'NOT_REQUIRED'],
};

const verificationSchema = z.object({
  status: z.enum(['PENDING', 'VERIFIED', 'REJECTED', 'NOT_REQUIRED'], { errorMap: () => ({ message: 'Select a status' }) }),
  referenceNo: optionalString(100),
  remarks: optionalString(500),
});

module.exports = { verificationSchema, STATUSES_BY_TYPE };
