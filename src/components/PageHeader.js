import * as React from "react";
import {
  Box,
  Button,
  Typography,
  useTheme,
  Stack,
  Tooltip,
} from "@mui/material";
import { useNavigate } from "react-router-dom";
import PropTypes from "prop-types";
import { createStyles } from "@mui/styles";
import BackSvg from "../assets/svg/ic_back.svg";
import useClient from "../hooks/useClient";
import { fCapitalizeFirst } from "../utils/formatString";
import Page from "./Page";
import { useData } from "../contexts/DataContext";
import ROLES from "../routes/Roles";

const useStyles = createStyles((theme) => ({
  rootBox: {
    margin: "3% 0%",
    justifyContent: "space-between",
    alignItems: "center",
    display: "flex",
    width: "100%",
  },
  title: {
    color: theme.palette.text.primary,
    fontFamily: "Inter",
    fontSize: "20px",
    fontStyle: "normal",
    fontWeight: "700",
    lineHeight: "normal",
    whiteSpace: "nowrap",
  },
  secondaryTitle: {
    color: theme.palette.primary,
    fontFamily: "Inter",
    fontSize: "14px",
    fontStyle: "normal",
    fontWeight: "600",
    lineHeight: "normal",
    padding: "4px 12px",
    borderRadius: "12px",
    background: theme.palette.secondary.main,
    whiteSpace: "nowrap",
    overflow: "hidden",
    textOverflow: "ellipsis",
    maxWidth: "auto",
    [theme.breakpoints.down("sm")]: {
      fontSize: "12px",
      padding: "4px 8px",
      maxWidth: "100px",
    },
  },
}));

PageHeader.propTypes = {
  primaryTitle: PropTypes.string.isRequired,
  buttonText: PropTypes.string,
  showSecondaryTitle: PropTypes.bool,
  showBack: PropTypes.bool,
  onClickButton: PropTypes.func,
  onClickBack: PropTypes.func,
  rightView: PropTypes.node,
  buttonStyle: PropTypes.object,
  isDisabled: PropTypes.bool,
  isPricingDisabled: PropTypes.bool,
};

export default function PageHeader({
  primaryTitle,
  buttonText,
  showSecondaryTitle = true,
  showBack = false,
  onClickButton,
  onClickBack,
  rightView,
  buttonStyle,
  isDisabled,
  isPricingDisabled,
  screen,
}) {
  const theme = useTheme();
  const styles = useStyles(theme);
  const navigate = useNavigate();

  const { userData } = useData();
  const { selectedClient } = useClient();

  const onClickBackIcon = () => {
    navigate(-1);
  };

  function getClientName() {
    return fCapitalizeFirst(selectedClient?.name);
  }
  const {
    EST_ADMIN,
    ALLOCATION_ADMIN,
    CLIENT_ADMIN,
    MILESTONE_ADMIN,
    PO_ADMIN,
    PRICING_ADMIN,
    SOW_ADMIN,
    SUPER_ADMIN,
  } = ROLES;
  // Permission Mapping for Buttons
  const buttonPermissions = {
    "Add Client": [CLIENT_ADMIN, SUPER_ADMIN],
    Edit: {
      Estimation: [EST_ADMIN, SUPER_ADMIN],
      Pricing: [SUPER_ADMIN, PRICING_ADMIN],
      Contracts: [SUPER_ADMIN, SOW_ADMIN],
      Client: [SUPER_ADMIN, CLIENT_ADMIN],
      Allocation: [ALLOCATION_ADMIN, SUPER_ADMIN],
      Milestone: [MILESTONE_ADMIN, SUPER_ADMIN],
      PO: [PO_ADMIN, SUPER_ADMIN],
      Customer: [SUPER_ADMIN],
    },
    "Add Estimation": [SUPER_ADMIN, EST_ADMIN],
    "Add Pricing": [SUPER_ADMIN, PRICING_ADMIN],
    "Add Contract": [SUPER_ADMIN, SOW_ADMIN],
    "Add Milestone": [SUPER_ADMIN, MILESTONE_ADMIN],
    "Add Allocation": [SUPER_ADMIN, ALLOCATION_ADMIN],
    "Add Customer": [SUPER_ADMIN],
  };

  const hasButtonPermission = () => {
    if (buttonText === "Edit" && screen) {
      // Check for Edit permissions based on the specific screen
      return userData?.user_roles?.some((role) =>
        buttonPermissions.Edit[screen]?.includes(role)
      );
    }

    if (Array.isArray(buttonPermissions[buttonText])) {
      return userData?.user_roles?.some((role) =>
        buttonPermissions[buttonText]?.includes(role)
      );
    }

    return false; // Default to no permission if buttonText does not match any key
  };
  const title = isDisabled
    ? "Contract is locked for this Estimation, You can't edit it"
    : isPricingDisabled
    ? "Contract is locked for this Pricing, You can't edit it"
    : null;

  // Render Button based on Permissions
  const renderButton = hasButtonPermission() ? (
    <Tooltip
      title={title}
      disableHoverListener={!isDisabled && !isPricingDisabled}
    >
      <span>
        <Button
          variant="contained"
          style={{ color: "black" }}
          onClick={onClickButton}
          sx={buttonStyle}
          disabled={isDisabled || isPricingDisabled}
        >
          {buttonText}
        </Button>
      </span>
    </Tooltip>
  ) : null;

  return (
    <Page title={primaryTitle}>
      <Box sx={styles.rootBox}>
        <Stack spacing={2} direction="row">
          {showBack && (
            <img
              src={BackSvg}
              alt="BackIcon"
              style={{ cursor: "pointer" }}
              onClick={onClickBack ?? onClickBackIcon}
            />
          )}
          <Typography sx={styles.title}>{primaryTitle}</Typography>
          {showSecondaryTitle && (
            <Typography sx={styles.secondaryTitle}>
              {getClientName()}
            </Typography>
          )}
        </Stack>
        {rightView ? <>{rightView}</> : renderButton}
      </Box>
    </Page>
  );
}
