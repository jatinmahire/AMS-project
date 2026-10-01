import { transliterateToDevanagari } from './transliterate';

// Designations have real Marathi equivalents (unlike names/addresses), so
// these are translated via lookup, not phonetically transliterated — a
// phonetic guess at "Carpenter" produces nonsense, not "सुतार".
// Covers the designations already seeded in this system plus the common
// BOCW/construction trades likely to be added to the Designation master.
const DESIGNATION_TRANSLATIONS = {
  mason: 'गवंडी',
  carpenter: 'सुतार',
  electrician: 'विद्युत तंत्रज्ञ',
  painter: 'रंगारी',
  plumber: 'प्लंबर',
  helper: 'मदतनीस',
  supervisor: 'पर्यवेक्षक',
  welder: 'वेल्डर',
  fitter: 'फिटर',
  driver: 'चालक',
  watchman: 'राखणदार',
  'security guard': 'सुरक्षा रक्षक',
  cleaner: 'सफाई कामगार',
  labourer: 'मजूर',
  laborer: 'मजूर',
  'bar bender': 'सळई वाकवणारा',
  'steel fixer': 'सळई कामगार',
  tiler: 'टाइल्स कारागीर',
  'tile fitter': 'टाइल्स कारागीर',
  bricklayer: 'विटकाम कारागीर',
  foreman: 'फोरमन',
  'store keeper': 'स्टोअर कीपर',
};

// For any designation not in the dictionary, fall back to transliteration
// rather than leaving it in English — the certificate should never silently
// show Latin script where Marathi is expected.
export function translateDesignation(designationName) {
  if (!designationName) return designationName;
  const match = DESIGNATION_TRANSLATIONS[designationName.trim().toLowerCase()];
  return match || transliterateToDevanagari(designationName);
}
