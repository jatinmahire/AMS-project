// Shared validation logic reused by every form's own submit-time validation
// AND by the shared EmailInput/NumericInput components' blur/keystroke
// handlers, so the rule and its wording live in exactly one place.

export const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
export const EMAIL_INVALID_MESSAGE = 'Please enter a valid email address, e.g. name@example.com';

// Returns an error message, or undefined if the value is valid — including
// when the value is empty, since an optional email field with nothing typed
// in it is not itself an error (required-ness is checked separately).
export function validateEmailField(value) {
  if (!value) return undefined;
  return EMAIL_REGEX.test(value) ? undefined : EMAIL_INVALID_MESSAGE;
}

export function digitsLengthMessage(label, { exactLength, maxLength }) {
  return exactLength
    ? `${label} must be exactly ${exactLength} digits`
    : `${label} can be up to ${maxLength} digits`;
}

export const PAN_REGEX = /^[A-Z]{5}[0-9]{4}[A-Z]$/;
export const IFSC_REGEX = /^[A-Z]{4}0[A-Z0-9]{6}$/;

export function validatePattern(value, regex, label, example) {
  if (!value) return undefined;
  return regex.test(value) ? undefined : `Enter a valid ${label}, e.g. ${example}`;
}

export const MIN_WORKER_AGE = 18;

// Latest DOB (YYYY-MM-DD) that still makes someone MIN_WORKER_AGE today. Recomputed on
// every call so the cutoff moves forward each year without a code change.
export function maxAdultDob() {
  const cutoff = new Date();
  cutoff.setFullYear(cutoff.getFullYear() - MIN_WORKER_AGE);
  const mm = String(cutoff.getMonth() + 1).padStart(2, '0');
  const dd = String(cutoff.getDate()).padStart(2, '0');
  return `${cutoff.getFullYear()}-${mm}-${dd}`;
}

export const AADHAAR_FILE_RULE = {
  accept: '.pdf,.jpg,.jpeg',
  extensions: ['pdf', 'jpg', 'jpeg'],
  typeLabel: 'PDF or JPEG',
  maxBytes: 700 * 1024,
  sizeLabel: '700KB',
};

// Same 700KB cap as AADHAAR_FILE_RULE, for the forms whose file input also accepts PNG.
export const DOCUMENT_FILE_RULE = {
  accept: '.pdf,.jpg,.jpeg,.png',
  extensions: ['pdf', 'jpg', 'jpeg', 'png'],
  typeLabel: 'PDF or JPEG/PNG',
  maxBytes: 700 * 1024,
  sizeLabel: '700KB',
};

export function validateUploadFile(file, rule) {
  if (!file) return undefined;
  const ext = file.name.split('.').pop().toLowerCase();
  if (!rule.extensions.includes(ext)) return `Only ${rule.typeLabel} files are allowed`;
  if (file.size > rule.maxBytes) return `File must be ${rule.sizeLabel} or smaller`;
  return undefined;
}

export const MIN_DOB = '1900-01-01';

// Mirrors the server's adultDob rule: 4-digit year in 1900..current year, and MIN_WORKER_AGE+.
export function validateDob(value, label = 'Person') {
  if (!value) return undefined;
  const match = /^(\d+)-\d{2}-\d{2}$/.exec(value);
  if (!match || match[1].length !== 4) return 'Enter a valid date of birth (year must be 4 digits)';
  const year = Number(match[1]);
  if (year < 1900 || year > new Date().getFullYear()) return 'Year must be between 1900 and the current year';
  if (value > maxAdultDob()) return `${label} must be at least ${MIN_WORKER_AGE} years old`;
  return undefined;
}
