/**
 * i18n Initialization
 *
 * This file initializes react-i18next with the configured languages.
 * Import this file once at the app entry point (main.tsx) before rendering.
 *
 * AGENT: Add translation imports and resources for each language below.
 */

import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import { defaultLanguage, languageCodes } from './config.js';

import en from '../../locales/en.json';

const resources = {
  en: { translation: en },
};

// LanguageDetector uses browser-only APIs (localStorage, navigator, document)
// and must not be loaded in the SSR bundle. We detect the environment at
// runtime so the same file works in both client and server contexts.
const isBrowser = typeof window !== 'undefined';

const builder = i18n.use(initReactI18next);

if (isBrowser) {
  // Dynamic import keeps the browser-only module out of the SSR evaluation path.
  import('i18next-browser-languagedetector').then(({ default: LanguageDetector }) => {
    builder.use(LanguageDetector);
  });
}

builder.init({
    resources,
    fallbackLng: defaultLanguage,
    supportedLngs: languageCodes,

    // Default namespace (single file per language)
    defaultNS: 'translation',
    ns: ['translation'],

    // Language detection options — only meaningful in the browser
    detection: isBrowser
      ? {
          order: ['localStorage', 'navigator', 'htmlTag'],
          caches: ['localStorage'],
          lookupLocalStorage: 'i18nextLng',
        }
      : undefined,

    interpolation: {
      // React already escapes values
      escapeValue: false,
    },

    // Don't load missing translations from backend
    saveMissing: false,

    // Development: warn about missing keys
    debug: typeof import.meta !== 'undefined' && (import.meta as { env?: { DEV?: boolean } }).env?.DEV === true,
  });

export default i18n;
