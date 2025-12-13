import { useState } from 'react';
import { X, Globe, DollarSign, Palette, Moon, Sun } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useLanguage, type Language, t } from '@/lib/languageContext';
import { useTheme } from '@/lib/themeContext';
import { useCurrency } from '@/lib/currencyContext';
import { CURRENCIES } from '@shared/schema';
import { ColorThemeSelector } from '@/components/ColorThemeSelector';

interface SettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SettingsPanel({ isOpen, onClose }: SettingsPanelProps) {
  const { language, setLanguage } = useLanguage();
  const { currency, setCurrency } = useCurrency();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'language' | 'currency' | 'theme'>('language');

  const languages: Array<{ code: Language; name: string; flag: string }> = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "es", name: "Spanish", flag: "🇪🇸" },
    { code: "fr", name: "French", flag: "🇫🇷" },
    { code: "de", name: "German", flag: "🇩🇪" },
    { code: "ja", name: "Japanese", flag: "🇯🇵" },
    { code: "zh", name: "Chinese", flag: "🇨🇳" },
    { code: "pl", name: "Polish", flag: "🇵🇱" },
    { code: "ro", name: "Romanian", flag: "🇷🇴" },
    { code: "it", name: "Italian", flag: "🇮🇹" },
    { code: "pt", name: "Portuguese", flag: "🇵🇹" },
    { code: "ru", name: "Russian", flag: "🇷🇺" },
    { code: "ko", name: "Korean", flag: "🇰🇷" },
    { code: "tr", name: "Turkish", flag: "🇹🇷" },
    { code: "nl", name: "Dutch", flag: "🇳🇱" },
  ];

  const currencyNames: Record<string, string> = {
    USD: t('intl.usd', language),
    EUR: t('intl.eur', language),
    GBP: t('intl.gbp', language),
    JPY: t('intl.jpy', language),
    CAD: t('intl.cad', language),
    AUD: t('intl.aud', language),
    PLN: t('intl.pln', language),
    RON: t('intl.ron', language),
    CHF: t('intl.chf', language),
    SEK: t('intl.sek', language),
    NOK: t('intl.nok', language),
    INR: t('intl.inr', language),
    MXN: t('intl.mxn', language),
    BRL: t('intl.brl', language),
  };

  const currencies = Object.entries(CURRENCIES).map(([code, { symbol }]) => ({
    code: code as keyof typeof CURRENCIES,
    symbol,
    name: currencyNames[code] || code,
  }));

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4">
      <div className="bg-background rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden flex flex-col border border-primary/20">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-primary/10">
          <h2 className="text-2xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center gap-2">
            <Globe className="w-6 h-6 text-primary" />
            {t('header.settings', language)}
          </h2>
          <button
            onClick={onClose}
            className="p-2 hover:bg-primary/10 rounded-lg transition-colors"
            aria-label="Close settings"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 p-4 border-b border-primary/10 bg-card/50 flex-wrap">
          <button
            onClick={() => setActiveTab('language')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'language'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <Globe className="w-4 h-4" />
            Languages
          </button>
          <button
            onClick={() => setActiveTab('currency')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'currency'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <DollarSign className="w-4 h-4" />
            Currencies
          </button>
          <button
            onClick={() => setActiveTab('theme')}
            className={`px-4 py-2 rounded-lg font-medium transition-all flex items-center gap-2 ${
              activeTab === 'theme'
                ? 'bg-primary text-primary-foreground'
                : 'bg-muted text-muted-foreground hover:bg-muted/80'
            }`}
          >
            <Palette className="w-4 h-4" />
            Theme
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* Language Tab */}
          {activeTab === 'language' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Globe className="w-5 h-5 text-primary" />
                  {t('intl.languages', language)}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => {
                        setLanguage(lang.code);
                      }}
                      className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                        language === lang.code
                          ? 'border-primary bg-primary/10 shadow-lg'
                          : 'border-muted hover:border-primary/50'
                      }`}
                    >
                      <span className="text-3xl">{lang.flag}</span>
                      <span className="text-xs font-medium text-center">{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Currency Tab */}
          {activeTab === 'currency' && (
            <div className="space-y-4">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <DollarSign className="w-5 h-5 text-primary" />
                  {t('intl.currencies', language)}
                </h3>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                  {currencies.map((curr) => (
                    <button
                      key={curr.code}
                      onClick={() => {
                        setCurrency(curr.code);
                      }}
                      className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                        currency === curr.code
                          ? 'border-primary bg-primary/10 shadow-lg'
                          : 'border-muted hover:border-primary/50'
                      }`}
                    >
                      <span className="text-2xl font-bold text-primary">{curr.symbol}</span>
                      <span className="text-xs font-medium">{curr.code}</span>
                      <span className="text-xs text-muted-foreground text-center line-clamp-2">{curr.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Theme Tab */}
          {activeTab === 'theme' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  <Palette className="w-5 h-5 text-primary" />
                  {t('theme.color_theme', language)}
                </h3>
                <div className="p-4 bg-card rounded-lg border border-primary/10">
                  <ColorThemeSelector />
                </div>
              </div>

              <div className="border-t border-primary/10 pt-6">
                <h3 className="text-lg font-semibold mb-4 flex items-center gap-2">
                  {theme === 'light' ? (
                    <Sun className="w-5 h-5 text-yellow-500" />
                  ) : (
                    <Moon className="w-5 h-5 text-blue-500" />
                  )}
                  Dark Mode
                </h3>
                <div className="grid grid-cols-2 gap-3">
                  <button
                    onClick={() => theme !== 'light' && toggleTheme()}
                    className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                      theme === 'light'
                        ? 'border-primary bg-primary/10 shadow-lg'
                        : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    <Sun className="w-6 h-6 text-yellow-500" />
                    <span className="text-sm font-medium">{t('theme.light_mode', language)}</span>
                  </button>
                  <button
                    onClick={() => theme !== 'dark' && toggleTheme()}
                    className={`p-4 rounded-lg border-2 transition-all flex flex-col items-center gap-2 ${
                      theme === 'dark'
                        ? 'border-primary bg-primary/10 shadow-lg'
                        : 'border-muted hover:border-primary/50'
                    }`}
                  >
                    <Moon className="w-6 h-6 text-blue-500" />
                    <span className="text-sm font-medium">{t('theme.dark_mode', language)}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="p-6 border-t border-primary/10 bg-card/50">
          <Button
            onClick={onClose}
            className="w-full bg-gradient-to-r from-primary to-secondary hover:shadow-lg hover:shadow-primary/30 transition-all"
          >
            {t('common.save', language)}
          </Button>
        </div>
      </div>
    </div>
  );
}
