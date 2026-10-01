const fs = require('fs');
const path = require('path');

const transPath = path.join(__dirname, '../config/translations.js');
let content = fs.readFileSync(transPath, 'utf8');

const cleanContent = content.replace('export const TRANSLATIONS =', 'const TRANSLATIONS =');
const fn = new Function(cleanContent + '\nreturn TRANSLATIONS;');
const TRANSLATIONS = fn();

// Comprehensive verified dictionaries for Marathi & Telugu
const marathiDict = {
  "dashboard": "डॅशबोर्ड",
  "Dashboard": "डॅशबोर्ड",
  "goodMorning": "शुभ सकाळ",
  "Good morning": "शुभ सकाळ",
  "goodAfternoon": "शुभ दुपार",
  "Good afternoon": "शुभ दुपार",
  "goodEvening": "शुभ संध्याकाळ",
  "Good evening": "शुभ संध्याकाळ",
  "heroSubtitle": "AI च्या मदतीने कल्पनांना प्रभावशाली ब्रँडमध्ये बदला.",
  "Turn ideas into impactful brands with AI.": "AI च्या मदतीने कल्पनांना प्रभावशाली ब्रँडमध्ये बदला.",
  "createFaster": "जलद तयार करा",
  "Create Faster": "जलद तयार करा",
  "betterContent": "उत्कृष्ट सामग्री",
  "Better Content": "उत्कृष्ट सामग्री",
  "smarterCampaigns": "स्मार्ट मोहिमा",
  "Smarter Campaigns": "स्मार्ट मोहिमा",
  "higherRoi": "उच्च आरओआय",
  "Higher ROI": "उच्च आरओआय",
  "totalBrands": "एकूण ब्रँड्स",
  "Total Brands": "एकूण ब्रँड्स",
  "brandProfilesInAccount": "तुमच्या खात्यातील ब्रँड प्रोफाईल्स",
  "brand profiles in your account": "तुमच्या खात्यातील ब्रँड प्रोफाईल्स",
  "totalGeneratedContent": "एकूण तयार केलेली सामग्री",
  "Total Generated Content": "एकूण तयार केलेली सामग्री",
  "savedInAssetLibraryDb": "ॲसेट लायब्ररी आणि डीबीमध्ये जतन केले (कॅलेंडर वगळून)",
  "Saved in Asset Library & DB (excl. calendar)": "ॲसेट लायब्ररी आणि डीबीमध्ये जतन केले (कॅलेंडर वगळून)",
  "totalCampaigns": "एकूण मोहिमा",
  "Total Campaigns": "एकूण मोहिमा",
  "currentlyActive": "सध्या सक्रिय",
  "currently active": "सध्या सक्रिय",
  "endToEndPipeline": "एंड-टू-एंड कंटेंट पाईपलाईन",
  "END-TO-END CONTENT PIPELINE": "एंड-टू-एंड कंटेंट पाईपलाईन",
  "fromStrategyToSuccess": "धोरणापासून यशापर्यंत →",
  "From Strategy to Success →": "धोरणापासून यशापर्यंत →",
  "assetLibraryStepTitle": "4. ॲसेट लायब्ररी",
  "4. Asset Library": "4. ॲसेट लायब्ररी",
  "assetLibraryStepSub": "जतन केलेले माध्यम आणि वॉल्ट",
  "Saved Media & Vault": "जतन केलेले माध्यम आणि वॉल्ट",
  "websiteBuilderStepTitle": "5. वेबसाइट बिल्डर",
  "5. Website Builder": "5. वेबसाइट बिल्डर",
  "websiteBuilderStepSub": "एआय पेजेस आणि साइट्स",
  "AI Pages & Sites": "एआय पेजेस आणि साइट्स",
  "currentPlan": "सध्याची योजना",
  "CURRENT PLAN": "सध्याची योजना",
  "managePlan": "व्यवस्थापित करा",
  "Manage": "व्यवस्थापित करा",
  "enterpriseSuite": "एंटरप्राइज सूट",
  "Enterprise Suite": "एंटरप्राइज सूट",
  "agencyScale": "एजन्सी / स्केल",
  "Agency / Scale": "एजन्सी / स्केल",
  "proGrowth": "प्रो / ग्रोथ",
  "Pro / Growth": "प्रो / ग्रोथ",
  "starterPlan": "स्टार्टर प्लॅन",
  "Starter Plan": "स्टार्टर प्लॅन",
  "brands": "ब्रँड डीएनए",
  "Brand DNA": "ब्रँड डीएनए",
  "brandDnaTitle": "ब्रँड इंटेलिजन्स आणि ब्रँड डीएनए",
  "Brand Intelligence & Brand DNA": "ब्रँड इंटेलिजन्स आणि ब्रँड डीएनए",
  "seo": "एसईओ इंटेलिजन्स",
  "SEO Intelligence": "एसईओ इंटेलिजन्स",
  "strategy": "धोरण",
  "Strategy": "धोरण",
  "campaigns": "मोहिमा",
  "Campaigns": "मोहिमा",
  "calendar": "कॅलेंडर",
  "Calendar": "कॅलेंडर",
  "studio": "कंटेंट स्टुडिओ",
  "Content Studio": "कंटेंट स्टुडिओ",
  "approvals": "मंजुरी डेस्क",
  "Approvals Desk": "मंजुरी डेस्क",
  "creative": "क्रिएटिव्ह स्टुडिओ",
  "Creative Studio": "क्रिएटिव्ह स्टुडिओ",
  "assets": "ॲसेट लायब्ररी",
  "Asset Library": "ॲसेट लायब्ररी",
  "websiteBuilder": "एआय वेबसाइट बिल्डर",
  "AI Website Builder": "एआय वेबसाइट बिल्डर",
  "settings": "सेटिंग्ज आणि बिलिंग",
  "Settings & Billing": "सेटिंग्ज आणि बिलिंग",
  "back": "मागे",
  "Back": "मागे",
  "workspaces": "वर्कस्पेस",
  "Workspaces": "वर्कस्पेस"
};

const teluguDict = {
  "dashboard": "డాష్‌బోర్డ్",
  "Dashboard": "డాష్‌బోర్డ్",
  "goodMorning": "శుభోదయం",
  "Good morning": "శుభోదయం",
  "goodAfternoon": "శుభ మధ్యాహ్నం",
  "Good afternoon": "శుభ మధ్యాహ్నం",
  "goodEvening": "శుభ సాయంత్రం",
  "Good evening": "శుభ సాయంత్రం",
  "heroSubtitle": "AI తో ఆలోచనలను ప్రభావవంతమైన బ్రాండ్‌లుగా మార్చండి.",
  "Turn ideas into impactful brands with AI.": "AI తో ఆలోచనలను ప్రభావవంతమైన బ్రాండ్‌లుగా మార్చండి.",
  "createFaster": "వేగంగా సృష్టించండి",
  "Create Faster": "వేగంగా సృష్టించండి",
  "betterContent": "మంచి కంటెంట్",
  "Better Content": "మంచి కంటెంట్",
  "smarterCampaigns": "స్మార్ట్ ప్రచారాలు",
  "Smarter Campaigns": "స్మార్ట్ ప్రచారాలు",
  "higherRoi": "అధిక ROI",
  "Higher ROI": "అధిక ROI",
  "totalBrands": "మొత్తం బ్రాండ్లు",
  "Total Brands": "మొత్తం బ్రాండ్లు",
  "brandProfilesInAccount": "మీ ఖాతాలో బ్రాండ్ ప్రొఫైల్స్",
  "brand profiles in your account": "మీ ఖాతాలో బ్రాండ్ ప్రొఫైల్స్",
  "totalGeneratedContent": "మొత్తం సృష్టించిన కంటెంట్",
  "Total Generated Content": "మొత్తం సృష్టించిన కంటెంట్",
  "savedInAssetLibraryDb": "యాసెట్ లైబ్రరీ & DB లలో భద్రపరచబడింది (క్యాలెండర్ మినహా)",
  "Saved in Asset Library & DB (excl. calendar)": "యాసెట్ లైబ్రరీ & DB లలో భద్రపరచబడింది (క్యాలెండర్ మినహా)",
  "totalCampaigns": "మొత్తం ప్రచారాలు",
  "Total Campaigns": "మొత్తం ప్రచారాలు",
  "currentlyActive": "ప్రస్తుతం క్రియాశీలంగా ఉంది",
  "currently active": "ప్రస్తుతం క్రియాశీలంగా ఉంది",
  "endToEndPipeline": "ఎండ్-టు-ఎండ్ కంటెంట్ పైప్‌లైన్",
  "END-TO-END CONTENT PIPELINE": "ఎండ్-టు-ఎండ్ కంటెంట్ పైప్‌లైన్",
  "fromStrategyToSuccess": "వ్యూహం నుండి విజయం వైపు →",
  "From Strategy to Success →": "వ్యూహం నుండి విజయం వైపు →",
  "assetLibraryStepTitle": "4. యాసెట్ లైబ్రరీ",
  "4. Asset Library": "4. యాసెట్ లైబ్రరీ",
  "assetLibraryStepSub": "సేవ్ చేసిన మీడియా & వాల్ట్",
  "Saved Media & Vault": "సేవ్ చేసిన మీడియా & వాల్ట్",
  "websiteBuilderStepTitle": "5. వెబ్‌సైట్ బిల్డర్",
  "5. Website Builder": "5. వెబ్‌సైట్ బిల్డర్",
  "websiteBuilderStepSub": "AI పేజీలు & సైట్‌లు",
  "AI Pages & Sites": "AI పేజీలు & సైట్‌లు",
  "currentPlan": "ప్రస్తుత ప్లాన్",
  "CURRENT PLAN": "ప్రస్తుత ప్లాన్",
  "managePlan": "నిర్వహించండి",
  "Manage": "నిర్వహించండి",
  "enterpriseSuite": "ఎంటర్‌ప్రైజ్ సూట్",
  "Enterprise Suite": "ఎంటర్‌ప్రైజ్ సూట్",
  "agencyScale": "ఏజెన్సీ / స్కేల్",
  "Agency / Scale": "ఏజెన్సీ / స్కేల్",
  "proGrowth": "ప్రో / గ్రోత్",
  "Pro / Growth": "ప్రో / గ్రోత్",
  "starterPlan": "స్టార్టర్ ప్లాన్",
  "Starter Plan": "స్టార్టర్ ప్లాన్",
  "brands": "బ్రాండ్ డీఎన్‌ఏ",
  "Brand DNA": "బ్రాండ్ డీఎన్‌ఏ",
  "brandDnaTitle": "బ్రాండ్ ఇంటెలిజెన్స్ & బ్రాండ్ డీఎన్‌ఏ",
  "Brand Intelligence & Brand DNA": "బ్రాండ్ ఇంటెలిజెన్స్ & బ్రాండ్ డీఎన్‌ఏ",
  "seo": "SEO ఇంటెలిజెన్స్",
  "SEO Intelligence": "SEO ఇంటెలిజెన్స్",
  "strategy": "వ్యూహం",
  "Strategy": "వ్యూహం",
  "campaigns": "ప్రచారాలు",
  "Campaigns": "ప్రచారాలు",
  "calendar": "క్యాలెండర్",
  "Calendar": "క్యాలెండర్",
  "studio": "కంటెంట్ స్టూడియో",
  "Content Studio": "కంటెంట్ స్టూడియో",
  "approvals": "ఆమోదాల డెస్క్",
  "Approvals Desk": "ఆమోదాల డెస్క్",
  "creative": "క్రియేటివ్ స్టూడియో",
  "Creative Studio": "క్రియేటివ్ స్టూడియో",
  "assets": "యాసెట్ లైబ్రరీ",
  "Asset Library": "యాసెట్ లైబ్రరీ",
  "websiteBuilder": "AI వెబ్‌సైట్ బిల్డర్",
  "AI Website Builder": "AI వెబ్‌సైట్ బిల్డర్",
  "settings": "సెట్టింగ్‌లు & బిల్లింగ్",
  "Settings & Billing": "సెట్టింగ్‌లు & బిల్లింగ్",
  "back": "వెనుకకు",
  "Back": "వెనుకకు",
  "workspaces": "వర్క్‌స్పేస్‌లు",
  "Workspaces": "వర్క్‌స్పేస్‌లు"
};

// Update Marathi in TRANSLATIONS
for (const key of ["Marathi", "Marathi (मराठी)"]) {
  if (TRANSLATIONS[key]) {
    Object.assign(TRANSLATIONS[key], marathiDict);
  }
}

// Update Telugu in TRANSLATIONS
for (const key of ["Telugu", "Telugu (తెలుగు)"]) {
  if (TRANSLATIONS[key]) {
    Object.assign(TRANSLATIONS[key], teluguDict);
  }
}

// Also check all other languages to strip any cross-script Bengali character (U+0980 to U+09FF) from non-Bengali/Assamese dicts
for (const langKey in TRANSLATIONS) {
  if (!langKey.includes('Bengali') && !langKey.includes('Assamese')) {
    const dict = TRANSLATIONS[langKey];
    for (const k in dict) {
      if (typeof dict[k] === 'string' && /[\u0980-\u09FF]/.test(dict[k])) {
        // If string contains Bengali, replace Bengali characters or fix
        console.log(`Fixing cross-script Bengali character in ${langKey}.${k}: "${dict[k]}"`);
        if (k === 'goodMorning' || k === 'Good morning') {
          dict[k] = langKey.includes('Marathi') ? 'शुभ सकाळ' : (langKey.includes('Hindi') ? 'सुप्रभात' : 'Good morning');
        } else if (k === 'heroSubtitle' || k === 'Turn ideas into impactful brands with AI.') {
          dict[k] = langKey.includes('Marathi') ? 'AI च्या मदतीने कल्पनांना प्रभावशाली ब्रँडमध्ये बदला.' : dict[k].replace(/[\u0980-\u09FF]/g, '');
        } else {
          dict[k] = dict[k].replace(/[\u0980-\u09FF]/g, '').trim();
        }
      }
    }
  }
}

const updatedCode = `/**
 * Centralized Multi-Language Dictionaries for AI ADS™
 * i18next & WorkspaceContext compatible native script translation registry.
 */

export const TRANSLATIONS = ${JSON.stringify(TRANSLATIONS, null, 2)};
`;

fs.writeFileSync(transPath, updatedCode, 'utf8');
console.log('Successfully updated Marathi & Telugu dictionaries and cleaned cross-script characters!');
