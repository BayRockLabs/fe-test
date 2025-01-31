import i18n from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";
// config
import { defaultSettings } from "../config";
//
import enLocales from "./en";
import frLocales from "./fr";

// ----------------------------------------------------------------------

let settings = localStorage.getItem("settings");
if (settings) {
  settings = JSON.parse(settings) || {};
} else {
  settings = defaultSettings;
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources: {
      EN: { translations: enLocales },
      FR: { translations: frLocales },
    },
    lng: settings.language,
    fallbackLng: settings.language,
    debug: false,
    ns: ["translations"],
    defaultNS: "translations",
    interpolation: {
      escapeValue: false,
    },
  });

export default i18n;
