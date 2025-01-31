import React from "react";
import Websiteconstruction from "../assets/svg/launching.svg";
import { Box, Typography } from "@mui/material";
import { createStyles, useTheme } from "@mui/styles";
import useLocales from "../hooks/useLocales";
import palette from "../theme/palette";

const useStyles = createStyles((theme) => ({
  customBox: {
    padding: theme.spacing(25),
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    gap: "20px",
  },
  customImage: {
    cursor: "pointer",
  },
  customText: {
    color:theme.palette.primary.theme_blue,

  },
}));
function WorkInProgress() {
  const theme = useTheme();

  const styles = useStyles(theme);

  const { translate } = useLocales();
  return (
    <Box sx={styles.customBox}>
      <Typography variant="h3">
        {` ${translate("text1")} `}
        <span style={styles.customText}>{translate("text2")}</span>
      </Typography>

      <Typography variant="subtitle2">{translate("data")}</Typography>
      <img
        src={Websiteconstruction}
        alt="CustomImageAltText"
        sx={styles.customImage}
      />
    </Box>
  );
}

export default WorkInProgress;
