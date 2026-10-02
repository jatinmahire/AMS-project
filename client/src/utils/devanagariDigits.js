const DEVANAGARI_DIGITS = ['०', '१', '२', '३', '४', '५', '६', '७', '८', '९'];

// Swaps Latin 0–9 for Devanagari numeral glyphs; every other character passes through unchanged.
export function toDevanagariDigits(value) {
  if (value === null || value === undefined) return '';
  return String(value).replace(/[0-9]/g, (d) => DEVANAGARI_DIGITS[d]);
}
