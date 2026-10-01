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
  'websiteBuilder', 'PLAN', 'SETTINGS'
];

for (const lang in TRANSLATIONS) {
  console.log(`\n=================== ${lang} ===================`);
  const dict = TRANSLATIONS[lang];
  for (const k of sidebarKeys) {
    console.log(`  ${k.padEnd(15)} : ${dict[k]}`);
  }
}
