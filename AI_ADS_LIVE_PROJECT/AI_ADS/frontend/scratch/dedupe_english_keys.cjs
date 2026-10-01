const fs = require('fs');
const path = require('path');

const translationsPath = path.join(__dirname, '../src/config/translations.js');
let content = fs.readFileSync(translationsPath, 'utf8');

// Find the English dictionary block and replace all Malayalam values with English key strings
const englishBlockMatch = content.match(/"English":\s*\{([\s\S]*?)\n  \},/);
if (englishBlockMatch) {
  let inner = englishBlockMatch[1];
  // Replace any lines that have Malayalam script values with their key name or fallback
  const lines = inner.split('\n');
  const cleanedLines = lines.map(line => {
    if (/[\u0D00-\u0D7F]/.test(line)) {
      // Line is like: "AI Ads Preferences": "AI പരസ്യ മുൻഗണനകൾ",
      const keyMatch = line.match(/"([^"]+)":\s*"[^"]*",?/);
      if (keyMatch) {
        const key = keyMatch[1];
        return `    ${JSON.stringify(key)}: ${JSON.stringify(key)},`;
      }
    }
    return line;
  });
  const newInner = cleanedLines.join('\n');
  content = content.replace(englishBlockMatch[0], `"English": {${newInner}\n  },`);
  fs.writeFileSync(translationsPath, content, 'utf8');
  console.log('Deduplicated and cleaned English dictionary successfully!');
} else {
  console.error('Could not find English block');
}
