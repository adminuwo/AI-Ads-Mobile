const fs = require('fs');
const path = require('path');

const transPath = path.join(__dirname, '../config/translations.js');
let content = fs.readFileSync(transPath, 'utf8');

const cleanContent = content.replace('export const TRANSLATIONS =', 'const TRANSLATIONS =');
const fn = new Function(cleanContent + '\nreturn TRANSLATIONS;');
const TRANSLATIONS = fn();

const planTierMap = {
  English: {
    enterprise: "Enterprise Suite",
    enterpriseSuite: "Enterprise Suite",
    "Enterprise Suite": "Enterprise Suite",
    enterprise_suite: "Enterprise Suite",
    agency: "Agency / Scale",
    agencyScale: "Agency / Scale",
    "Agency / Scale": "Agency / Scale",
    agency_scale: "Agency / Scale",
    pro: "Pro / Growth",
    proGrowth: "Pro / Growth",
    "Pro / Growth": "Pro / Growth",
    pro_growth: "Pro / Growth",
    starter: "Starter Plan",
    starterPlan: "Starter Plan",
    "Starter Plan": "Starter Plan",
    starter_plan: "Starter Plan",
    PLAN: "PLAN",
    SETTINGS: "SETTINGS"
  },
  Hindi: {
    enterprise: "एंटरप्राइज सूट",
    enterpriseSuite: "एंटरप्राइज सूट",
    "Enterprise Suite": "एंटरप्राइज सूट",
    enterprise_suite: "एंटरप्राइज सूट",
    agency: "एजेंसी / स्केल",
    agencyScale: "एजेंसी / स्केल",
    "Agency / Scale": "एजेंसी / स्केल",
    agency_scale: "एजेंसी / स्केल",
    pro: "प्रो / ग्रोथ",
    proGrowth: "प्रो / ग्रोथ",
    "Pro / Growth": "प्रो / ग्रोथ",
    pro_growth: "प्रो / ग्रोथ",
    starter: "स्टार्टर प्लान",
    starterPlan: "स्टार्टर प्लान",
    "Starter Plan": "स्टार्टर प्लान",
    starter_plan: "स्टार्टर प्लान",
    PLAN: "योजना",
    SETTINGS: "सेटिंग्स"
  },
  Marathi: {
    enterprise: "एंटरप्राइझ सूट",
    enterpriseSuite: "एंटरप्राइझ सूट",
    "Enterprise Suite": "एंटरप्राइझ सूट",
    enterprise_suite: "एंटरप्राइझ सूट",
    agency: "एजन्सी / स्केल",
    agencyScale: "एजन्सी / स्केल",
    "Agency / Scale": "एजन्सी / स्केल",
    agency_scale: "एजन्सी / स्केल",
    pro: "प्रो / ग्रोथ",
    proGrowth: "प्रो / ग्रोथ",
    "Pro / Growth": "प्रो / ग्रोथ",
    pro_growth: "प्रो / ग्रोथ",
    starter: "स्टार्टर प्लॅन",
    starterPlan: "स्टार्टर प्लॅन",
    "Starter Plan": "स्टार्टर प्लॅन",
    starter_plan: "स्टार्टर प्लॅन",
    PLAN: "योजना",
    SETTINGS: "सेटिंग्ज"
  },
  Bengali: {
    enterprise: "এন্টারপ্রাইজ স্যুট",
    enterpriseSuite: "এন্টারপ্রাইজ স্যুট",
    "Enterprise Suite": "এন্টারপ্রাইজ স্যুট",
    enterprise_suite: "এন্টারপ্রাইজ স্যুট",
    agency: "এজেন্সি / স্কেল",
    agencyScale: "এজেন্সি / স্কেল",
    "Agency / Scale": "এজেন্সি / স্কেল",
    agency_scale: "এজেন্সি / স্কেল",
    pro: "প্রো / গ্রোথ",
    proGrowth: "প্রো / গ্রোথ",
    "Pro / Growth": "প্রো / গ্রোথ",
    pro_growth: "প্রো / গ্রোথ",
    starter: "স্টার্টার প্ল্যান",
    starterPlan: "স্টার্টার প্ল্যান",
    "Starter Plan": "স্টার্টার প্ল্যান",
    starter_plan: "স্টার্টার প্ল্যান",
    PLAN: "পরিকল্পনা",
    SETTINGS: "সেটিংস"
  },
  Telugu: {
    enterprise: "ఎంటర్‌ప్రైజ్ సూట్",
    enterpriseSuite: "ఎంటర్‌ప్రైజ్ సూట్",
    "Enterprise Suite": "ఎంటర్‌ప్రైజ్ సూట్",
    enterprise_suite: "ఎంటర్‌ప్రైజ్ సూట్",
    agency: "ఏజెన్సీ / స్కేల్",
    agencyScale: "ఏజెన్సీ / స్కేల్",
    "Agency / Scale": "ఏజెన్సీ / స్కేల్",
    agency_scale: "ఏజెన్సీ / స్కేల్",
    pro: "ప్రో / గ్రోత్",
    proGrowth: "ప్రో / గ్రోత్",
    "Pro / Growth": "ప్రో / గ్రోత్",
    pro_growth: "ప్రో / గ్రోత్",
    starter: "స్టార్టర్ ప్లాన్",
    starterPlan: "స్టార్టర్ ప్లాన్",
    "Starter Plan": "స్టార్టర్ ప్లాన్",
    starter_plan: "స్టార్టర్ ప్లాన్",
    PLAN: "ప్లాన్",
    SETTINGS: "సెట్టింగ్‌లు"
  },
  Tamil: {
    enterprise: "என்டர்பிரைஸ் சூட்",
    enterpriseSuite: "என்டர்பிரைஸ் சூட்",
    "Enterprise Suite": "என்டர்பிரைஸ் சூட்",
    enterprise_suite: "என்டர்பிரைஸ் சூட்",
    agency: "ஏஜென்சி / ஸ்கேல்",
    agencyScale: "ஏஜென்சி / ஸ்கேல்",
    "Agency / Scale": "ஏஜென்சி / ஸ்கேல்",
    agency_scale: "ஏஜென்சி / ஸ்கேல்",
    pro: "ப்ரோ / குரோத்",
    proGrowth: "ப்ரோ / குரோத்",
    "Pro / Growth": "ப்ரோ / குரோத்",
    pro_growth: "ப்ரோ / குரோத்",
    starter: "ஸ்டார்ட்டர் பிளான்",
    starterPlan: "ஸ்டார்ட்டர் பிளான்",
    "Starter Plan": "ஸ்டார்ட்டர் பிளான்",
    starter_plan: "ஸ்டார்ட்டர் பிளான்",
    PLAN: "திட்டம்",
    SETTINGS: "அமைப்புகள்"
  },
  Gujarati: {
    enterprise: "એન્ટરપ્રાઇઝ સૂટ",
    enterpriseSuite: "એન્ટરપ્રાઇઝ સૂટ",
    "Enterprise Suite": "એન્ટરપ્રાઇઝ સૂટ",
    enterprise_suite: "એન્ટરપ્રાઇઝ સૂટ",
    agency: "એજન્સી / સ્કેલ",
    agencyScale: "એજન્સી / સ્કેલ",
    "Agency / Scale": "એજન્સી / સ્કેલ",
    agency_scale: "એજન્સી / સ્કેલ",
    pro: "પ્રો / ગ્રોથ",
    proGrowth: "પ્રો / ગ્રોથ",
    "Pro / Growth": "પ્રો / ગ્રોથ",
    pro_growth: "પ્રો / ગ્રોથ",
    starter: "સ્ટાર્ટર પ્લાન",
    starterPlan: "સ્ટાર્ટર પ્લાન",
    "Starter Plan": "સ્ટાર્ટર પ્લાન",
    starter_plan: "સ્ટાર્ટર પ્લાન",
    PLAN: "યોજના",
    SETTINGS: "સેટિંગ્સ"
  },
  Urdu: {
    enterprise: "انٹرپرائز سوٹ",
    enterpriseSuite: "انٹرپرائز سوٹ",
    "Enterprise Suite": "انٹرپرائز سوٹ",
    enterprise_suite: "انٹرپرائز سوٹ",
    agency: "ایجنسی / اسکیل",
    agencyScale: "ایجنسی / اسکیل",
    "Agency / Scale": "ایجنسی / اسکیل",
    agency_scale: "ایجنسی / اسکیل",
    pro: "پرو / گروتھ",
    proGrowth: "پرو / گروتھ",
    "Pro / Growth": "پرو / گروتھ",
    pro_growth: "پرو / گروتھ",
    starter: "اسٹارٹر پلان",
    starterPlan: "اسٹارٹر پلان",
    "Starter Plan": "اسٹارٹر پلان",
    starter_plan: "اسٹارٹر پلان",
    PLAN: "منصوبہ",
    SETTINGS: "ترتیبات"
  },
  Kannada: {
    enterprise: "ಎಂಟರ್‌ಪ್ರೈಸ್ ಸೂಟ್",
    enterpriseSuite: "ಎಂಟರ್‌ಪ್ರೈಸ್ ಸೂಟ್",
    "Enterprise Suite": "ಎಂಟರ್‌ಪ್ರೈಸ್ ಸೂಟ್",
    enterprise_suite: "ಎಂಟರ್‌ಪ್ರೈಸ್ ಸೂಟ್",
    agency: "ಏಜೆನ್ಸಿ / ಸ್ಕೇಲ್",
    agencyScale: "ಏಜೆನ್ಸಿ / ಸ್ಕೇಲ್",
    "Agency / Scale": "ಏಜೆನ್ಸಿ / ಸ್ಕೇಲ್",
    agency_scale: "ಏಜೆನ್ಸಿ / ಸ್ಕೇಲ್",
    pro: "ప్రో / గ్రోథ్",
    proGrowth: "ಪ್ರೋ / ಗ್ರೋಥ್",
    "Pro / Growth": "ಪ್ರೋ / ಗ್ರೋಥ್",
    pro_growth: "ಪ್ರೋ / ಗ್ರೋಥ್",
    starter: "స్టార్టర్ ప్లాన్",
    starterPlan: "స్టార్టర్ ప్లాన్",
    "Starter Plan": "స్టార్టర్ ప్లాన్",
    starter_plan: "స్టార్టర్ ప్లాన్",
    PLAN: "ಯೋಜನೆ",
    SETTINGS: "ಸೆಟ್ಟಿಂಗ್‌ಗಳು"
  },
  Malayalam: {
    enterprise: "എൻ്റർപ്രൈസ് സ്യൂട്ട്",
    enterpriseSuite: "എൻ്റർപ്രൈസ് സ്യൂട്ട്",
    "Enterprise Suite": "എൻ്റർപ്രൈസ് സ്യൂട്ട്",
    enterprise_suite: "എൻ്റർപ്രൈസ് സ്യൂട്ട്",
    agency: "ഏജൻസി / സ്കെയിൽ",
    agencyScale: "ഏജൻസി / സ്കെയിൽ",
    "Agency / Scale": "ഏജൻസി / സ്കെയിൽ",
    agency_scale: "ഏജൻസി / സ്കെയിൽ",
    pro: "പ്രോ / ഗ്രോത്ത്",
    proGrowth: "പ്രോ / ഗ്രോത്ത്",
    "Pro / Growth": "പ്രോ / ഗ്രോത്ത്",
    pro_growth: "പ്രോ / ഗ്രോത്ത്",
    starter: "സ്റ്റാർട്ടർ പ്ലാൻ",
    starterPlan: "സ്റ്റാർട്ടർ പ്ലാൻ",
    "Starter Plan": "സ്റ്റാർട്ടർ പ്ലാൻ",
    starter_plan: "സ്റ്റാർട്ടർ പ്ലാൻ",
    PLAN: "പ്ലാൻ",
    SETTINGS: "സെറ്റിംഗ്സുകൾ"
  },
  Odia: {
    enterprise: "ଏଣ୍ଟରପ୍ରାଇଜ୍ ସୁଟ୍",
    enterpriseSuite: "ଏଣ୍ଟରପ୍ରାଇଜ୍ ସୁଟ୍",
    "Enterprise Suite": "ଏଣ୍ଟରପ୍ରାଇଜ୍ ସୁଟ୍",
    enterprise_suite: "ଏଣ୍ଟରପ୍ରାଇଜ୍ ସୁଟ୍",
    agency: "ଏଜେନ୍ସି / ସ୍କେଲ୍",
    agencyScale: "ଏଜେନ୍ସି / ସ୍କେଲ୍",
    "Agency / Scale": "ଏଜେନ୍ସି / ସ୍କେଲ୍",
    agency_scale: "ଏଜେନ୍ସି / ସ୍କେଲ୍",
    pro: "ପ୍ରୋ / ଗ୍ରୋଥ୍",
    proGrowth: "ପ୍ରୋ / ଗ୍ରୋଥ୍",
    "Pro / Growth": "ପ୍ରୋ / ଗ୍ରୋଥ୍",
    pro_growth: "ପ୍ରୋ / ଗ୍ରୋଥ୍",
    starter: "ଷ୍ଟାର୍ଟର ପ୍ଲାନ୍",
    starterPlan: "ଷ୍ଟାର୍ଟର ପ୍ଲାନ୍",
    "Starter Plan": "ଷ୍ଟାର୍ଟର ପ୍ଲାନ୍",
    starter_plan: "ଷ୍ଟାର୍ଟର ପ୍ଲାନ୍",
    PLAN: "ଯୋଜନା",
    SETTINGS: "ସେଟିଂସ"
  },
  Punjabi: {
    enterprise: "ਐਂਟਰਪ੍ਰਾਈਜ਼ ਸੂਟ",
    enterpriseSuite: "ਐਂਟਰਪ੍ਰਾਈਜ਼ ਸੂਟ",
    "Enterprise Suite": "ਐਂਟਰਪ੍ਰਾਈਜ਼ ਸੂਟ",
    enterprise_suite: "ਐਂਟਰਪ੍ਰਾਈਜ਼ ਸੂਟ",
    agency: "ਏਜੰਸੀ / ਸਕੇਲ",
    agencyScale: "ਏਜੰਸੀ / ਸਕੇਲ",
    "Agency / Scale": "ਏਜੰਸੀ / ਸਕੇਲ",
    agency_scale: "ਏਜੰਸੀ / ਸਕੇਲ",
    pro: "ਪ੍ਰੋ / ਗ੍ਰੋਥ",
    proGrowth: "ਪ੍ਰੋ / ਗ੍ਰੋਥ",
    "Pro / Growth": "ਪ੍ਰੋ / ਗ੍ਰੋਥ",
    pro_growth: "ਪ੍ਰੋ / ਗ੍ਰੋਥ",
    starter: "ਸਟਾਰਟਰ ਪਲਾਨ",
    starterPlan: "ਸਟਾਰਟਰ ਪਲਾਨ",
    "Starter Plan": "ਸਟਾਰਟਰ ਪਲਾਨ",
    starter_plan: "ਸਟਾਰਟਰ ਪਲਾਨ",
    PLAN: "ਯੋਜਨਾ",
    SETTINGS: "ਸੈਟਿੰਗਾਂ"
  }
};

for (const langKey in TRANSLATIONS) {
  const baseLang = langKey.split(' ')[0];
  const dict = TRANSLATIONS[langKey];
  const planData = planTierMap[baseLang] || planTierMap.English;

  for (const k in planData) {
    dict[k] = planData[k];
  }
}

const updatedCode = `/**
 * Centralized Multi-Language Dictionaries for AI ADS™
 * i18next & WorkspaceContext compatible native script translation registry.
 */

export const TRANSLATIONS = ${JSON.stringify(TRANSLATIONS, null, 2)};
`;

fs.writeFileSync(transPath, updatedCode, 'utf8');
console.log('Successfully updated plan & tier translations across all languages!');
