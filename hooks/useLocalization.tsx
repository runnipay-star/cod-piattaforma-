
import React, { createContext, useState, useContext, ReactNode, useCallback } from 'react';
import { translations, Language, TranslationKey } from '../utils/translations';

interface LocalizationContextType {
  language: Language;
  setLanguage: (language: Language) => void;
  t: (key: TranslationKey) => string;
}

const LocalizationContext = createContext<LocalizationContextType | undefined>(undefined);

export const LocalizationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [language, setLanguage] = useState<Language>('it');

  const t = useCallback((key: TranslationKey): string => {
    return translations[language][key] || translations['en'][key] || key;
  }, [language]);

  return (
    <LocalizationContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LocalizationContext.Provider>
  );
};

export const useLocalization = (): LocalizationContextType => {
  const context = useContext(LocalizationContext);
  if (!context) {
    throw new Error('useLocalization must be used within a LocalizationProvider');
  }
  return context;
};
