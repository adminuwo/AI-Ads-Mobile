const fs = require('fs');
const path = require('path');

// 1. Update WorkspaceContext.jsx to import TRANSLATIONS from ../config/translations.js and remove legacy duplicate TRANSLATIONS object
const wsPath = path.join(__dirname, '../context/WorkspaceContext.jsx');
let wsContent = fs.readFileSync(wsPath, 'utf8');

// Add import if not present
if (!wsContent.includes("import { TRANSLATIONS }")) {
  wsContent = wsContent.replace(
    "import i18n from '../config/i18n.js';",
    "import i18n from '../config/i18n.js';\nimport { TRANSLATIONS } from '../config/translations.js';"
  );
}

// Remove export const TRANSLATIONS = { ... }; block
const transStartIndex = wsContent.indexOf('export const TRANSLATIONS = {');
const transEndIndex = wsContent.indexOf('export const WorkspaceProvider = ({ children }) => {');

if (transStartIndex !== -1 && transEndIndex !== -1 && transStartIndex < transEndIndex) {
  wsContent = wsContent.slice(0, transStartIndex) + wsContent.slice(transEndIndex);
  fs.writeFileSync(wsPath, wsContent, 'utf8');
  console.log('Successfully replaced legacy TRANSLATIONS in WorkspaceContext.jsx with import from config/translations.js');
} else {
  console.error('Could not find TRANSLATIONS block bounds in WorkspaceContext.jsx');
}

// 2. Update BrandDnaModule.jsx to use 'Industry' key
const dnaPath = path.join(__dirname, '../features/brandDna/BrandDnaModule.jsx');
let dnaContent = fs.readFileSync(dnaPath, 'utf8');

dnaContent = dnaContent.replaceAll("{t('industry', 'Industry')}", "{t('Industry', 'Industry')}");
dnaContent = dnaContent.replaceAll('{t("industry", "Industry")}', '{t("Industry", "Industry")}');

fs.writeFileSync(dnaPath, dnaContent, 'utf8');
console.log('Successfully updated BrandDnaModule.jsx to use Industry key!');
