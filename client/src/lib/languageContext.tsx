import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

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

// Translation strings
export const translations: Record<Language, Record<string, string>> = {
  en: {
    'header.home': 'Home',
    'header.blog': 'Blog',
    'header.changelog': 'Changelog',
    'header.featured': 'Featured Art',
    'header.staff': 'Staff',
    'header.wishlist': 'Wishlist',
    'header.view_store': 'View Store',
    'header.settings': 'Settings',
    'cart.items': 'items',
    'cart.empty': 'Your cart is empty',
    'common.add_to_cart': 'Add to Cart',
    'common.buy': 'Buy',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
  },
  es: {
    'header.home': 'Inicio',
    'header.blog': 'Blog',
    'header.changelog': 'Registro de cambios',
    'header.featured': 'Arte destacado',
    'header.staff': 'Personal',
    'header.wishlist': 'Lista de deseos',
    'header.view_store': 'Ver tienda',
    'header.settings': 'Configuración',
    'cart.items': 'artículos',
    'cart.empty': 'Tu carrito está vacío',
    'common.add_to_cart': 'Agregar al carrito',
    'common.buy': 'Comprar',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
  },
  fr: {
    'header.home': 'Accueil',
    'header.blog': 'Blog',
    'header.changelog': 'Historique des modifications',
    'header.featured': 'Art en vedette',
    'header.staff': 'Personnel',
    'header.wishlist': 'Liste de souhaits',
    'header.view_store': 'Voir le magasin',
    'header.settings': 'Paramètres',
    'cart.items': 'articles',
    'cart.empty': 'Votre panier est vide',
    'common.add_to_cart': 'Ajouter au panier',
    'common.buy': 'Acheter',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
  },
  de: {
    'header.home': 'Startseite',
    'header.blog': 'Blog',
    'header.changelog': 'Änderungsprotokoll',
    'header.featured': 'Ausgewählte Kunst',
    'header.staff': 'Personal',
    'header.wishlist': 'Wunschliste',
    'header.view_store': 'Shop anzeigen',
    'header.settings': 'Einstellungen',
    'cart.items': 'Artikel',
    'cart.empty': 'Ihr Warenkorb ist leer',
    'common.add_to_cart': 'In den Warenkorb',
    'common.buy': 'Kaufen',
    'common.save': 'Speichern',
    'common.cancel': 'Abbrechen',
  },
  ja: {
    'header.home': 'ホーム',
    'header.blog': 'ブログ',
    'header.changelog': '変更履歴',
    'header.featured': 'おすすめアート',
    'header.staff': 'スタッフ',
    'header.wishlist': 'ウィッシュリスト',
    'header.view_store': 'ストアを表示',
    'header.settings': '設定',
    'cart.items': 'アイテム',
    'cart.empty': 'カートは空です',
    'common.add_to_cart': 'カートに追加',
    'common.buy': '購入',
    'common.save': '保存',
    'common.cancel': 'キャンセル',
  },
  zh: {
    'header.home': '首页',
    'header.blog': '博客',
    'header.changelog': '更新日志',
    'header.featured': '精选艺术',
    'header.staff': '员工',
    'header.wishlist': '愿望清单',
    'header.view_store': '查看商店',
    'header.settings': '设置',
    'cart.items': '商品',
    'cart.empty': '购物车为空',
    'common.add_to_cart': '添加到购物车',
    'common.buy': '购买',
    'common.save': '保存',
    'common.cancel': '取消',
  },
  pl: {
    'header.home': 'Strona główna',
    'header.blog': 'Blog',
    'header.changelog': 'Dziennik zmian',
    'header.featured': 'Polecana sztuka',
    'header.staff': 'Personel',
    'header.wishlist': 'Lista życzeń',
    'header.view_store': 'Wyświetl sklep',
    'header.settings': 'Ustawienia',
    'cart.items': 'przedmiotów',
    'cart.empty': 'Twój koszyk jest pusty',
    'common.add_to_cart': 'Dodaj do koszyka',
    'common.buy': 'Kup',
    'common.save': 'Zapisz',
    'common.cancel': 'Anuluj',
  },
  ro: {
    'header.home': 'Acasă',
    'header.blog': 'Blog',
    'header.changelog': 'Jurnal de modificări',
    'header.featured': 'Artă în evidență',
    'header.staff': 'Personal',
    'header.wishlist': 'Lista de dorințe',
    'header.view_store': 'Vizualizați magazinul',
    'header.settings': 'Setări',
    'cart.items': 'articole',
    'cart.empty': 'Coșul dvs. este gol',
    'common.add_to_cart': 'Adăugați în coș',
    'common.buy': 'Cumpărați',
    'common.save': 'Salvați',
    'common.cancel': 'Anulare',
  },
};

// Helper function to translate
export function t(key: string, lang: Language): string {
  return translations[lang]?.[key] || translations['en']?.[key] || key;
}
