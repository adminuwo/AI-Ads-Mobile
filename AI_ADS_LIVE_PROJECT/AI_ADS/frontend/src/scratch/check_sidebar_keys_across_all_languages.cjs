const fs = require('fs');
const path = require('path');

const transPath = path.join(__dirname, '../config/translations.js');
let content = fs.readFileSync(transPath, 'utf8');

const cleanContent = content.replace('export const TRANSLATIONS =', 'const TRANSLATIONS =');
const fn = new Function(cleanContent + '\nreturn TRANSLATIONS;');
const TRANSLATIONS = fn();

const sidebarKeys = [
  'dashboard', 'brands', 'seo', 'campaigns', 'strategy',
  'calendar', 'studio', 'approvals', 'creative', 'assets',
  'websiteBuilder', 'settings', 'plan', 'PLAN', 'SETTINGS'
];

console.log('--- CHECKING SIDEBAR KEYS ACROSS ALL LANGUAGES ---');

for (const lang in TRANSLATIONS) {
  const dict = TRANSLATIONS[lang];
  const missing = [];
  const items = {};
  for (const k of sidebarKeys) {
    if (dict[k]) {
      items[k] = dict[k];
    } else {
      missing.push(k);
    }
  }
  console.log(`Language: "${lang}" -> Missing: ${missing.length > 0 ? missing.join(', ') : 'NONE'}`);
}
