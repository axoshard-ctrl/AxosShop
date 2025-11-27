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

// Translation strings
export const translations: Record<Language, Record<string, string>> = {
  en: {
    // Header
    'header.home': 'Home',
    'header.blog': 'Blog',
    'header.changelog': 'Changelog',
    'header.featured': 'Featured Art',
    'header.staff': 'Staff',
    'header.wishlist': 'Wishlist',
    'header.view_store': 'View Store',
    'header.settings': 'Settings',
    'header.profile': 'My Profile',
    'header.orders': 'Order History',
    'header.logout': 'Logout',
    'header.login': 'Login',
    'header.signup': 'Sign Up',
    // Cart
    'cart.items': 'items',
    'cart.empty': 'Your cart is empty',
    'cart.title': 'Shopping Cart',
    'cart.subtotal': 'Subtotal',
    'cart.tax': 'Tax',
    'cart.shipping': 'Shipping',
    'cart.total': 'Total',
    'cart.checkout': 'Proceed to Checkout',
    // Products
    'product.price': 'Price',
    'product.in_stock': 'In Stock',
    'product.out_of_stock': 'Out of Stock',
    'product.rating': 'Rating',
    'product.reviews': 'Reviews',
    'product.description': 'Description',
    'product.quantity': 'Quantity',
    // Common
    'common.add_to_cart': 'Add to Cart',
    'common.buy': 'Buy',
    'common.save': 'Save',
    'common.cancel': 'Cancel',
    'common.search': 'Search',
    'common.filter': 'Filter',
    'common.sort': 'Sort',
    'common.loading': 'Loading...',
    'common.error': 'Error',
    'common.success': 'Success',
    // Checkout
    'checkout.title': 'Checkout',
    'checkout.shipping': 'Shipping Address',
    'checkout.billing': 'Billing Address',
    'checkout.payment': 'Payment Method',
    'checkout.review': 'Review Order',
    'checkout.place_order': 'Place Order',
    'checkout.promo_code': 'Promo Code',
    'checkout.apply': 'Apply',
    // Auth
    'auth.email': 'Email',
    'auth.password': 'Password',
    'auth.confirm_password': 'Confirm Password',
    'auth.remember': 'Remember me',
    'auth.forgot_password': 'Forgot Password?',
    'auth.no_account': "Don't have an account?",
    'auth.have_account': 'Already have an account?',
    // Footer
    'footer.about': 'About Us',
    'footer.contact': 'Contact',
    'footer.privacy': 'Privacy Policy',
    'footer.terms': 'Terms & Conditions',
    'footer.follow': 'Follow Us',
  },
  es: {
    // Header
    'header.home': 'Inicio',
    'header.blog': 'Blog',
    'header.changelog': 'Registro de cambios',
    'header.featured': 'Arte destacado',
    'header.staff': 'Personal',
    'header.wishlist': 'Lista de deseos',
    'header.view_store': 'Ver tienda',
    'header.settings': 'Configuración',
    'header.profile': 'Mi Perfil',
    'header.orders': 'Historial de Pedidos',
    'header.logout': 'Cerrar Sesión',
    'header.login': 'Iniciar Sesión',
    'header.signup': 'Registrarse',
    // Cart
    'cart.items': 'artículos',
    'cart.empty': 'Tu carrito está vacío',
    'cart.title': 'Carrito de Compras',
    'cart.subtotal': 'Subtotal',
    'cart.tax': 'Impuesto',
    'cart.shipping': 'Envío',
    'cart.total': 'Total',
    'cart.checkout': 'Ir a Pagar',
    // Products
    'product.price': 'Precio',
    'product.in_stock': 'En Stock',
    'product.out_of_stock': 'Agotado',
    'product.rating': 'Calificación',
    'product.reviews': 'Reseñas',
    'product.description': 'Descripción',
    'product.quantity': 'Cantidad',
    // Common
    'common.add_to_cart': 'Agregar al carrito',
    'common.buy': 'Comprar',
    'common.save': 'Guardar',
    'common.cancel': 'Cancelar',
    'common.search': 'Buscar',
    'common.filter': 'Filtrar',
    'common.sort': 'Ordenar',
    'common.loading': 'Cargando...',
    'common.error': 'Error',
    'common.success': 'Éxito',
    // Checkout
    'checkout.title': 'Pago',
    'checkout.shipping': 'Dirección de Envío',
    'checkout.billing': 'Dirección de Facturación',
    'checkout.payment': 'Método de Pago',
    'checkout.review': 'Revisar Pedido',
    'checkout.place_order': 'Realizar Pedido',
    'checkout.promo_code': 'Código Promocional',
    'checkout.apply': 'Aplicar',
    // Auth
    'auth.email': 'Correo Electrónico',
    'auth.password': 'Contraseña',
    'auth.confirm_password': 'Confirmar Contraseña',
    'auth.remember': 'Recuérdame',
    'auth.forgot_password': '¿Olvidaste tu contraseña?',
    'auth.no_account': '¿No tienes cuenta?',
    'auth.have_account': '¿Ya tienes cuenta?',
    // Footer
    'footer.about': 'Acerca de Nosotros',
    'footer.contact': 'Contacto',
    'footer.privacy': 'Política de Privacidad',
    'footer.terms': 'Términos y Condiciones',
    'footer.follow': 'Síguenos',
  },
  fr: {
    // Header
    'header.home': 'Accueil',
    'header.blog': 'Blog',
    'header.changelog': 'Historique des modifications',
    'header.featured': 'Art en vedette',
    'header.staff': 'Personnel',
    'header.wishlist': 'Liste de souhaits',
    'header.view_store': 'Voir le magasin',
    'header.settings': 'Paramètres',
    'header.profile': 'Mon Profil',
    'header.orders': 'Historique des commandes',
    'header.logout': 'Déconnexion',
    'header.login': 'Connexion',
    'header.signup': 'S\'inscrire',
    // Cart
    'cart.items': 'articles',
    'cart.empty': 'Votre panier est vide',
    'cart.title': 'Panier d\'achat',
    'cart.subtotal': 'Sous-total',
    'cart.tax': 'Taxe',
    'cart.shipping': 'Expédition',
    'cart.total': 'Total',
    'cart.checkout': 'Procéder au paiement',
    // Products
    'product.price': 'Prix',
    'product.in_stock': 'En Stock',
    'product.out_of_stock': 'Rupture de Stock',
    'product.rating': 'Évaluation',
    'product.reviews': 'Avis',
    'product.description': 'Description',
    'product.quantity': 'Quantité',
    // Common
    'common.add_to_cart': 'Ajouter au panier',
    'common.buy': 'Acheter',
    'common.save': 'Enregistrer',
    'common.cancel': 'Annuler',
    'common.search': 'Rechercher',
    'common.filter': 'Filtrer',
    'common.sort': 'Trier',
    'common.loading': 'Chargement...',
    'common.error': 'Erreur',
    'common.success': 'Succès',
    // Checkout
    'checkout.title': 'Paiement',
    'checkout.shipping': 'Adresse de Livraison',
    'checkout.billing': 'Adresse de Facturation',
    'checkout.payment': 'Mode de Paiement',
    'checkout.review': 'Vérifier la Commande',
    'checkout.place_order': 'Passer la Commande',
    'checkout.promo_code': 'Code Promo',
    'checkout.apply': 'Appliquer',
    // Auth
    'auth.email': 'Email',
    'auth.password': 'Mot de Passe',
    'auth.confirm_password': 'Confirmer le Mot de Passe',
    'auth.remember': 'Se Souvenir de Moi',
    'auth.forgot_password': 'Mot de Passe Oublié?',
    'auth.no_account': 'Pas encore de compte?',
    'auth.have_account': 'Déjà un compte?',
    // Footer
    'footer.about': 'À Propos',
    'footer.contact': 'Contact',
    'footer.privacy': 'Politique de Confidentialité',
    'footer.terms': 'Conditions Générales',
    'footer.follow': 'Nous Suivre',
  },
  de: {
    // Header
    'header.home': 'Startseite',
    'header.blog': 'Blog',
    'header.changelog': 'Änderungsprotokoll',
    'header.featured': 'Ausgewählte Kunst',
    'header.staff': 'Personal',
    'header.wishlist': 'Wunschliste',
    'header.view_store': 'Shop anzeigen',
    'header.settings': 'Einstellungen',
    'header.profile': 'Mein Profil',
    'header.orders': 'Bestellhistorie',
    'header.logout': 'Abmelden',
    'header.login': 'Anmelden',
    'header.signup': 'Registrieren',
    // Cart
    'cart.items': 'Artikel',
    'cart.empty': 'Ihr Warenkorb ist leer',
    'cart.title': 'Einkaufswagen',
    'cart.subtotal': 'Summe',
    'cart.tax': 'Steuern',
    'cart.shipping': 'Versand',
    'cart.total': 'Gesamt',
    'cart.checkout': 'Zur Kasse',
    // Products
    'product.price': 'Preis',
    'product.in_stock': 'Auf Lager',
    'product.out_of_stock': 'Ausverkauft',
    'product.rating': 'Bewertung',
    'product.reviews': 'Bewertungen',
    'product.description': 'Beschreibung',
    'product.quantity': 'Menge',
    // Common
    'common.add_to_cart': 'In den Warenkorb',
    'common.buy': 'Kaufen',
    'common.save': 'Speichern',
    'common.cancel': 'Abbrechen',
    'common.search': 'Suchen',
    'common.filter': 'Filtern',
    'common.sort': 'Sortieren',
    'common.loading': 'Wird geladen...',
    'common.error': 'Fehler',
    'common.success': 'Erfolg',
    // Checkout
    'checkout.title': 'Kasse',
    'checkout.shipping': 'Lieferadresse',
    'checkout.billing': 'Rechnungsadresse',
    'checkout.payment': 'Zahlungsart',
    'checkout.review': 'Bestellung Überprüfen',
    'checkout.place_order': 'Bestellung Aufgeben',
    'checkout.promo_code': 'Aktionscode',
    'checkout.apply': 'Anwenden',
    // Auth
    'auth.email': 'Email',
    'auth.password': 'Passwort',
    'auth.confirm_password': 'Passwort Bestätigen',
    'auth.remember': 'Angemeldet bleiben',
    'auth.forgot_password': 'Passwort Vergessen?',
    'auth.no_account': 'Kein Konto?',
    'auth.have_account': 'Bereits ein Konto?',
    // Footer
    'footer.about': 'Über Uns',
    'footer.contact': 'Kontakt',
    'footer.privacy': 'Datenschutzrichtlinie',
    'footer.terms': 'Geschäftsbedingungen',
    'footer.follow': 'Folgen Sie Uns',
  },
  ja: {
    // Header
    'header.home': 'ホーム',
    'header.blog': 'ブログ',
    'header.changelog': '変更履歴',
    'header.featured': 'おすすめアート',
    'header.staff': 'スタッフ',
    'header.wishlist': 'ウィッシュリスト',
    'header.view_store': 'ストアを表示',
    'header.settings': '設定',
    'header.profile': 'マイプロフィール',
    'header.orders': '注文履歴',
    'header.logout': 'ログアウト',
    'header.login': 'ログイン',
    'header.signup': 'サインアップ',
    // Cart
    'cart.items': 'アイテム',
    'cart.empty': 'カートは空です',
    'cart.title': 'ショッピングカート',
    'cart.subtotal': '小計',
    'cart.tax': '税金',
    'cart.shipping': '送料',
    'cart.total': '合計',
    'cart.checkout': 'チェックアウト',
    // Products
    'product.price': '価格',
    'product.in_stock': '在庫あり',
    'product.out_of_stock': '在庫なし',
    'product.rating': '評価',
    'product.reviews': 'レビュー',
    'product.description': '説明',
    'product.quantity': '数量',
    // Common
    'common.add_to_cart': 'カートに追加',
    'common.buy': '購入',
    'common.save': '保存',
    'common.cancel': 'キャンセル',
    'common.search': '検索',
    'common.filter': 'フィルター',
    'common.sort': '並べ替え',
    'common.loading': '読み込み中...',
    'common.error': 'エラー',
    'common.success': '成功',
    // Checkout
    'checkout.title': 'チェックアウト',
    'checkout.shipping': '配送先住所',
    'checkout.billing': '請求先住所',
    'checkout.payment': '支払い方法',
    'checkout.review': '注文確認',
    'checkout.place_order': '注文を確定',
    'checkout.promo_code': 'プロモコード',
    'checkout.apply': '適用',
    // Auth
    'auth.email': 'メール',
    'auth.password': 'パスワード',
    'auth.confirm_password': 'パスワード確認',
    'auth.remember': 'ログイン状態を保持',
    'auth.forgot_password': 'パスワードをお忘れですか?',
    'auth.no_account': 'アカウントがありません',
    'auth.have_account': 'すでにアカウントをお持ちですか?',
    // Footer
    'footer.about': 'について',
    'footer.contact': 'お問い合わせ',
    'footer.privacy': 'プライバシーポリシー',
    'footer.terms': '利用規約',
    'footer.follow': 'フォロー',
  },
  zh: {
    // Header
    'header.home': '首页',
    'header.blog': '博客',
    'header.changelog': '更新日志',
    'header.featured': '精选艺术',
    'header.staff': '员工',
    'header.wishlist': '愿望清单',
    'header.view_store': '查看商店',
    'header.settings': '设置',
    'header.profile': '我的资料',
    'header.orders': '订单历史',
    'header.logout': '登出',
    'header.login': '登录',
    'header.signup': '注册',
    // Cart
    'cart.items': '商品',
    'cart.empty': '购物车为空',
    'cart.title': '购物车',
    'cart.subtotal': '小计',
    'cart.tax': '税费',
    'cart.shipping': '运费',
    'cart.total': '总计',
    'cart.checkout': '去结算',
    // Products
    'product.price': '价格',
    'product.in_stock': '有货',
    'product.out_of_stock': '缺货',
    'product.rating': '评分',
    'product.reviews': '评论',
    'product.description': '描述',
    'product.quantity': '数量',
    // Common
    'common.add_to_cart': '添加到购物车',
    'common.buy': '购买',
    'common.save': '保存',
    'common.cancel': '取消',
    'common.search': '搜索',
    'common.filter': '筛选',
    'common.sort': '排序',
    'common.loading': '加载中...',
    'common.error': '错误',
    'common.success': '成功',
    // Checkout
    'checkout.title': '结算',
    'checkout.shipping': '送货地址',
    'checkout.billing': '账单地址',
    'checkout.payment': '支付方式',
    'checkout.review': '检查订单',
    'checkout.place_order': '下单',
    'checkout.promo_code': '促销代码',
    'checkout.apply': '应用',
    // Auth
    'auth.email': '邮箱',
    'auth.password': '密码',
    'auth.confirm_password': '确认密码',
    'auth.remember': '记住我',
    'auth.forgot_password': '忘记密码?',
    'auth.no_account': '没有账户?',
    'auth.have_account': '已有账户?',
    // Footer
    'footer.about': '关于我们',
    'footer.contact': '联系我们',
    'footer.privacy': '隐私政策',
    'footer.terms': '条款和条件',
    'footer.follow': '关注我们',
  },
  pl: {
    // Header
    'header.home': 'Strona główna',
    'header.blog': 'Blog',
    'header.changelog': 'Dziennik zmian',
    'header.featured': 'Polecana sztuka',
    'header.staff': 'Personel',
    'header.wishlist': 'Lista życzeń',
    'header.view_store': 'Wyświetl sklep',
    'header.settings': 'Ustawienia',
    'header.profile': 'Mój Profil',
    'header.orders': 'Historia Zamówień',
    'header.logout': 'Wyloguj się',
    'header.login': 'Zaloguj się',
    'header.signup': 'Zarejestruj się',
    // Cart
    'cart.items': 'przedmiotów',
    'cart.empty': 'Twój koszyk jest pusty',
    'cart.title': 'Koszyk Zakupów',
    'cart.subtotal': 'Razem',
    'cart.tax': 'Podatek',
    'cart.shipping': 'Wysyłka',
    'cart.total': 'Razem',
    'cart.checkout': 'Przejdź do kasy',
    // Products
    'product.price': 'Cena',
    'product.in_stock': 'W magazynie',
    'product.out_of_stock': 'Brak w magazynie',
    'product.rating': 'Ocena',
    'product.reviews': 'Opinie',
    'product.description': 'Opis',
    'product.quantity': 'Ilość',
    // Common
    'common.add_to_cart': 'Dodaj do koszyka',
    'common.buy': 'Kup',
    'common.save': 'Zapisz',
    'common.cancel': 'Anuluj',
    'common.search': 'Szukaj',
    'common.filter': 'Filtruj',
    'common.sort': 'Sortuj',
    'common.loading': 'Ładowanie...',
    'common.error': 'Błąd',
    'common.success': 'Sukces',
    // Checkout
    'checkout.title': 'Kasa',
    'checkout.shipping': 'Adres Wysyłki',
    'checkout.billing': 'Adres Rozliczeniowy',
    'checkout.payment': 'Sposób Płatności',
    'checkout.review': 'Przejrzyj Zamówienie',
    'checkout.place_order': 'Złóż Zamówienie',
    'checkout.promo_code': 'Kod Promocyjny',
    'checkout.apply': 'Zastosuj',
    // Auth
    'auth.email': 'Email',
    'auth.password': 'Hasło',
    'auth.confirm_password': 'Potwierdź Hasło',
    'auth.remember': 'Zapamiętaj Mnie',
    'auth.forgot_password': 'Zapomniałeś Hasła?',
    'auth.no_account': 'Nie masz konta?',
    'auth.have_account': 'Masz już konto?',
    // Footer
    'footer.about': 'O Nas',
    'footer.contact': 'Kontakt',
    'footer.privacy': 'Polityka Prywatności',
    'footer.terms': 'Warunki i Zasady',
    'footer.follow': 'Śledź Nas',
  },
  ro: {
    // Header
    'header.home': 'Acasă',
    'header.blog': 'Blog',
    'header.changelog': 'Jurnal de modificări',
    'header.featured': 'Artă în evidență',
    'header.staff': 'Personal',
    'header.wishlist': 'Lista de dorințe',
    'header.view_store': 'Vizualizați magazinul',
    'header.settings': 'Setări',
    'header.profile': 'Profilul Meu',
    'header.orders': 'Istoricul Comenzilor',
    'header.logout': 'Deconectare',
    'header.login': 'Conectare',
    'header.signup': 'Înregistrare',
    // Cart
    'cart.items': 'articole',
    'cart.empty': 'Coșul dvs. este gol',
    'cart.title': 'Coș de Cumpărături',
    'cart.subtotal': 'Subtotal',
    'cart.tax': 'Impozit',
    'cart.shipping': 'Livrare',
    'cart.total': 'Total',
    'cart.checkout': 'Procedeaza la Plată',
    // Products
    'product.price': 'Preț',
    'product.in_stock': 'În Stoc',
    'product.out_of_stock': 'Stoc Epuizat',
    'product.rating': 'Evaluare',
    'product.reviews': 'Recenzii',
    'product.description': 'Descriere',
    'product.quantity': 'Cantitate',
    // Common
    'common.add_to_cart': 'Adăugați în coș',
    'common.buy': 'Cumpărați',
    'common.save': 'Salvați',
    'common.cancel': 'Anulare',
    'common.search': 'Căutare',
    'common.filter': 'Filtru',
    'common.sort': 'Sortare',
    'common.loading': 'Se Încarcă...',
    'common.error': 'Eroare',
    'common.success': 'Succes',
    // Checkout
    'checkout.title': 'Plată',
    'checkout.shipping': 'Adresa de Livrare',
    'checkout.billing': 'Adresa de Facturare',
    'checkout.payment': 'Metoda de Plată',
    'checkout.review': 'Verificare Comandă',
    'checkout.place_order': 'Plasare Comandă',
    'checkout.promo_code': 'Cod Promo',
    'checkout.apply': 'Aplicare',
    // Auth
    'auth.email': 'Email',
    'auth.password': 'Parolă',
    'auth.confirm_password': 'Confirmă Parola',
    'auth.remember': 'Ține-mă Minte',
    'auth.forgot_password': 'Ai Uitat Parola?',
    'auth.no_account': 'Nu ai Cont?',
    'auth.have_account': 'Ai Deja Cont?',
    // Footer
    'footer.about': 'Despre Noi',
    'footer.contact': 'Contact',
    'footer.privacy': 'Politica de Confidențialitate',
    'footer.terms': 'Termeni și Condiții',
    'footer.follow': 'Urmărește-ne',
  },
};

// Helper function to translate
export function t(key: string, lang: Language): string {
  return translations[lang]?.[key] || translations['en']?.[key] || key;
}
