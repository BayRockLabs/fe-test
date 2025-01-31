import React from "react";
import { Box, Typography, IconButton, Divider } from "@mui/material";
import CalendarMonthIcon from "@mui/icons-material/CalendarMonth";
import ChevronRightIcon from "@mui/icons-material/ChevronRight";
import ChevronLeftIcon from "@mui/icons-material/ChevronLeft";
import useLocales from "../../../hooks/useLocales";
import { makeStyles } from "@mui/styles";
import CalendarButton from "../../../common/estimationCalendarButton";
import palette from "../../../theme/palette";
import { fDateDMY } from "../../../utils/formatTime";

const useStyles = makeStyles((theme) => ({
  root: {
    marginTop: theme.spacing(2),
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    [theme.breakpoints.down("sm")]: {
      flexDirection: "column",
      alignItems: "center",
      "& > *:not(:last-child)": {
        marginBottom: theme.spacing(1),
      },
    },
  },
  dateRangeContainer: {
    display: "flex",
    alignItems: "center",
    "& > *:not(:last-child)": {
      marginRight: theme.spacing(1),
    },
  },
  buttonContainer: {
    marginLeft: "auto", // Align to the right
    display: "flex",
    alignItems: "center",
    "& > *:not(:last-child)": {
      marginRight: theme.spacing(1),
    },
  },
  // Define your hover and active button styles
  activeButton: {
    backgroundColor: palette.dark.secondary.activeBtn,
    color: palette.dark.primary.contrastText,
    "&:hover": {
      backgroundColor: palette.dark.secondary.main,
    },
  },
}));

export default function CalendarHeader({
  onViewChange,
  currentMonth,
  currentYear,
  onPrev,
  onNext,
  activeViewType,
  selectedStartDate,
  selectedEndDate,
}) {
  const { translate } = useLocales();
  const styles = useStyles();

  const handleViewChange = (newViewType) => {
    onViewChange(newViewType);
  };
  const formattedstartDate = fDateDMY(selectedStartDate);
  const formattedEndDate = fDateDMY(selectedEndDate);
  return (
    <Box className={styles.root}>
      <Box
        display="flex"
        alignItems="center"
        spacing={1}
        className={styles.dateRangeContainer}
      >
        <CalendarMonthIcon fontSize="medium" />
        <Typography variant="subtitle1">
          {formattedstartDate + " -" + formattedEndDate}
        </Typography>
      </Box>
      <Box
        display="flex"
        alignItems="center"
        spacing={1}
        className={styles.buttonContainer}
      >
        {/* Calendar buttons */}
        <CalendarButton
          variant="contained"
          color="primary"
          label={translate("EstimationCalendar.MONTHLY")}
          onClick={() => handleViewChange("monthly")}
          className={activeViewType === "monthly" ? styles.activeButton : ""}
        />
        <CalendarButton
          onClick={() => handleViewChange("weekly")}
          label={translate("EstimationCalendar.WEEKLY")}
          className={activeViewType === "weekly" ? styles.activeButton : ""}
        />
        <CalendarButton
          onClick={() => handleViewChange("daily")}
          label={translate("EstimationCalendar.DAILY")}
          className={activeViewType === "daily" ? styles.activeButton : ""}
        />
      </Box>
      <IconButton
        onClick={onPrev}
        disabled={
          activeViewType === "weekly" || activeViewType === "daily"
            ? selectedStartDate instanceof Date &&
              currentMonth.getMonth() === selectedStartDate.getMonth()
            : selectedStartDate instanceof Date &&
              currentYear.getFullYear() === selectedStartDate.getFullYear()
        }
      >
        <ChevronLeftIcon fontSize="large" />
      </IconButton>

      {/* Display the current month */}
      <Typography variant="subtitle1">
        {activeViewType === "monthly"
          ? currentYear.toLocaleDateString("en-US", {
              year: "numeric",
            })
          : currentMonth.toLocaleDateString("en-US", {
              month: "long",
            })}
      </Typography>
      {/* Add a button to navigate to the next month */}
      <IconButton
        onClick={onNext}
        disabled={
          activeViewType === "weekly" || activeViewType === "daily"
            ? selectedEndDate instanceof Date &&
              currentMonth.getMonth() === selectedEndDate.getMonth()
            : selectedEndDate instanceof Date &&
              currentYear.getFullYear() === selectedEndDate.getFullYear()
        }
      >
        <ChevronRightIcon fontSize="large" />
      </IconButton>
      <Divider />
    </Box>
  );
}
