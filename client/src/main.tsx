import { createRoot } from "react-dom/client";
import App from "./App";
import "./index.css";
import { ThemeProvider } from "@/lib/themeContext";
import { CurrencyProvider } from "@/lib/currencyContext";

createRoot(document.getElementById("root")!).render(
  <ThemeProvider>
    <CurrencyProvider>
      <App />
    </CurrencyProvider>
  </ThemeProvider>
);
