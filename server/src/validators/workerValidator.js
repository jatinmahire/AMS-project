const { z } = require('zod');
const { optionalString, optionalDate, digitsString, optionalDigitsString, optionalExactDigitsString } = require('./common');

const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;
const MIN_WORKER_AGE = 18;

// Recomputed on every request, so the cutoff moves forward each year with no code change.
function latestAllowedDob() {
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - MIN_WORKER_AGE);
  return cutoff;
}

const requiredString = (label, max) => z.string({ required_error: `${label} is required` }).trim().min(1, `${label} is required`).max(max);

const upperPattern = (label, regex, example) =>
  z.preprocess(
    (v) => (typeof v === 'string' ? v.trim().toUpperCase() : v),
    z.string({ required_error: `${label} is required` }).min(1, `${label} is required`).regex(regex, `Enter a valid ${label}, e.g. ${example}`)
  );

const workerSchema = z.object({
  firstName: z.string().min(1, 'First name is required').max(100),
  middleName: optionalString(100),
  lastName: z.string().min(1, 'Last name is required').max(100),
  fatherOrHusbandName: optionalString(150),
  dob: z.coerce
    .date({ errorMap: () => ({ message: 'Date of birth is required' }) })
    .refine((d) => d <= latestAllowedDob(), `Worker must be at least ${MIN_WORKER_AGE} years old`),
  gender: z.enum(['MALE', 'FEMALE', 'OTHER'], { errorMap: () => ({ message: 'Select a gender' }) }),
  maritalStatus: z.enum(['MARRIED', 'UNMARRIED'], { errorMap: () => ({ message: 'Marital status is required' }) }),
  mobileNo: digitsString(10, 'Mobile number must be exactly 10 digits'),
  permanentAddress: z.string().min(1, 'Permanent address is required'),
  currentAddress: optionalString(),
  village: optionalString(100),
  taluka: optionalString(100),
  city: requiredString('City', 100),
  district: requiredString('District', 100),
  state: requiredString('State', 100),
  pincode: digitsString(6, 'Pincode must be exactly 6 digits'),
  contractorId: z.string().min(1, 'Contractor is required'),
  designationId: z.string().min(1, 'Designation is required'),
  labourCategoryId: z.string().min(1, 'Labour category is required'),
  idType: z.enum(['AADHAAR', 'PAN', 'VOTER_ID'], { errorMap: () => ({ message: 'Select an ID type' }) }),
  idNumber: z.string().min(1, 'ID number is required').max(50),
  bocwRegistrationNo: optionalString(50),
  bocwIssueDate: optionalDate(),
  bocwValidDate: optionalDate(),
  pfNumber: optionalDigitsString(20, 'PF number must be digits only'),
  uanNumber: optionalExactDigitsString(12, 'UAN number must be exactly 12 digits'),
  esicNumber: optionalDigitsString(17, 'ESIC number must be digits only'),
  panNumber: upperPattern('PAN number', PAN_REGEX, 'ABCDE1234F'),
  ipNumber: optionalDigitsString(10, 'IP number must be digits only'),
  policeVerified: z.preprocess((v) => v === 'true' || v === true, z.boolean()).optional(),
  joinDate: z.coerce.date({ errorMap: () => ({ message: 'Join date is required' }) }),
  bankName: requiredString('Bank name', 100),
  bankBranch: requiredString('Bank branch', 100),
  accountNo: z.string({ required_error: 'Account number is required' }).regex(/^\d{1,18}$/, 'Account number must be up to 18 digits'),
  ifscCode: upperPattern('IFSC code', IFSC_REGEX, 'HDFC0001234'),
  nomineeName: requiredString('Nominee name', 150),
  nomineeRelation: requiredString('Nominee relation', 50),
  nomineeChildrenCount: z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : Number(v)),
    z
      .number({ required_error: 'Children count is required', invalid_type_error: 'Children count must be a number' })
      .int('Children count must be a whole number')
      .min(0, 'Children count cannot be negative')
  ),
  nomineeQualification: requiredString('Nominee qualification', 100),
  nomineeMobile: digitsString(10, 'Nominee mobile number must be exactly 10 digits'),
  sector: optionalString(100),
  status: z.enum(['ACTIVE', 'INACTIVE', 'BLACKLISTED']).optional(),
});

module.exports = { workerSchema };
