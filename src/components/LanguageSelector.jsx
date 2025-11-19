import { useState, useEffect } from "react";
import { getLanguage, setLanguage } from "../lib/i18n";

export default function LanguageSelector() {
  const [currentLang, setCurrentLang] = useState("en");
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    setCurrentLang(getLanguage());
  }, []);

  const handleLanguageChange = (lang) => {
    setLanguage(lang);
    setCurrentLang(lang);
    setIsOpen(false);
    // Reload page to apply language changes
    window.location.reload();
  };

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="px-3 py-1.5 rounded-xl border border-border hover:bg-muted text-sm font-medium transition-colors flex items-center gap-2"
      >
        <span>{currentLang === "en" ? "🇺🇸" : "🇰🇷"}</span>
        <span>{currentLang.toUpperCase()}</span>
        <span className="text-xs">▼</span>
      </button>

      {isOpen && (
        <>
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
          />
          <div className="absolute right-0 mt-2 w-32 rounded-xl border border-border bg-background shadow-lg z-20 overflow-hidden">
            <button
              onClick={() => handleLanguageChange("en")}
              className={`w-full px-4 py-2 text-left hover:bg-muted transition-colors flex items-center gap-2 ${
                currentLang === "en" ? "bg-muted" : ""
              }`}
            >
              <span>🇺🇸</span>
              <span>English</span>
            </button>
            <button
              onClick={() => handleLanguageChange("ko")}
              className={`w-full px-4 py-2 text-left hover:bg-muted transition-colors flex items-center gap-2 ${
                currentLang === "ko" ? "bg-muted" : ""
              }`}
            >
              <span>🇰🇷</span>
              <span>한국어</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}

