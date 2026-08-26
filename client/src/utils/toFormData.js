export function toFormData(values) {
  const formData = new FormData();

  for (const [key, value] of Object.entries(values)) {
    if (value === undefined || value === null || value === '') continue;
    if (value instanceof File) {
      formData.append(key, value);
    } else if (value instanceof Date) {
      formData.append(key, value.toISOString());
    } else {
      formData.append(key, String(value));
    }
  }

  return formData;
}
