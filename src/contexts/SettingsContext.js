import PropTypes from "prop-types";
import { createContext, useEffect } from "react";
import useLocalStorage from "../hooks/useLocalStorage";
import { defaultSettings } from "../config";
import useLocales from "../hooks/useLocales";

// ----------------------------------------------------------------------

const initialState = {
  ...defaultSettings,
  setSettings: () => {},
};

const SettingsContext = createContext(initialState);

// ----------------------------------------------------------------------

SettingsProvider.propTypes = {
  children: PropTypes.node,
};

function SettingsProvider({ children }) {
  const { onChangeLang } = useLocales()
  const [settings, setSettings] = useLocalStorage("settings", {
    theme: initialState.theme,
    language: initialState.language
  });

  useEffect(() => {
    onChangeLang(settings.language)

    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [settings.language])


  return (
    <SettingsContext.Provider
      value={{
        ...settings,
        setSettings,
      }}
    >
      {children}
    </SettingsContext.Provider>
  );
}

export { SettingsProvider, SettingsContext };
