import { useState, useEffect } from 'react';
import { Link } from 'wouter';
import { ArrowLeft, Globe, DollarSign, Palette, Moon, Sun, X } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Header } from '@/components/Header';
import Footer from '@/components/Footer';
import { useLanguage, type Language, t } from '@/lib/languageContext';
import { useTheme } from '@/lib/themeContext';
import { useCurrency } from '@/lib/currencyContext';
import { CURRENCIES } from '@shared/schema';
import { ColorThemeSelector } from '@/components/ColorThemeSelector';

export default function Settings() {
  const { language, setLanguage } = useLanguage();
  const { currency, setCurrency } = useCurrency();
  const { theme, toggleTheme } = useTheme();
  const [activeTab, setActiveTab] = useState<'language' | 'currency' | 'theme'>('language');
  const [gradientColors, setGradientColors] = useState<string[]>(() => {
    const saved = localStorage.getItem('axosshop_gradient_colors');
    return saved ? JSON.parse(saved) : ['#6366f1', '#ec4899'];
  });

  useEffect(() => {
    localStorage.setItem('axosshop_gradient_colors', JSON.stringify(gradientColors));
  }, [gradientColors]);

  const getGradientStyle = () => {
    if (gradientColors.length === 1) {
      return `linear-gradient(135deg, ${gradientColors[0]} 0%)`;
    } else if (gradientColors.length === 2) {
      return `linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 100%)`;
    } else {
      return `linear-gradient(135deg, ${gradientColors[0]} 0%, ${gradientColors[1]} 50%, ${gradientColors[2]} 100%)`;
    }
  };

  const addColor = () => {
    if (gradientColors.length < 3) {
      setGradientColors([...gradientColors, '#3b82f6']);
    }
  };

  const removeColor = (index: number) => {
    if (gradientColors.length > 1) {
      setGradientColors(gradientColors.filter((_, i) => i !== index));
    }
  };

  const updateColor = (index: number, color: string) => {
    const newColors = [...gradientColors];
    newColors[index] = color;
    setGradientColors(newColors);
  };

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

  return (
    <div className="min-h-screen bg-background flex flex-col">
      <Header cartItemCount={0} onCartClick={() => {}} />

      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href="/">
          <Button variant="ghost" className="mb-6 gap-2 hover:bg-primary/10">
            <ArrowLeft className="w-4 h-4" />
            {t('common.back', language) || 'Back'}
          </Button>
        </Link>

        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent flex items-center gap-3 mb-2">
            <Globe className="w-10 h-10 text-primary" />
            {t('header.settings', language)}
          </h1>
          <p className="text-muted-foreground text-lg">Customize your experience</p>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-8 flex-wrap">
          <button
            onClick={() => setActiveTab('language')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 border-2 ${
              activeTab === 'language'
                ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                : 'bg-muted text-muted-foreground border-transparent hover:bg-muted/80'
            }`}
          >
            <Globe className="w-5 h-5" />
            Languages
          </button>
          <button
            onClick={() => setActiveTab('currency')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 border-2 ${
              activeTab === 'currency'
                ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                : 'bg-muted text-muted-foreground border-transparent hover:bg-muted/80'
            }`}
          >
            <DollarSign className="w-5 h-5" />
            Currencies
          </button>
          <button
            onClick={() => setActiveTab('theme')}
            className={`px-6 py-3 rounded-lg font-semibold transition-all flex items-center gap-2 border-2 ${
              activeTab === 'theme'
                ? 'bg-primary text-primary-foreground border-primary shadow-lg'
                : 'bg-muted text-muted-foreground border-transparent hover:bg-muted/80'
            }`}
          >
            <Palette className="w-5 h-5" />
            Theme
          </button>
        </div>

        {/* Content */}
        <div className="bg-card rounded-2xl border border-primary/10 p-8">
          {/* Language Tab */}
          {activeTab === 'language' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <Globe className="w-6 h-6 text-primary" />
                  {t('intl.languages', language)}
                </h2>
                <p className="text-muted-foreground mb-6">Select your preferred language to customize the entire website</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-7 gap-3">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      onClick={() => setLanguage(lang.code)}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                        language === lang.code
                          ? 'border-primary shadow-lg'
                          : 'border-muted hover:border-primary/50 hover:bg-muted/50'
                      }`}
                      style={language === lang.code ? { background: getGradientStyle(), color: 'white' } : {}}
                    >
                      <span className="text-4xl">{lang.flag}</span>
                      <span className={`text-xs font-semibold text-center leading-tight ${
                        language === lang.code ? 'text-white' : 'text-foreground'
                      }`}>{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Currency Tab */}
          {activeTab === 'currency' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <DollarSign className="w-6 h-6 text-primary" />
                  {t('intl.currencies', language)}
                </h2>
                <p className="text-muted-foreground mb-6">Choose your preferred currency for all prices on the site</p>

                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-3">
                  {currencies.map((curr) => (
                    <button
                      key={curr.code}
                      onClick={() => setCurrency(curr.code)}
                      className={`p-4 rounded-xl border-2 transition-all flex flex-col items-center gap-2 ${
                        currency === curr.code
                          ? 'border-primary shadow-lg'
                          : 'border-muted hover:border-primary/50 hover:bg-muted/50'
                      }`}
                      style={currency === curr.code ? { background: getGradientStyle(), color: 'white' } : {}}
                    >
                      <span className="text-3xl font-bold">{curr.symbol}</span>
                      <span className={`text-xs font-semibold ${currency === curr.code ? 'text-white' : ''}`}>{curr.code}</span>
                      <span className={`text-xs text-center line-clamp-2 leading-tight ${
                        currency === curr.code ? 'text-white/90' : 'text-muted-foreground'
                      }`}>{curr.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Theme Tab */}
          {activeTab === 'theme' && (
            <div className="space-y-8">
              {/* Gradient Color Picker */}
              <div>
                <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                  <Palette className="w-6 h-6 text-primary" />
                  Custom Button Gradient
                </h2>
                <p className="text-muted-foreground mb-6">Create a custom gradient for language and currency buttons (up to 3 colors)</p>

                <div className="space-y-4">
                  {/* Gradient Preview */}
                  <div 
                    className="w-full h-32 rounded-xl border-2 border-primary/20 shadow-lg"
                    style={{ background: getGradientStyle() }}
                  />

                  {/* Color Picker Inputs */}
                  <div className="space-y-3">
                    {gradientColors.map((color, index) => (
                      <div key={index} className="flex items-center gap-3">
                        <div className="flex-1 flex items-center gap-3 bg-muted/30 p-3 rounded-lg border border-primary/10">
                          <input
                            type="color"
                            value={color}
                            onChange={(e) => updateColor(index, e.target.value)}
                            className="w-12 h-12 rounded-lg cursor-pointer border-2 border-primary/20"
                          />
                          <input
                            type="text"
                            value={color}
                            onChange={(e) => updateColor(index, e.target.value)}
                            className="flex-1 px-3 py-2 rounded-lg border border-primary/20 bg-background text-sm font-mono"
                            placeholder="#000000"
                          />
                          <span className="text-xs font-semibold text-muted-foreground min-w-fit">Color {index + 1}</span>
                        </div>
                        {gradientColors.length > 1 && (
                          <button
                            onClick={() => removeColor(index)}
                            className="p-2 hover:bg-destructive/10 rounded-lg transition-colors text-destructive"
                            title="Remove color"
                          >
                            <X className="w-5 h-5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>

                  {/* Add Color Button */}
                  {gradientColors.length < 3 && (
                    <button
                      onClick={addColor}
                      className="w-full px-4 py-3 rounded-lg bg-primary/10 border-2 border-primary/30 hover:bg-primary/20 transition-colors font-semibold text-primary"
                    >
                      + Add Color ({gradientColors.length}/3)
                    </button>
                  )}
                </div>
              </div>
              <div className="border-t border-primary/10 pt-8">
                {/* Built-in Colors and Dark Mode Header */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  {/* Built-in Colors */}
                  <div>
                    <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                      <Palette className="w-6 h-6 text-primary" />
                      Built-in Colors
                    </h2>
                    <p className="text-muted-foreground mb-6">Choose from preset color themes</p>
                    <div className="bg-background rounded-xl border border-primary/10 p-6">
                      <ColorThemeSelector />
                    </div>
                  </div>

                  {/* Dark/Light Mode */}
                  <div>
                    <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
                      {theme === 'light' ? (
                        <Sun className="w-6 h-6 text-yellow-500" />
                      ) : (
                        <Moon className="w-6 h-6 text-blue-500" />
                      )}
                      Dark Mode
                    </h2>
                    <p className="text-muted-foreground mb-6">Switch between light and dark appearance</p>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <button
                        onClick={() => theme !== 'light' && toggleTheme()}
                        className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${
                          theme === 'light'
                            ? 'bg-gradient-to-br from-yellow-400 to-orange-400 border-yellow-500 shadow-lg shadow-yellow-500/30 text-foreground'
                            : 'border-muted hover:border-primary/50 hover:bg-muted/50'
                        }`}
                      >
                        <Sun className="w-8 h-8" />
                        <span className="font-semibold">{t('theme.light_mode', language)}</span>
                      </button>
                      <button
                        onClick={() => theme !== 'dark' && toggleTheme()}
                        className={`p-6 rounded-xl border-2 transition-all flex flex-col items-center gap-3 ${
                          theme === 'dark'
                            ? 'bg-gradient-to-br from-blue-600 to-purple-600 border-blue-500 shadow-lg shadow-blue-500/30 text-primary-foreground'
                            : 'border-muted hover:border-primary/50 hover:bg-muted/50'
                        }`}
                      >
                        <Moon className="w-8 h-8" />
                        <span className="font-semibold">{t('theme.dark_mode', language)}</span>
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Save Notice */}
        <div className="mt-8 p-4 rounded-lg bg-primary/5 border border-primary/20 text-center">
          <p className="text-muted-foreground">
            ✨ Your settings are automatically saved and will persist across all devices!
          </p>
        </div>
      </main>

      <Footer />
    </div>
  );
}
