import React from "react";
import { Button } from "@mui/material";
import { makeStyles, useTheme } from "@mui/styles";
import palette from "../theme/palette";

const useStyles = makeStyles((theme) => ({
  calendarButton: {
    fontWeight: "600",
    borderRadius: "4px",
  },
  activeButton: {
    backgroundColor: palette.light.secondary.main,
  },
}));

export default function CalendarButton({ label, onClick, active, className }) {
  const theme = useTheme();
  const styles = useStyles(theme);

  return (
    <Button
      variant="outlined"
      className={`${styles.calendarButton} ${
        active ? styles.activeButton : ""
      } ${className}`}
      color="text"
      onClick={onClick}
    >
      {label}
    </Button>
  );
}
