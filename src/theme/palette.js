import { alpha } from "@mui/material/styles";

function createGradient(color1, color2) {
  return `linear-gradient(to bottom, ${color1}, ${color2})`;
}

// SETUP COLORS
const GREY = {
  0: "#FFFFFF",
  100: "#F9FAFB",
  200: "#F4F6F8",
  300: "#DFE3E8",
  400: "#C4CDD5",
  500: "#919EAB",
  600: "#637381",
  700: "#454F5B",
  800: "#212B36",
  900: "#161C24",
  500_8: alpha("#919EAB", 0.08),
  500_12: alpha("#919EAB", 0.12),
  500_16: alpha("#919EAB", 0.16),
  500_24: alpha("#919EAB", 0.24),
  500_32: alpha("#919EAB", 0.32),
  500_48: alpha("#919EAB", 0.48),
  500_56: alpha("#919EAB", 0.56),
  500_80: alpha("#919EAB", 0.8),
};

const PRIMARY = {
  lighter: "#7E50FF",
  light: "#5A21F9",
  main: "#01CCFF",
  dark: "#02B4DF",
  darker: "#290888",
  contrastText: "#FFF",
  blue: "#01CCFF",
  theme_blue: "#01CCFF",
};
const SECONDARY = {
  lighter: "#DAC3FB",
  light: "#A66FF8",
  main: "#01CCFF",
  dark: "#02B4DF",
  darker: "#4900DE",
  contrastText: "#FFF",
  activeBtn: "#8056F7",
};
const INFO = {
  lighter: "#CEEFF4",
  light: "#82E0ED",
  main: "#08AFC6",
  dark: "#048794",
  darker: "#016368",
  contrastText: "#FFF",
};
const SUCCESS = {
  lighter: "#CCF1E6",
  light: "#89D4B4",
  main: "#02B781",
  dark: "#008953",
  darker: "#005930",
  contrastText: GREY[800],
};
const WARNING = {
  lighter: "#FFF7CD",
  light: "#FFE16A",
  main: "#FFC531",
  dark: "#B78103",
  darker: "#7A4F01",
  contrastText: GREY[800],
};
const ERROR = {
  lighter: "#F9C1C8",
  light: "#FFA48D",
  main: "#EC2F46",
  dark: "#B72136",
  darker: "#7A0C2E",
  contrastText: "#FFF",
};

const GRADIENTS = {
  primary: createGradient(PRIMARY.light, PRIMARY.main),
  info: createGradient(INFO.light, INFO.main),
  success: createGradient(SUCCESS.light, SUCCESS.main),
  warning: createGradient(WARNING.light, WARNING.main),
  error: createGradient(ERROR.light, ERROR.main),
};

const CHART_COLORS = {
  violet: ["#826AF9", "#9E86FF", "#D0AEFF", "#F7D2FF"],
  blue: ["#2D99FF", "#83CFFF", "#A5F3FF", "#CCFAFF"],
  green: ["#2CD9C5", "#60F1C8", "#A4F7CC", "#C0F2DC"],
  yellow: ["#FFE700", "#FFEF5A", "#FFF7AE", "#FFF3D6"],
  red: ["#FF6C40", "#FF8F6D", "#FFBD98", "#FFF2D4"],
};
const SIDE_MENU = {
  background: "#2D2936",
  color: "#C9B7FB",
  border: "#363240",
};
const COMMON = {
  common: { black: "#76CCF", white: "#EDF0F5" },
  primary: { ...PRIMARY },
  secondary: { ...SECONDARY },
  info: { ...INFO },
  success: { ...SUCCESS },
  warning: { ...WARNING },
  error: { ...ERROR },
  grey: GREY,
  gradients: GRADIENTS,
  chart: CHART_COLORS,
  divider: GREY[500_24],
  action: {
    hover: GREY[500_8],
    selected: GREY[500_16],
    disabled: GREY[500_80],
    disabledBackground: GREY[500_24],
    focus: GREY[500_24],
    hoverOpacity: 0.08,
    disabledOpacity: 0.48,
  },
  sidebar: { ...SIDE_MENU },
};

const BACKGROUND = {
  main: "#E4EBF6",
  selected: "#EFF2F5",
  dark: "#22232D",
  darker: "#1C1D24",
  divider: "#E8ECF0",
  section: "#F8F6F0",
};

const palette = {
  light: {
    ...COMMON,
    mode: "light",
    text: {
      primary: "#1C1D24",
      secondary: "#7E8799",
      main: "#99A4B6",
      light: "#FFFFFF",
      disabled: "#999FA8",
      border: "#EBF0F4",
      black: "#000000",
    },
    background: {
      ...BACKGROUND,
      paper: "#FFFFFF",
      default: "#8D929A",
      neutral: GREY[200],
      slider: "#C4C4C4",
    },
    action: { active: GREY[600], ...COMMON.action },
  },
  dark: {
    ...COMMON,
    mode: "dark",
    text: {
      primary: "#000",
      secondary: GREY[500],
      main: "#999FA8",
      light: "#FFFFFF",
      disabled: GREY[600],
    },
    background: {
      ...BACKGROUND,
      paper: GREY[800],
      default: GREY[900],
      neutral: GREY[500_16],
    },
    action: { active: GREY[500], ...COMMON.action },
  },
};

export default palette;
