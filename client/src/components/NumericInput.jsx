import { useEffect, useRef, useState } from 'react';
import { TextInput } from './FormField';
import { digitsLengthMessage } from '../utils/validators';
import './NumericInput.css';

const ALLOWED_CONTROL_KEYS = new Set([
  'Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Enter', 'Escape',
]);

// Shared digits-only input: blocks non-digit keystrokes and pastes outright,
// enforces an exact or max digit length the same way a native maxLength
// would, and surfaces a brief, self-dismissing inline message explaining
// why a keystroke/paste was rejected — separate from the field's normal
// persistent validation error (still shown via the parent FormField/error
// prop as usual).
export default function NumericInput({ value, onChange, error, exactLength, maxLength, label = 'This field', className = '', ...props }) {
  const limit = exactLength || maxLength;
  const [flash, setFlash] = useState('');
  const [flashVisible, setFlashVisible] = useState(false);
  const hideTimeoutRef = useRef(null);
  const clearTimeoutRef = useRef(null);

  useEffect(() => () => {
    clearTimeout(hideTimeoutRef.current);
    clearTimeout(clearTimeoutRef.current);
  }, []);

  function showFlash(message) {
    clearTimeout(hideTimeoutRef.current);
    clearTimeout(clearTimeoutRef.current);
    setFlash(message);
    setFlashVisible(true);
    hideTimeoutRef.current = setTimeout(() => setFlashVisible(false), 2000);
    clearTimeoutRef.current = setTimeout(() => setFlash(''), 2300);
  }

  function lengthMessage() {
    return digitsLengthMessage(label, { exactLength, maxLength });
  }

  function handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) return;
    if (ALLOWED_CONTROL_KEYS.has(e.key)) return;

    if (e.key.length === 1 && !/^[0-9]$/.test(e.key)) {
      e.preventDefault();
      showFlash('Only numbers are allowed');
      return;
    }

    if (e.key.length === 1 && limit) {
      const hasSelection = e.target.selectionStart !== e.target.selectionEnd;
      if (!hasSelection && e.target.value.length >= limit) {
        e.preventDefault();
        showFlash(lengthMessage());
      }
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    const digitsOnly = pasted.replace(/\D/g, '');
    if (digitsOnly.length < pasted.length) {
      showFlash('Only numbers are allowed');
    }

    const input = e.target;
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    let next = input.value.slice(0, start) + digitsOnly + input.value.slice(end);
    if (limit && next.length > limit) {
      next = next.slice(0, limit);
      showFlash(lengthMessage());
    }
    onChange({ target: { value: next, name: props.name } });
  }

  return (
    <div className="numeric-input-wrapper">
      <TextInput
        inputMode="numeric"
        value={value}
        onChange={onChange}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        error={error}
        className={className}
        {...props}
      />
      {flash && (
        <p className={`numeric-input-flash ${flashVisible ? '' : 'numeric-input-flash-hidden'}`}>{flash}</p>
      )}
    </div>
  );
}
