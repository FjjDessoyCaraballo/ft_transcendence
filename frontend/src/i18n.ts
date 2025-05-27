import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';
import LanguageDetector from 'i18next-browser-languagedetector';

import en from './locales/en/translation.json';
import fi from './locales/fi/translation.json';
import pt from './locales/pt/translation.json';

const savedLanguage = localStorage.getItem('preferredLanguage') || 'en';

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    lng: savedLanguage,
    fallbackLng: 'en',
    debug: false,
    resources: {
      en: { translation: en },
      fi: { translation: fi },
      pt: { translation: pt },
    },
    interpolation: {
      escapeValue: false, // React handles XSS
    },
  });

export default i18n;
