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

module.exports = {
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
