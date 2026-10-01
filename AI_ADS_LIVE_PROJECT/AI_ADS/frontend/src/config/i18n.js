import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import { TRANSLATIONS } from './translations';

const resources = {};
Object.keys(TRANSLATIONS).forEach(lang => {
  resources[lang] = {
    translation: TRANSLATIONS[lang]
  };
});

const initialLang = localStorage.getItem('aisa_language') || 'English';

i18n
  .use(initReactI18next)
  .init({
    resources,
    lng: initialLang,
    fallbackLng: 'English',
    interpolation: {
      escapeValue: false // React already escapes values
    },
    react: {
      useSuspense: false
    }
  });

export default i18n;
