/**
 * Centralized Backend Language Helper for AI ADS™
 * Translates stable language codes into standardized Gemini/LLM prompts.
 */

const LANGUAGE_MAP = {
  'en-IN': { name: 'English', nativeName: 'English', code: 'en-IN' },
  'hi-IN': { name: 'Hindi', nativeName: 'हिन्दी', code: 'hi-IN' },
  'bn-IN': { name: 'Bengali', nativeName: 'বাংলা', code: 'bn-IN' },
  'mr-IN': { name: 'Marathi', nativeName: 'मराठी', code: 'mr-IN' },
  'te-IN': { name: 'Telugu', nativeName: 'తెలుగు', code: 'te-IN' },
  'ta-IN': { name: 'Tamil', nativeName: 'தமிழ்', code: 'ta-IN' },
  'gu-IN': { name: 'Gujarati', nativeName: 'ગુજરાતી', code: 'gu-IN' },
  'ur-IN': { name: 'Urdu', nativeName: 'اردو', code: 'ur-IN' },
  'kn-IN': { name: 'Kannada', nativeName: 'ಕನ್ನಡ', code: 'kn-IN' },
  'or-IN': { name: 'Odia', nativeName: 'ଓଡ଼ିଆ', code: 'or-IN' },
  'ml-IN': { name: 'Malayalam', nativeName: 'മലയാളം', code: 'ml-IN' },
  'pa-IN': { name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', code: 'pa-IN' },
  'as-IN': { name: 'Assamese', nativeName: 'অসমীয়া', code: 'as-IN' },
  'mai-IN': { name: 'Maithili', nativeName: 'मैथिली', code: 'mai-IN' },
  'sa-IN': { name: 'Sanskrit', nativeName: 'संस्कृतम्', code: 'sa-IN' },
  'ks-IN': { name: 'Kashmiri', nativeName: 'कॉशुर', code: 'ks-IN' },
  'kok-IN': { name: 'Konkani', nativeName: 'कोंकणी', code: 'kok-IN' },
  'sd-IN': { name: 'Sindhi', nativeName: 'सिन्धी', code: 'sd-IN' },
  'ne-IN': { name: 'Nepali', nativeName: 'नेपाली', code: 'ne-IN' },
  'mni-IN': { name: 'Manipuri', nativeName: 'মৈতৈলোন্', code: 'mni-IN' },
  'doi-IN': { name: 'Dogri', nativeName: 'डोगरी', code: 'doi-IN' },
  'brx-IN': { name: 'Bodo', nativeName: 'बड़ो', code: 'brx-IN' },
  'sat-IN': { name: 'Santali', nativeName: 'ᱥᱟᱱᱛᱟᱲᱤ', code: 'sat-IN' }
};

/**
 * Resolves input string or code to a language object
 */
function resolveLanguage(input) {
  if (!input) return LANGUAGE_MAP['en-IN'];
  const clean = String(input).trim().toLowerCase();
  
  if (LANGUAGE_MAP[input]) return LANGUAGE_MAP[input];

  for (const entry of Object.values(LANGUAGE_MAP)) {
    if (entry.code.toLowerCase() === clean || entry.name.toLowerCase() === clean.split(' ')[0]) {
      return entry;
    }
  }
  return LANGUAGE_MAP['en-IN'];
}

/**
 * Builds standard AI language directive prompt text
 */
function buildLanguageInstruction(languageInput) {
  const lang = resolveLanguage(languageInput);
  if (lang.code === 'en-IN' && !languageInput) {
    return '';
  }

  return `
═══════════════════════════════════════════════════════
TARGET LANGUAGE DIRECTIVE:
Output Language: ${lang.name} (${lang.nativeName}) [Code: ${lang.code}]

1. Write and generate ALL copy, text, headlines, titles, body paragraphs, captions, hooks, bullet points, CTA buttons, and marketing strategies STRICTLY in ${lang.name} (${lang.nativeName}) language.
2. Do NOT output English unless:
   - A proper brand name requires English (e.g. "Nike", "Apple", "AI Ads™").
   - A URL / domain / email address / phone number / registered trademark / technical code snippet must remain unchanged.
3. Preserve original factual meaning, marketing intent, emotional tone, and brand positioning.
4. Ensure correct regional script writing and natural phrasing.
═══════════════════════════════════════════════════════`;
}

module.exports = {
  LANGUAGE_MAP,
  resolveLanguage,
  buildLanguageInstruction
};
