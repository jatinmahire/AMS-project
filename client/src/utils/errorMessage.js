export function getErrorMessage(error) {
  const data = error.response?.data;
  if (!data) return 'Something went wrong. Please try again.';

  const fieldErrors = data.fieldErrors;
  if (fieldErrors && Object.keys(fieldErrors).length > 0) {
    // The bare top-level message ("Validation failed") was shown on its own, with the
    // actual reason only available as a per-field error — useless when the offending
    // field sits on a step/section the user isn't currently looking at. Fold the real
    // reasons into the toast itself instead of just naming the category of problem.
    return `${data.message}: ${Object.values(fieldErrors).join('; ')}`;
  }

  return data.message || 'Something went wrong. Please try again.';
}

export function getFieldErrors(error) {
  return error.response?.data?.fieldErrors || {};
}
