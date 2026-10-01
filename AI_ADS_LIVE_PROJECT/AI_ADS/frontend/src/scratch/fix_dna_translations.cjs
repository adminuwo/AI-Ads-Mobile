const fs = require('fs');
const path = require('path');

const transPath = path.join(__dirname, '../config/translations.js');
let content = fs.readFileSync(transPath, 'utf8');

// Define mapping of native DNA representations
const dnaMap = {
  Hindi: { dna: "डीएनए", brandDna: "ब्रांड डीएनए", title: "ब्रांड इंटेलिजेंस और ब्रांड डीएनए" },
  Bengali: { dna: "ডিএনএ", brandDna: "ব্র্যান্ড ডিএনএ", title: "ব্র্যান্ড ইন্টেলিজেন্স ও ব্র্যান্ড ডিএনএ" },
  Marathi: { dna: "डीएनए", brandDna: "ब्रँड डीएनए", title: "ब्रँड इंटेलिजन्स आणि ब्रँड डीएनए" },
  Telugu: { dna: "డీఎన్‌ఏ", brandDna: "బ్రాండ్ డీఎన్‌ఏ", title: "బ్రాండ్ ఇంటెలిజెన్స్ & బ్రాండ్ డీఎన్‌ఏ" },
  Tamil: { dna: "டிஎன்ஏ", brandDna: "பிராண்ட் டிஎன்ஏ", title: "பிராண்ட் இன்டலிஜென்ஸ் & பிராண்ட் டிஎன்ஏ" },
  Gujarati: { dna: "ડીએનએ", brandDna: "બ્રાન્ડ ડીએનએ", title: "બ્રાન્ડ ઈન્ટેલિજન્સ & બ્રાન્ડ ડીએનએ" },
  Urdu: { dna: "ڈی این اے", brandDna: "برانڈ ڈی این اے", title: "برانڈ انٹیلی جنس اور برانڈ ڈی این اے" },
  Kannada: { dna: "ಡಿಎನ್‌ಎ", brandDna: "ಬ್ರ್ಯಾಂಡ್ ಡಿಎನ್‌ಎ", title: "ಬ್ರ್ಯಾಂಡ್ ಇಂಟೆಲಿಜೆನ್ಸ್ & ಬ್ರ್ಯಾಂಡ್ ಡಿಎನ್‌ಎ" },
  Odia: { dna: "ଡିଏନ୍ଏ", brandDna: "ବ୍ରାଣ୍ଡ ଡିଏନ୍ଏ", title: "ବ୍ରାଣ୍ଡ୍ ଇଣ୍ଟେଲିଜେନ୍ସ ଏବଂ ବ୍ରାଣ୍ଡ୍ ଡିଏନ୍ଏ" },
  Malayalam: { dna: "ഡിഎൻഎ", brandDna: "ബ്രാൻഡ് ഡിഎൻഎ", title: "ബ്രാൻഡ് ഇന്റലിജൻസും ബ്രാൻഡ് ഡിഎൻഎയും" },
  Punjabi: { dna: "ਡੀਐਨਏ", brandDna: "ਬ੍ਰਾਂਡ ਡੀਐਨਏ", title: "ਬ੍ਰਾਂਡ ਇੰਟੈਲੀਜੈਂਸ & ਬ੍ਰਾਂਡ ਡੀਐਨਏ" },
  Assamese: { dna: "ডিএনএ", brandDna: "ব্ৰ্যান্ড ডিএনএ", title: "ব্ৰ্যান্ড বুদ্ধিমত্তা আৰু ব্ৰ্যান্ড ডিএনএ" },
  Maithili: { dna: "डीएनए", brandDna: "ब्रांड डीएनए", title: "ब्रांड इंटेलिजेंस एवं ब्रांड डीएनए" },
  Sanskrit: { dna: "डीएनए", brandDna: "ब्रांड डीएनए", title: "ब्रांड बुद्धिमत्ता एवं ब्रांड डीएनए" },
  Kashmiri: { dna: "ڈی این اے", brandDna: "برانڈ ڈی این اے", title: "برانڈ انٹیلی جنس و برانڈ ڈی این اے" },
  Sindhi: { dna: "ڊي اين اي", brandDna: "برانڊ ڊي اين اي", title: "برانڊ انٽيليجنس ۽ برانڊ ڊي اين اي" },
  Konkani: { dna: "डीएनए", brandDna: "ब्रांड डीएनए", title: "ब्रांड इंटेलिजेंस आनी ब्रांड डीएनए" },
  Manipuri: { dna: "ꯗꯤ ꯑꯦꯟ ꯑꯦ", brandDna: "ꯕ꯭ꯔꯥꯟꯗ ꯗꯤ ꯑꯦꯟ ꯑꯦ", title: "ꯕ꯭ꯔꯥꯟꯗ ꯏꯟꯇꯦꯂꯤꯖꯦꯟꯁ & ꯕ꯭ꯔꯥꯟꯗ ꯗꯤ ꯑꯦꯟ ꯑꯦ" },
  Dogri: { dna: "डीएनए", brandDna: "ब्रांड डीएनए", title: "ब्रांड इंटेलिजेंस ते ब्रांड डीएनए" },
  Bodo: { dna: "डीएनए", brandDna: "ब्रांड डीएनए", title: "ब्रांड इंटेलिजेंस आरो ब्रांड डीएनए" },
  Santali: { dna: "ᱰᱤ ᱮᱱ ᱮ", brandDna: "ᱵᱨᱟᱱᱰ ᱰᱤ ᱮᱱ ᱮ", title: "ᱵᱨᱟᱱᱰ ᱤᱱᱴᱮᱞᱤᱡᱮᱱᱥ & ᱵᱨᱟᱱᱰ ᱰᱤ ᱮᱱ ᱮ" },
  Russian: { dna: "ДНК", brandDna: "ДНК бренда", title: "Аналитика бренда и ДНК бренда" },
  Arabic: { dna: "الحمض النووي", brandDna: "الحمض النووي للعلامة التجارية", title: "ذكاء العلامة التجارية والحمض النووي للعلامة التجارية" },
  Spanish: { dna: "ADN", brandDna: "ADN de marca", title: "Inteligencia de Marca y ADN de Marca" },
  French: { dna: "ADN", brandDna: "ADN de marque", title: "Intelligence de Marque et ADN de Marque" }
};

// Evaluate TRANSLATIONS object from code
const cleanContent = content.replace('export const TRANSLATIONS =', 'const TRANSLATIONS =');
const fn = new Function(cleanContent + '\nreturn TRANSLATIONS;');
const TRANSLATIONS = fn();

for (const langKey in TRANSLATIONS) {
  // Extract base language name
  const langName = langKey.split(' ')[0];
  const mapData = dnaMap[langName];
  if (!mapData) continue;

  const dict = TRANSLATIONS[langKey];
  dict["brands"] = mapData.brandDna;
  dict["Brand DNA"] = mapData.brandDna;
  dict["brandDna"] = mapData.brandDna;
  dict["brandDnaBadge"] = mapData.brandDna;
  dict["1. Brand DNA"] = `1. ${mapData.brandDna}`;
  dict["brandDnaTitle"] = mapData.title;
  dict["Brand Intelligence & Brand DNA"] = mapData.title;
}

const updatedCode = `/**
 * Centralized Multi-Language Dictionaries for AI ADS™
 * i18next & WorkspaceContext compatible native script translation registry.
 */

export const TRANSLATIONS = ${JSON.stringify(TRANSLATIONS, null, 2)};
`;

fs.writeFileSync(transPath, updatedCode, 'utf8');
console.log('Successfully updated all DNA entries in translations.js to native scripts!');
