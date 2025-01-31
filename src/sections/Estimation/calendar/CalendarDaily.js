import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Grid,
  TextField,
  Stack,
  Divider,
} from "@mui/material";
import { InfoOutlined } from "@mui/icons-material";
import { makeStyles } from "@mui/styles";
import palette from "../../../theme/palette";
import useLocales from "../../../hooks/useLocales";
import { generateCalendarDays } from "../../../utils/calendarUtils";
import InputAdornment from "@mui/material/InputAdornment";

const useStyles = makeStyles((theme) => ({
  weekdayContainer: {
    display: "flex",
    justifyContent: "center",
    marginBottom: theme.spacing(1),
  },
  weekdayCell: {
    p: 1,
    bgcolor: palette.dark.primary.contrastText,
    color: palette.dark.text.disabled,
  },
  calendarCell: {
    p: 1,
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    elevation: 1,
    bgcolor: palette.light.primary.contrastText,
    height: "100%",
    fontWeight: 600,
  },
  todayCell: {
    elevation: 4,
    bgcolor: palette.light.secondary.lighter,
  },
  disabledCell: {
    bgcolor: palette.dark.grey[200],
  },
  tpbrder: {
    border: `2px solid ${palette.light.text.border}`,
    borderRadius: "10px",
    color: palette.light.text.primary,
  },
  timeVal: {
    marginLeft: "18px",
  },
}));

export default function CalendarDaily({
  currentMonth,
  selectedStartDate,
  selectedEndDate,
  isChecked,
  setTwh,
  hoursByDate,
  handleHoursByDate,
  onFormattedDailyDataChange, // Receive the callback from parent
  weeklyview,
}) {
  const { translate } = useLocales();
  const classes = useStyles();
  const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const [calendarDays, setCalendarDays] = useState([]);
  const [hoursValues, sethoursValues] = useState(hoursByDate);

  useEffect(() => {
    const generatedDays = generateCalendarDays(
      currentMonth.getFullYear(),
      currentMonth.getMonth(),
      selectedStartDate,
      selectedEndDate
    );
    setCalendarDays(generatedDays);
  }, [currentMonth, weeklyview]);

  const handleTextBoxChange = (date, newValue) => {
    // Allow only digits 0 to 8
    newValue = newValue.replace(/[^0-8]/g, "");
    const newHoursByDate = hoursByDate.map((dateData) => {
      if (dateData.fullDate === date) {
        return {
          ...dateData,
          hours: newValue !== "" ? parseInt(newValue, 10) : "",
        }; // Update hours for the specific date
      }
      return dateData;
    });
    sethoursValues(newHoursByDate);
    handleHoursByDate(newHoursByDate);
  };
  const isDayDisabled = (day) => {
    return (
      day.isPreviousMonth || day.isNextMonth || day.isWeekend || day.isDisabled
    );
  };
  const generateDays = () => {
    return calendarDays.map((week, weekIndex) => (
      <Grid key={`week-${weekIndex}`} container spacing={3} mt={2}>
        {week.map((day, dayIndex, index) => (
          <Grid key={`day-${dayIndex}`} item xs>
            <Box
              className={`${classes.calendarCell} ${
                day.isWeekend ? classes.disabledCell : ""
              }`}
            >
              <Typography variant="subtitle1" align="center">
                {day.dayNumber}
              </Typography>
              <TextField
                key={day.dayNumber}
                className={classes.tpbrder}
                label=""
                type="numeric"
                variant="outlined"
                fullWidth
                disabled={isDayDisabled(day)}
                inputProps={{
                  inputMode: "numeric", // Specify input mode for numeric input
                  pattern: "[0-8]",
                  maxLength: 1,
                  max: 8,
                  className: `${classes.timeVal}`,
                }}
                InputProps={{
                  sx: {
                    backgroundColor:
                      day.isPreviousMonth ||
                      day.isNextMonth ||
                      day.isWeekend ||
                      day.isDisabled
                        ? palette.dark.grey[200]
                        : palette.light.primary.contrastText,
                    height: 40,
                    fontWeight: 600,
                    align: "center",
                  },
                  max: 8,
                  endAdornment: (
                    <InputAdornment position="end">
                      {day.isDisabled ||
                      day.isWeekend ||
                      day.isPreviousMonth ||
                      day.isNextMonth
                        ? ""
                        : ":00"}
                    </InputAdornment>
                  ),
                }}
                value={
                  day.isDisabled ||
                  day.isWeekend ||
                  day.isPreviousMonth ||
                  day.isNextMonth
                    ? ""
                    : hoursValues?.find(
                        (x) =>
                          x.fullDate === day.date.toLocaleString().split(",")[0]
                      )?.hours
                }
                onChange={(e) =>
                  handleTextBoxChange(
                    day.date.toLocaleString().split(",")[0],
                    e.target.value
                  )
                }
              />
            </Box>
          </Grid>
        ))}
      </Grid>
    ));
  };

  return (
    <Box my={3}>
      <Grid
        container
        spacing={2}
        alignItems="center"
        className={classes.weekdayContainer}
      >
        {days.map((day, index) => (
          <Grid key={index} item xs>
            <Box className={classes.weekdayCell}>
              <Typography variant="body1" align="center" color="textSecondary">
                {day}
              </Typography>
            </Box>
          </Grid>
        ))}
      </Grid>
      {generateDays()}
    </Box>
  );
}
