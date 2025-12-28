import { en } from './en';
import type { TranslationKeys } from './en';

type Language = 'en';

const translations: Record<Language, TranslationKeys> = {
  en,
};

let currentLanguage: Language = 'en';

export const setLanguage = (lang: Language) => {
  currentLanguage = lang;
};

export const getLanguage = (): Language => {
  return currentLanguage;
};

export const t = (key: string): string => {
  const keys = key.split('.');
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let value: any = translations[currentLanguage];
  
  for (const k of keys) {
    if (value && typeof value === 'object') {
      value = value[k];
    } else {
      return key; // Return key if translation not found
    }
  }
  
  return typeof value === 'string' ? value : key;
};

// React hook for translations
export const useTranslation = () => {
  return {
    t,
    language: currentLanguage,
    setLanguage,
  };
};

export { en };
export type { TranslationKeys };
