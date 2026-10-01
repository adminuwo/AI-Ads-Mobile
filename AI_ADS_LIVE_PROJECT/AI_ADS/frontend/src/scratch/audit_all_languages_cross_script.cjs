const fs = require('fs');
const path = require('path');

const transPath = path.join(__dirname, '../config/translations.js');
let content = fs.readFileSync(transPath, 'utf8');

const cleanContent = content.replace('export const TRANSLATIONS =', 'const TRANSLATIONS =');
const fn = new Function(cleanContent + '\nreturn TRANSLATIONS;');
const TRANSLATIONS = fn();

// Script ranges
const scriptRanges = {
  Bengali: /[\u0980-\u09FF]/,
  Devanagari: /[\u0900-\u097F]/, // Hindi, Marathi, Sanskrit, Maithili, Dogri, Bodo, Konkani, Nepali
  Telugu: /[\u0C00-\u0C7F]/,
  Tamil: /[\u0B80-\u0BFF]/,
  Gujarati: /[\u0A80-\u0AFF]/,
  Gurmukhi: /[\u0A00-\u0A7F]/, // Punjabi
  Kannada: /[\u0C80-\u0CFF]/,
  Malayalam: /[\u0D00-\u0D7F]/,
  Odia: /[\u0B00-\u0B7F]/,
  Arabic: /[\u0600-\u06FF]/ // Urdu, Arabic, Kashmiri, Sindhi
};

console.log('--- DETAILED CROSS-SCRIPT AUDIT ACROSS ALL LANGUAGES ---');

for (const lang in TRANSLATIONS) {
  const dict = TRANSLATIONS[lang];
  for (const k in dict) {
    const val = String(dict[k] || '');
    
    // Check Bengali script in non-Bengali language
    if (!lang.includes('Bengali') && !lang.includes('Assamese') && scriptRanges.Bengali.test(val)) {
      console.log(`[Cross-Script Warning] Lang="${lang}" | Key="${k}" | Val="${val}" (Contains Bengali script!)`);
    }

    // Check Telugu script in non-Telugu language
    if (!lang.includes('Telugu') && scriptRanges.Telugu.test(val)) {
      console.log(`[Cross-Script Warning] Lang="${lang}" | Key="${k}" | Val="${val}" (Contains Telugu script!)`);
    }

    // Check Tamil script in non-Tamil language
    if (!lang.includes('Tamil') && scriptRanges.Tamil.test(val)) {
      console.log(`[Cross-Script Warning] Lang="${lang}" | Key="${k}" | Val="${val}" (Contains Tamil script!)`);
    }

    // Check Gujarati script in non-Gujarati language
    if (!lang.includes('Gujarati') && scriptRanges.Gujarati.test(val)) {
      console.log(`[Cross-Script Warning] Lang="${lang}" | Key="${k}" | Val="${val}" (Contains Gujarati script!)`);
    }

    // Check Devanagari script in non-Devanagari language (like Telugu, Tamil, Malayalam, Kannada, Odia, Gujarati, Gurmukhi, Arabic, English)
    const isDevanagariLang = ['Hindi', 'Marathi', 'Sanskrit', 'Maithili', 'Dogri', 'Bodo', 'Konkani', 'Nepali', 'Kashmiri', 'Sindhi'].some(l => lang.includes(l));
    if (!isDevanagariLang && scriptRanges.Devanagari.test(val) && !scriptRanges.Bengali.test(val)) {
      console.log(`[Cross-Script Warning] Lang="${lang}" | Key="${k}" | Val="${val}" (Contains Devanagari script!)`);
    }
  }
}
