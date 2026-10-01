const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../features/brandDna/BrandDnaModule.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const replacements = [
  ['title="Edit Headquarters"', 'title={t("Edit Headquarters", "Edit Headquarters")}'],
  ['title="Edit Tagline"', 'title={t("Edit Tagline", "Edit Tagline")}'],
  ['title="Edit Contact Info"', 'title={t("Edit Contact Info", "Edit Contact Info")}'],
  ['title="Edit Mission Statement"', 'title={t("Edit Mission Statement", "Edit Mission Statement")}'],
  ['title="Edit Target Audience"', 'title={t("Edit Target Audience", "Edit Target Audience")}'],
  ['title="Edit Vision Statement"', 'title={t("Edit Vision Statement", "Edit Vision Statement")}'],
  ['title="Edit Products & Services"', 'title={t("Edit Products & Services", "Edit Products & Services")}'],
  ['title="Continue to SEO Intelligence"', 'title={t("Continue to SEO Intelligence", "Continue to SEO Intelligence")}'],
  ['<span>Continue to SEO</span>', '<span>{t("Continue to SEO", "Continue to SEO")}</span>'],
  ['<span className="text-slate-400 font-normal italic">Address not found</span>', '<span className="text-slate-400 font-normal italic">{t("Address not found", "Address not found")}</span>'],
  ['<span className="text-slate-400 font-normal italic">Not Specified</span>', '<span className="text-slate-400 font-normal italic">{t("Not Specified", "Not Specified")}</span>'],
  ['<span className="text-slate-400 font-normal not-italic">Mission statement not available</span>', '<span className="text-slate-400 font-normal not-italic">{t("Mission statement not available", "Mission statement not available")}</span>'],
  ['Target audience not specified. Click edit icon to add.', '{t("Target audience not specified. Click edit icon to add.", "Target audience not specified. Click edit icon to add.")}'],
  ['<span className="text-slate-400 font-normal not-italic">Vision statement not available</span>', '<span className="text-slate-400 font-normal not-italic">{t("Vision statement not available", "Vision statement not available")}</span>'],
  ['No core products specified. Click edit icon to add.', '{t("No core products specified. Click edit icon to add.", "No core products specified. Click edit icon to add.")}'],
  ['Extracted Marketing Claims (Unverified)', '{t("Extracted Marketing Claims (Unverified)", "Extracted Marketing Claims (Unverified)")}'],
  ['Initialize Brand AI Analysis', '{t("Initialize Brand AI Analysis", "Initialize Brand AI Analysis")}'],
  ['<label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Website URL</label>', '<label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t("Website URL", "Website URL")}</label>'],
  ['<label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">Brand Overview / Description (optional)</label>', '<label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1.5">{t("Brand Overview / Description (optional)", "Brand Overview / Description (optional)")}</label>'],
  ['placeholder="Describe what your brand does, key products, target audience..."', 'placeholder={t("Describe what your brand does, key products, target audience...", "Describe what your brand does, key products, target audience...")}']
];

for (const [target, replacement] of replacements) {
  content = content.replaceAll(target, replacement);
}

// Wrap card title texts directly where they occur
content = content.replace(
  /<Compass className="w-3\.5 h-3\.5 text-amber-500" \/>\s*Headquarters \/ Address/g,
  '<Compass className="w-3.5 h-3.5 text-amber-500" /> {t("Headquarters / Address", "Headquarters / Address")}'
);

content = content.replace(
  /<MessageSquare className="w-3\.5 h-3\.5 text-emerald-500" \/>\s*Tagline \/ Slogan/g,
  '<MessageSquare className="w-3.5 h-3.5 text-emerald-500" /> {t("Tagline / Slogan", "Tagline / Slogan")}'
);

content = content.replace(
  /<Globe className="w-3\.5 h-3\.5 text-cyan-500" \/>\s*Contact Info/g,
  '<Globe className="w-3.5 h-3.5 text-cyan-500" /> {t("Contact Info", "Contact Info")}'
);

content = content.replace(
  /<Compass className="w-4 h-4" \/>\s*<\/div>\s*Mission Statement/g,
  '<Compass className="w-4 h-4" /></div> {t("Mission Statement", "Mission Statement")}'
);

content = content.replace(
  /<Target className="w-4 h-4" \/>\s*<\/div>\s*Target Audience/g,
  '<Target className="w-4 h-4" /></div> {t("Target Audience", "Target Audience")}'
);

content = content.replace(
  /<Sparkles className="w-4 h-4" \/>\s*<\/div>\s*Company Vision/g,
  '<Sparkles className="w-4 h-4" /></div> {t("Company Vision", "Company Vision")}'
);

content = content.replace(
  /<Zap className="w-4 h-4" \/>\s*<\/div>\s*Core Products & Services/g,
  '<Zap className="w-4 h-4" /></div> {t("Core Products & Services", "Core Products & Services")}'
);

fs.writeFileSync(filePath, content, 'utf8');
console.log('BrandDnaModule.jsx updated with all t(...) wrappers!');
