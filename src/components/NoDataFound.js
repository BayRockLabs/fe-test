import React from "react";
import { Box, Typography } from "@mui/material";
import useLocales from "../hooks/useLocales";
import { createStyles, useTheme } from "@mui/styles";
import NoDataFoundIcon from "../assets/svg/no-results.svg";

const useStyles = createStyles((theme) => ({
  noDataFound: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100vh",
    marginTop: "-5%",
  },
  noDataImage: {
    cursor: "pointer",
  },
}));

export default function NoDataFound({ msgId = "" }) {
  const theme = useTheme();
  const styles = useStyles(theme);
  const { translate } = useLocales();
  return (
    <Box sx={styles.noDataFound}>
      <img
        src={NoDataFoundIcon}
        alt="NoDataFound"
        className={styles.noDataImage}
      />
      <Typography variant="body2">
        {translate("CONTRACTS.NO_DATA_FOUND")}
      </Typography>
      <Typography variant="body1">{translate(msgId)}</Typography>
    </Box>
  );
}
