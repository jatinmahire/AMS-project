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
