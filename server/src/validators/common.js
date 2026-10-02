const { z } = require('zod');

const optionalString = (max) => {
  const base = max ? z.string().max(max) : z.string();
  return z.preprocess((v) => (v === '' || v === null ? undefined : v), base.optional());
};

const optionalDate = () => {
  return z.preprocess((v) => (v === '' || v === null || v === undefined ? undefined : v), z.coerce.date().optional());
};

const optionalNumber = () => {
  return z.preprocess((v) => (v === '' || v === null || v === undefined ? undefined : v), z.coerce.number().optional());
};

const optionalInt = () => {
  return z.preprocess((v) => (v === '' || v === null || v === undefined ? undefined : v), z.coerce.number().int().optional());
};

// Same pattern the frontend's shared validators.js uses for both the
// NumericInput components (client-side keystroke/paste blocking) and
// EmailInput (blur validation) — kept in sync here so a value that slips
// past the client is still rejected server-side with an equivalent rule.
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const EMAIL_MESSAGE = 'Please enter a valid email address, e.g. name@example.com';

const emailString = (message = EMAIL_MESSAGE) => z.string().regex(EMAIL_REGEX, message);

const optionalEmailString = (message = EMAIL_MESSAGE) => {
  return z.preprocess(
    (v) => (v === '' || v === null || v === undefined ? undefined : v),
    z.string().regex(EMAIL_REGEX, message).optional()
  );
};

// Exact-length digits-only string (e.g. a 10-digit mobile number).
const digitsString = (length, message) => {
  return z.string().regex(new RegExp(`^\\d{${length}}$`), message || `Must be exactly ${length} digits`);
};

// Optional digits-only string, up to maxLength digits, empty allowed.
const optionalDigitsString = (maxLength, message) => {
  const base = z.string().regex(new RegExp(`^\\d{1,${maxLength}}$`), message || `Must be up to ${maxLength} digits`);
  return z.preprocess((v) => (v === '' || v === null || v === undefined ? undefined : v), base.optional());
};

// Optional digits-only string that, when present, must be exactly `length`
// digits (e.g. an optional pincode — fine if left blank, but not "3 digits").
const optionalExactDigitsString = (length, message) => {
  const base = z.string().regex(new RegExp(`^\\d{${length}}$`), message || `Must be exactly ${length} digits`);
  return z.preprocess((v) => (v === '' || v === null || v === undefined ? undefined : v), base.optional());
};

const MIN_AGE = 18;
const MIN_DOB_YEAR = 1900;

// DOB for a person who must be an adult today. Recomputed per request, so the 18-year cutoff
// moves forward each year with no code change. The strict YYYY-MM-DD check rejects values
// like 26666-12-12 that some browsers' date inputs let through.
const adultDob = (label = 'Person') =>
  z
    .string({ required_error: 'Date of birth is required' })
    .regex(/^\d{4}-\d{2}-\d{2}/, 'Enter a valid date of birth (year must be 4 digits)')
    .transform((v) => new Date(v))
    .refine((d) => !Number.isNaN(d.getTime()), 'Enter a valid date of birth')
    .refine(
      (d) => d.getUTCFullYear() >= MIN_DOB_YEAR && d.getUTCFullYear() <= new Date().getFullYear(),
      `Year must be between ${MIN_DOB_YEAR} and the current year`
    )
    .refine((d) => {
      const cutoff = new Date();
      cutoff.setFullYear(cutoff.getFullYear() - MIN_AGE);
      return d <= cutoff;
    }, `${label} must be at least ${MIN_AGE} years old`);

module.exports = {
  adultDob,
  optionalString,
  optionalDate,
  optionalNumber,
  optionalInt,
  EMAIL_REGEX,
  emailString,
  optionalEmailString,
  digitsString,
  optionalDigitsString,
  optionalExactDigitsString,
};
