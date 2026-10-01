import Sanscript from '@indic-transliteration/sanscript';

// Sanscript's ITRANS scheme treats capital letters as retroflex-consonant
// markers (Sanskrit convention), which breaks on ordinary Title Case English
// spelling — so every word is lowercased before conversion. It also appends
// a trailing halant (्) to words ending in a bare consonant, which reads as
// wrong/truncated for Marathi names — a bare Devanagari word essentially
// never ends that way in casual writing, so it's stripped per word.
// Digit runs are round-tripped untouched: ITRANS renders 0-9 as Devanagari
// numerals, but house numbers, plot numbers, etc. inside address text must
// stay in Arabic numerals per the "never touch numbers" rule.
function transliterateWord(word) {
  return word
    .split(/(\d+)/)
    .map((segment) => (segment === '' || /^\d+$/.test(segment) ? segment : Sanscript.t(segment.toLowerCase(), 'itrans', 'devanagari')))
    .join('');
}

// Phonetic Roman-to-Devanagari transliteration for proper nouns (names,
// addresses, place names) that have no "meaning" to translate — only a
// pronunciation to approximate. Plain English spelling doesn't encode
// Devanagari vowel length or retroflex-vs-dental consonants, so the output
// is a reasonable phonetic guess, not a guaranteed-correct traditional
// spelling; callers must let a human review/edit it before it's final.
export function transliterateToDevanagari(text) {
  if (!text) return text;
  return text
    .split(' ')
    .map((word) => {
      if (!word) return word;
      const out = transliterateWord(word);
      return out.endsWith('्') ? out.slice(0, -1) : out;
    })
    .join(' ');
}
