const { z } = require('zod');
const { optionalString, optionalDate } = require('./common');

const supervisorSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(150),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], { errorMap: () => ({ message: 'Select a gender' }) }),
  dob: z.coerce.date({ errorMap: () => ({ message: 'Date of birth is required' }) }),
  contactNo: z.string().min(10, 'Enter a valid contact number').max(15),
  email: z.string().email('Enter a valid email address'),
  aadhaarNo: z.string().regex(/^\d{12}$/, 'Aadhaar number must be 12 digits'),
  street: optionalString(200),
  city: optionalString(100),
  state: optionalString(100),
  pincode: optionalString(10),
  assignedContractorId: optionalString(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'BLACKLISTED']).optional(),
});

module.exports = { supervisorSchema };
