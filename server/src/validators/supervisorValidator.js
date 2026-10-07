const { z } = require('zod');
const { adultDob, optionalString, optionalDate, optionalPassword, emailString, digitsString } = require('./common');

const supervisorSchema = z.object({
  fullName: z.string().min(1, 'Full name is required').max(30),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], { errorMap: () => ({ message: 'Select a gender' }) }),
  dob: adultDob('Supervisor'),
  contactNo: digitsString(10, 'Contact number must be exactly 10 digits'),
  email: emailString(),
  aadhaarNo: digitsString(12, 'Aadhaar number must be exactly 12 digits'),
  street: z.string().min(1, 'Street is required').max(200),
  city: z.string().min(1, 'City is required').max(100),
  state: z.string().min(1, 'State is required').max(100),
  pincode: digitsString(6, 'Pincode must be exactly 6 digits'),
  assignedContractorId: optionalString(),
  status: z.enum(['ACTIVE', 'INACTIVE', 'BLACKLISTED']).optional(),
  password: optionalPassword(),
});

module.exports = { supervisorSchema };
