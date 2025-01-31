import { useTranslation } from 'react-i18next';
import useSettings from './useSettings';
// config
import { allLangs, defaultSettings } from '../config';

// ----------------------------------------------------------------------

export default function useLocales() {
  const { i18n, t: translate } = useTranslation();

  const { language } = useSettings();

  const currentLang = allLangs.find((_lang) => _lang.value === language) || defaultSettings.language;

  const handleChangeLanguage = (newlang) => {
    i18n.changeLanguage(newlang);
  };

  return {
    onChangeLang: handleChangeLanguage,
    translate: (text, options) => translate(text, options),
    currentLang,
    allLangs,
  };
}
