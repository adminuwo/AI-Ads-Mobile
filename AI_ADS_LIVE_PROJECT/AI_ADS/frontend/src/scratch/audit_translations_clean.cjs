const fs = require('fs');
const path = require('path');

const transPath = path.join(__dirname, '../config/translations.js');
let content = fs.readFileSync(transPath, 'utf8');

const cleanContent = content.replace('export const TRANSLATIONS =', 'const TRANSLATIONS =');
const fn = new Function(cleanContent + '\nreturn TRANSLATIONS;');
const TRANSLATIONS = fn();

console.log('Available languages in translations.js:');
console.log(Object.keys(TRANSLATIONS));

// Check Marathi keys specifically
console.log('\n--- MARATHI DICTIONARY CHECK ---');
const marathi = TRANSLATIONS["Marathi"] || TRANSLATIONS["Marathi (मराठी)"];
if (marathi) {
  for (const k in marathi) {
    const val = marathi[k];
    // Check if value contains Bengali characters (U+0980 to U+09FF)
    if (/[\u0980-\u09FF]/.test(val)) {
      console.log(`BENGALI SCRIPT FOUND IN MARATHI: key="${k}" -> val="${val}"`);
    }
  }
}
