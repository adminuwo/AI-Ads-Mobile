const fs = require('fs');
const path = require('path');

const translationsPath = path.join(__dirname, '../src/config/translations.js');
let content = fs.readFileSync(translationsPath, 'utf8');

const englishFixes = {
  "AI Ads Preferences": "AI Ads Preferences",
  "Platform Settings": "Platform Settings",
  "PLATFORM SETTINGS": "PLATFORM SETTINGS",
  "Search settings...": "Search settings...",
  "FULL NAME": "FULL NAME",
  "Full Name": "Full Name",
  "Enter full display name": "Enter full display name",
  "Saved!": "Saved!",
  "Save": "Save",
  "ACTIVE LOGIN SESSIONS": "ACTIVE LOGIN SESSIONS",
  "Active Login Sessions": "Active Login Sessions",
  "Active Now": "Active Now",
  "Current Device": "Current Device",
  "Account Password": "Account Password",
  "Update your login security credentials.": "Update your login security credentials.",
  "Change Password": "Change Password",
  "Danger Zone": "Danger Zone",
  "Permanently delete your account and brand data.": "Permanently delete your account and brand data.",
  "Delete Account": "Delete Account",
  "Active Workspace:": "Active Workspace:",
  "saveAndDone": "Save & Complete",
  "Save & Done": "Save & Complete",
  "appearanceStyle": "Appearance & Style",
  "Appearance & Style": "Appearance & Style",
  "alertsDigest": "Alerts & Digest",
  "Alerts & Digest": "Alerts & Digest",
  "dataControlsBackup": "Data Controls & Backup",
  "Data Controls & Backup": "Data Controls & Backup",
  "profileSessions": "Profile & Sessions",
  "Profile & Sessions": "Profile & Sessions",
  "billingVisualCredits": "Billing & Visual Credits",
  "Billing & Visual Credits": "Billing & Visual Credits",
  "helpCenterFaq": "Help Center & FAQ",
  "Help Center & FAQ": "Help Center & FAQ",
  "sendProductFeedback": "Send Product Feedback",
  "Send Product Feedback": "Send Product Feedback",
  "termsOfService": "Terms of Service",
  "Terms of Service": "Terms of Service",
  "privacyPolicy": "Privacy Policy",
  "Privacy Policy": "Privacy Policy",
  "themeMode": "Theme Mode",
  "Theme Mode": "Theme Mode",
  "darkMode": "Dark Mode",
  "Dark Mode": "Dark Mode",
  "lightMode": "Light Mode",
  "Light Mode": "Light Mode",
  "systemMode": "System",
  "System": "System",
  "accentColorTheme": "Accent Color Theme",
  "Accent Color Theme": "Accent Color Theme",
  "targetRegion": "Target Region",
  "Target Region": "Target Region",
  "dashboardLanguage": "Dashboard Language",
  "Dashboard Language": "Dashboard Language",
  "multiScheduleReminder": "Multi Schedule Reminder",
  "Multi Schedule Reminder": "Multi Schedule Reminder",
  "platformPreferences": "PLATFORM PREFERENCES",
  "PLATFORM PREFERENCES": "PLATFORM PREFERENCES",
  "accountSecurity": "ACCOUNT & SECURITY",
  "ACCOUNT & SECURITY": "ACCOUNT & SECURITY",
  "monetizationApi": "MONETIZATION & API",
  "MONETIZATION & API": "MONETIZATION & API",
  "helpResources": "HELP & RESOURCES",
  "HELP & RESOURCES": "HELP & RESOURCES",
  "logOut": "Log Out",
  "LOG OUT": "LOG OUT"
};

// Also verify Malayalam dictionary has these Malayalam values
const malayalamValues = {
  "AI Ads Preferences": "AI പരസ്യ മുൻഗണനകൾ",
  "Platform Settings": "പ്ലാറ്റ്‌ഫോം ക്രമീകരണങ്ങൾ",
  "PLATFORM SETTINGS": "പ്ലാറ്റ്‌ഫോം ക്രമീകരണങ്ങൾ",
  "Search settings...": "ക്രമീകരണങ്ങൾ തിരയുക...",
  "FULL NAME": "പൂർണ്ണമായ പേര്",
  "Full Name": "പൂർണ്ണമായ പേര്",
  "Enter full display name": "പൂർണ്ണമായ പേര് നൽകുക",
  "Saved!": "സേവ് ചെയ്തു!",
  "Save": "സേവ് ചെയ്യുക",
  "ACTIVE LOGIN SESSIONS": "സജീവ ലോഗിൻ സെഷനുകൾ",
  "Active Login Sessions": "സജീവ ലോഗിൻ സെഷനുകൾ",
  "Active Now": "ഇപ്പോൾ സജീവം",
  "Current Device": "നിലവിലെ ഉപകരണം",
  "Account Password": "അക്കൗണ്ട് പാസ്‌വേഡ്",
  "Update your login security credentials.": "നിങ്ങളുടെ ലോഗിൻ സുരക്ഷാ വിവരങ്ങൾ പുതുക്കുക.",
  "Change Password": "പാസ്‌വേഡ് മാറ്റുക",
  "Danger Zone": "അപകട മേഖല",
  "Permanently delete your account and brand data.": "നിങ്ങളുടെ അക്കൗണ്ടും ബ്രാൻഡ് ഡാറ്റയും സ്ഥിരമായി ഇല്ലാതാക്കുക.",
  "Delete Account": "അക്കൗണ്ട് ഇല്ലാതാക്കുക",
  "Active Workspace:": "സജീവ വർക്ക്സ്പേസ്:",
  "saveAndDone": "സേവ് ചെയ്ത് പൂർത്തിയാക്കുക",
  "Save & Done": "സേവ് ചെയ്ത് പൂർത്തിയാക്കുക",
  "appearanceStyle": "രൂപവും ശൈലിയും",
  "Appearance & Style": "രൂപവും ശൈലിയും",
  "alertsDigest": "അലേർട്ടുകളും സംഗ്രഹവും",
  "Alerts & Digest": "അലേർട്ടുകളും സംഗ്രഹവും",
  "dataControlsBackup": "ഡാറ്റ നിയന്ത്രണങ്ങളും ബാക്കപ്പും",
  "Data Controls & Backup": "ഡാറ്റ നിയന്ത്രണങ്ങളും ബാക്കപ്പും",
  "profileSessions": "പ്രൊഫൈലും സെഷനുകളും",
  "Profile & Sessions": "പ്രൊഫൈലും സെഷനുകളും",
  "billingVisualCredits": "ബില്ലിംഗും വിഷ്വൽ ക്രെഡിറ്റുകളും",
  "Billing & Visual Credits": "ബില്ലിംഗും വിഷ്വൽ ക്രെഡിറ്റുകളും",
  "helpCenterFaq": "സഹായ കേന്ദ്രവും ചോദ്യോത്തരങ്ങളും",
  "Help Center & FAQ": "സഹായ കേന്ദ്രവും ചോദ്യോത്തരങ്ങളും",
  "sendProductFeedback": "ഉൽപ്പന്ന പ്രതികരണം അയക്കുക",
  "Send Product Feedback": "ഉൽപ്പന്ന പ്രതികരണം അയക്കുക",
  "termsOfService": "സേവന വ്യവസ്ഥകൾ",
  "Terms of Service": "സേവന വ്യവസ്ഥകൾ",
  "privacyPolicy": "സ്വകാര്യതാ നയം",
  "Privacy Policy": "സ്വകാര്യതാ നയം",
  "themeMode": "തീം മോഡ്",
  "Theme Mode": "തീം മോഡ്",
  "darkMode": "ഡാർക്ക് മോഡ്",
  "Dark Mode": "ഡാർക്ക് മോഡ്",
  "lightMode": "ലൈറ്റ് മോഡ്",
  "Light Mode": "ലൈറ്റ് മോഡ്",
  "systemMode": "സിസ്റ്റം",
  "System": "സിസ്റ്റം",
  "accentColorTheme": "ആക്സന്റ് കളർ തീം",
  "Accent Color Theme": "ആക്സന്റ് കളർ തീം",
  "targetRegion": "ലക്ഷ്യ മേഖല",
  "Target Region": "ലക്ഷ്യ മേഖല",
  "dashboardLanguage": "ഡാഷ്‌ബോർഡ് ഭാഷ",
  "Dashboard Language": "ഡാഷ്‌ബോർഡ് ഭാഷ",
  "multiScheduleReminder": "മൾട്ടി ഷെഡ്യൂൾ റിമൈൻഡർ",
  "Multi Schedule Reminder": "മൾട്ടി ഷെഡ്യൂൾ റിമൈൻഡർ",
  "platformPreferences": "പ്ലാറ്റ്‌ഫോം മുൻഗണനകൾ",
  "PLATFORM PREFERENCES": "പ്ലാറ്റ്‌ഫോം മുൻഗണനകൾ",
  "accountSecurity": "അക്കൗണ്ടും സുരക്ഷയും",
  "ACCOUNT & SECURITY": "അക്കൗണ്ടും സുരക്ഷയും",
  "monetizationApi": "മോണിറ്റൈസേഷനും APIയും",
  "MONETIZATION & API": "മോണിറ്റൈസേഷനും APIയും",
  "helpResources": "സഹായവും വിഭവങ്ങളും",
  "HELP & RESOURCES": "സഹായവും വിഭവങ്ങളും",
  "logOut": "ലോഗ് ഔട്ട്",
  "LOG OUT": "ലോഗ് ഔട്ട്"
};

// Replace in English and English (IN) blocks
['English', 'English (IN)'].forEach(targetLang => {
  const langRegex = new RegExp(`("${targetLang.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}":\\s*\\{)`, 'g');
  let injectedFixes = '';
  Object.keys(englishFixes).forEach(k => {
    injectedFixes += `\n    ${JSON.stringify(k)}: ${JSON.stringify(englishFixes[k])},`;
  });
  content = content.replace(langRegex, `$1${injectedFixes}`);
});

// Also inject into Malayalam and Malayalam (മലയാളം) blocks
['Malayalam', 'Malayalam (മലയാളം)'].forEach(targetLang => {
  const langRegex = new RegExp(`("${targetLang.replace(/[-\/\\^$*+?.()|[\]{}]/g, '\\$&')}":\\s*\\{)`, 'g');
  let injectedFixes = '';
  Object.keys(malayalamValues).forEach(k => {
    injectedFixes += `\n    ${JSON.stringify(k)}: ${JSON.stringify(malayalamValues[k])},`;
  });
  content = content.replace(langRegex, `$1${injectedFixes}`);
});

fs.writeFileSync(translationsPath, content, 'utf8');
console.log('Successfully cleaned English dictionaries and updated Malayalam dictionary!');
