const { z } = require('zod');
const { adultDob, optionalString, optionalDate, emailString, digitsString, optionalExactDigitsString } = require('./common');

const supervisorSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(150),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], { errorMap: () => ({ message: 'Select a gender' }) }),
  dob: adultDob('Supervisor'),
  contactNo: digitsString(10, 'Contact number must be exactly 10 digits'),
  email: emailString(),
  aadhaarNo: digitsString(12, 'Aadhaar number must be exactly 12 digits'),
  street: optionalString(200),
  city: optionalString(100),
  state: optionalString(100),
  pincode: optionalExactDigitsString(6, 'Pincode must be exactly 6 digits'),
  assignedContractorId: optionalString(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'BLACKLISTED']).optional(),
  password: z.string().min(6, 'Password must be at least 6 characters').optional(),
});

module.exports = { supervisorSchema };
