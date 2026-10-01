import { TextInput } from './FormField';
import { validateEmailField } from '../utils/validators';

// Shared email input: real `type="email"` as a baseline hint, plus format
// validation on blur (an intentionally-empty optional field is never
// flagged — only a non-empty, malformed value is) using the same
// `validateEmailField` check the form's own submit-time validation reuses,
// so the rule and its wording can never drift apart between the two.
export default function EmailInput({ value, onChange, onBlur, onValidate, error, ...props }) {
  function handleBlur(e) {
    onValidate?.(validateEmailField(e.target.value));
    onBlur?.(e);
  }

  return (
    <TextInput
      type="email"
      value={value}
      onChange={onChange}
      onBlur={handleBlur}
      error={error}
      {...props}
    />
  );
}
