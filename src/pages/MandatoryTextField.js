import React from "react";
import { createStyles, useTheme } from "@mui/styles";

const useStyles = createStyles((theme) => ({
  requiredAsterisk: {
    color: theme.palette.error.main,
    marginLeft: "2px",
  },
 
}));
export default function MandatoryTextField({ label = "" }) {
  const theme = useTheme();
  const styles = useStyles(theme);
 
    return (
      <div>
        {label} 
        <span style={styles.requiredAsterisk}>*</span>
      </div>
    );
 
 
}
