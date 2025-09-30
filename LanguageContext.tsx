import React, { createContext, useState, useContext, useMemo, useEffect } from 'react';
import { type Locale } from './types';
import { translations } from './translations';

interface LanguageContextType {
  locale: Locale;
  setLocale: (locale: Locale) => void;
  t: (key: string, replacements?: Record<string, string>) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [locale, setLocaleState] = useState<Locale>(() => {
    const savedLocale = localStorage.getItem('mws-locale');
    return (savedLocale as Locale) || 'it';
  });

  const setLocale = (newLocale: Locale) => {
    localStorage.setItem('mws-locale', newLocale);
    setLocaleState(newLocale);
  };
  
  const t = useMemo(() => (key: string, replacements?: Record<string, string>) => {
    let translation = translations[locale]?.[key] || translations['en']?.[key] || key;
    if (replacements) {
        Object.entries(replacements).forEach(([placeholder, value]) => {
            translation = translation.replace(`{${placeholder}}`, value);
        });
    }
    return translation;
  }, [locale]);

  const value = useMemo(() => ({ locale, setLocale, t }), [locale]);

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const useTranslation = () => {
  const { t } = useLanguage();
  return { t };
};
