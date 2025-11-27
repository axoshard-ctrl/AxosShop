import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Globe, Settings } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { useState } from "react";

export function Internationalization() {
  const [selectedLanguage, setSelectedLanguage] = useState("en");
  const [selectedCurrency, setSelectedCurrency] = useState("USD");

  const languages = [
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "es", name: "Spanish", flag: "🇪🇸" },
    { code: "fr", name: "French", flag: "🇫🇷" },
    { code: "de", name: "German", flag: "🇩🇪" },
    { code: "ja", name: "Japanese", flag: "🇯🇵" },
    { code: "zh", name: "Chinese", flag: "🇨🇳" },
  ];

  const currencies = [
    { code: "USD", symbol: "$", name: "US Dollar" },
    { code: "EUR", symbol: "€", name: "Euro" },
    { code: "GBP", symbol: "£", name: "British Pound" },
    { code: "JPY", symbol: "¥", name: "Japanese Yen" },
    { code: "CAD", symbol: "C$", name: "Canadian Dollar" },
    { code: "AUD", symbol: "A$", name: "Australian Dollar" },
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Globe className="w-5 h-5" />
            Internationalization
          </CardTitle>
          <CardDescription>
            Multi-language and multi-currency support
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Languages */}
          <div className="space-y-3">
            <h3 className="font-semibold flex items-center gap-2">
              <span>🌍</span> Languages
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {languages.map((lang) => (
                <button
                  key={lang.code}
                  onClick={() => setSelectedLanguage(lang.code)}
                  className={`p-3 border rounded-lg text-center transition-all ${
                    selectedLanguage === lang.code
                      ? "border-primary bg-primary/10"
                      : "border-muted hover:border-primary/50"
                  }`}
                >
                  <div className="text-2xl mb-1">{lang.flag}</div>
                  <div className="text-sm font-medium">{lang.name}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Currencies */}
          <div className="space-y-3 border-t pt-6">
            <h3 className="font-semibold flex items-center gap-2">
              <span>💱</span> Currencies
            </h3>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
              {currencies.map((curr) => (
                <button
                  key={curr.code}
                  onClick={() => setSelectedCurrency(curr.code)}
                  className={`p-3 border rounded-lg text-center transition-all ${
                    selectedCurrency === curr.code
                      ? "border-primary bg-primary/10"
                      : "border-muted hover:border-primary/50"
                  }`}
                >
                  <div className="text-xl font-bold mb-1">{curr.symbol}</div>
                  <div className="text-xs font-medium">{curr.code}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Features */}
          <div className="bg-muted p-4 rounded-lg space-y-2 border-t pt-6">
            <h3 className="font-semibold text-sm">Features</h3>
            <ul className="text-sm space-y-1 text-muted-foreground">
              <li>✓ Auto-detect user location</li>
              <li>✓ Real-time currency conversion</li>
              <li>✓ Localized product descriptions</li>
              <li>✓ Region-specific shipping rates</li>
              <li>✓ Translated emails & notifications</li>
              <li>✓ Local payment methods per region</li>
            </ul>
          </div>

          <Button className="w-full gap-2">
            <Settings className="w-4 h-4" />
            Configure Advanced Settings
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
