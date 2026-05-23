import i18n from 'i18next';
import { initReactI18next } from 'react-i18next';

import zhTW from './locales/zh-TW.json';
import en from './locales/en.json';

export const defaultNS = 'common';

export const resources = {
  'zh-TW': { common: zhTW.common, chordPro: zhTW.chordPro },
  en: { common: en.common, chordPro: en.chordPro },
} as const;

i18n.use(initReactI18next).init({
  lng: 'zh-TW',
  fallbackLng: 'en',
  defaultNS,
  resources,
  interpolation: {
    escapeValue: false, // React 已內建 XSS 防護
  },
});

export default i18n;
