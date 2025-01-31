import React from "react";
import PageNotFound from "../assets/svg/page404.svg";
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
  urlsList: {
    listStyleType: "disc",
    paddingLeft: "10px",
  },

  container: {
    display: "flex",
    flexDirection: "column",
    alignItems: "left",
  },
  customText: {
    color:theme.palette.primary.theme_blue,

  },
}));

function Page404() {
  const theme = useTheme();

  const styles = useStyles(theme);

  const { translate } = useLocales();
  return (
    <Box sx={styles.customBox}>
      <Typography variant="h3">{translate("pageNotFound")}</Typography>
      <Typography variant="subtitle2">
        {` ${translate("helpCenter1")} `}
        <span style={styles.customText}>{translate("helpCenter2")}</span>
        {` ${translate("helpCenter3")}`}
      </Typography>

      <img
        src={PageNotFound}
        alt="CustomImageAltText"
        sx={styles.customImage}
      />
      <Box sx={styles.container}>
        <Typography variant="h6">{translate("PossibleReasons")}</Typography>
        <ul className={styles.urlsList}>
          <li>
            <Typography variant="subtitle2">{translate("URL1")}</Typography>
          </li>
          <li>
            <Typography variant="subtitle2">{translate("URL2")}</Typography>
          </li>
        </ul>
      </Box>
    </Box>
  );
}

export default Page404;
