export function getErrorMessage(error) {
  return error.response?.data?.message || 'Something went wrong. Please try again.';
}

export function getFieldErrors(error) {
  return error.response?.data?.fieldErrors || {};
}
