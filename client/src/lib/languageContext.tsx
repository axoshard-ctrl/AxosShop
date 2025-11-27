import { createContext, useContext, useState, ReactNode } from 'react';

export type Language = 'en' | 'es' | 'fr' | 'de' | 'ja' | 'zh' | 'pl' | 'ro';

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguageState] = useState<Language>(() => {
    // Try to get from localStorage
    const stored = localStorage.getItem('axosshop_language');
    if (stored && isValidLanguage(stored)) {
      return stored as Language;
    }
    return 'en'; // Default to English
  });

  // Save to localStorage when language changes
  const setLanguage = (lang: Language) => {
    console.log('setLanguage called with:', lang);
    setLanguageState(lang);
    localStorage.setItem('axosshop_language', lang);
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

function isValidLanguage(lang: string): lang is Language {
  return ['en', 'es', 'fr', 'de', 'ja', 'zh', 'pl', 'ro'].includes(lang);
}

// Re-export t function from translations module to avoid Fast Refresh issues
export { t } from './translations';
