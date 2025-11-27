import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "@/lib/themeContext";
import { CurrencyProvider } from "@/lib/currencyContext";
import { LanguageProvider } from "@/lib/languageContext";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <CurrencyProvider>
      <LanguageProvider>
        <App />
      </LanguageProvider>
    </CurrencyProvider>
  </ThemeProvider>
);
