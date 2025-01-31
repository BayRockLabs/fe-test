// @mui
import { enUS, frFR } from "@mui/material/locale";

// API
// ----------------------------------------------------------------------

// LAYOUT
// ----------------------------------------------------------------------

export const HEADER = {
  MOBILE_HEIGHT: 64,
  MAIN_DESKTOP_HEIGHT: 88,
  DASHBOARD_DESKTOP_HEIGHT: 92,
  DASHBOARD_DESKTOP_OFFSET_HEIGHT: 92 - 32,
};

export const NAVBAR = {
  BASE_WIDTH: 260,
  DASHBOARD_WIDTH: 280,
  DASHBOARD_COLLAPSE_WIDTH: 88,
  //
  DASHBOARD_ITEM_ROOT_HEIGHT: 48,
  DASHBOARD_ITEM_SUB_HEIGHT: 40,
  DASHBOARD_ITEM_HORIZONTAL_HEIGHT: 32,
};

export const ICON = {
  NAVBAR_ITEM: 22,
  NAVBAR_ITEM_HORIZONTAL: 20,
};

// MULTI LANGUAGES
// Please remove `localStorage` when you change settings.
// ----------------------------------------------------------------------

export const allLangs = [
  {
    label: "English",
    value: "EN",
    systemValue: enUS,
    icon: "/static/flags/ic_flag_en.svg",
  },
  {
    label: "French",
    value: "FR",
    systemValue: frFR,
    icon: "/static/flags/ic_flag_fr.svg",
  },
  // {
  //   label: "Vietnamese",
  //   value: "vn",
  //   systemValue: viVN,
  //   icon: "/assets/icons/flags/ic_flag_vn.svg",
  // },
  // {
  //   label: "Chinese",
  //   value: "cn",
  //   systemValue: zhCN,
  //   icon: "/assets/icons/flags/ic_flag_cn.svg",
  // },
  // {
  //   label: "Arabic (Sudan)",
  //   value: "ar",
  //   systemValue: arSD,
  //   icon: "/assets/icons/flags/ic_flag_sa.svg",
  // },
];

// SETTINGS
// Please remove `localStorage` when you change settings.
// ----------------------------------------------------------------------

export const themeMode = [
  {
    label: "Light",
    value: "LIGHT",
    icon: "ph:sun-duotone",
  },
  {
    label: "Dark",
    value: "DARK",
    icon: "ph:moon-duotone",
  },
];

export const defaultSettings = {
  theme: themeMode[0].value,
  language: allLangs[0].value,
};


export const PERMISSIONS = {
  users: '4fcb9007-e233-4bcf-bd26-3bc2bc75f856',
  roles: 'd60094e8-7ae0-4838-9301-5e5196588194'
}