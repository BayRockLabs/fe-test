// ----------------------------------------------------------------------

export default function Stepper(theme) {
  return {
    stepperRoot: {
      "& .MuiStepLabel-root .Mui-completed": {
        fill: theme.palette.success.main,
      },
      "& .MuiStepLabel-root .Mui-active": {
        color: theme.palette.primary.main, // circle color (ACTIVE)
      },
      "& .MuiStepLabel-root .Mui-active .MuiStepIcon-text": {
        fontWeight: theme.typography.fontWeightBold,
      },
      error: {
        '& input': {
          color: theme.palette.text.main, // Change the text color to red
        },
        '& .MuiFormHelperText-root': {
          color: theme.palette.text.main, // Change the helper text color to red
        },
      },
    },
    MuiStepConnector: {
      styleOverrides: {
        line: {
          borderColor: theme.palette.divider,
        },
      },
    },

  };
}
