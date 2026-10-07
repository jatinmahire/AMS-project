import { useEffect, useRef, useState } from 'react';
import { TextInput } from './FormField';
import './NumericInput.css';

const ALLOWED_CONTROL_KEYS = new Set([
  'Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown', 'Home', 'End', 'Enter', 'Escape',
]);

const LETTER_CHAR = /^[A-Za-z\s'.-]$/;
const LETTER_ONLY = /[^A-Za-z\s'.-]/g;

// Shared letters-only input for person names (First/Last/Full Name, Nominee, Witness, etc.) —
// blocks digits/symbols outright on keystroke and paste, with the same brief, self-dismissing
// flash message pattern as NumericInput.
export default function AlphabetInput({ value, onChange, error, className = '', ...props }) {
  const [flash, setFlash] = useState('');
  const [flashVisible, setFlashVisible] = useState(false);
  const hideTimeoutRef = useRef(null);
  const clearTimeoutRef = useRef(null);

  useEffect(() => () => {
    clearTimeout(hideTimeoutRef.current);
    clearTimeout(clearTimeoutRef.current);
  }, []);

  function showFlash() {
    clearTimeout(hideTimeoutRef.current);
    clearTimeout(clearTimeoutRef.current);
    setFlash('Only letters are allowed');
    setFlashVisible(true);
    hideTimeoutRef.current = setTimeout(() => setFlashVisible(false), 2000);
    clearTimeoutRef.current = setTimeout(() => setFlash(''), 2300);
  }

  function handleKeyDown(e) {
    if ((e.ctrlKey || e.metaKey) && ['a', 'c', 'v', 'x'].includes(e.key.toLowerCase())) return;
    if (ALLOWED_CONTROL_KEYS.has(e.key)) return;

    if (e.key.length === 1 && !LETTER_CHAR.test(e.key)) {
      e.preventDefault();
      showFlash();
    }
  }

  function handlePaste(e) {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text');
    const lettersOnly = pasted.replace(LETTER_ONLY, '');
    if (lettersOnly.length < pasted.length) showFlash();

    const input = e.target;
    const start = input.selectionStart ?? input.value.length;
    const end = input.selectionEnd ?? input.value.length;
    const next = input.value.slice(0, start) + lettersOnly + input.value.slice(end);
    onChange({ target: { value: next, name: props.name } });
  }

  // keydown/paste stop most invalid characters before they land, but autofill, IME input,
  // and some mobile keyboards can insert text without firing either — so also sanitize
  // on every change as a backstop, regardless of how the character arrived.
  function handleChange(e) {
    const clean = e.target.value.replace(LETTER_ONLY, '');
    if (clean !== e.target.value) showFlash();
    onChange({ target: { value: clean, name: e.target.name } });
  }

  return (
    <div className="numeric-input-wrapper">
      <TextInput
        value={value}
        onChange={handleChange}
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
