import React, { useEffect, useState } from "react";
import Slider from "@mui/material/Slider";
import { makeStyles } from "@mui/styles";
import Typography from "@mui/material/Typography";
import Box from "@mui/material/Box";
import palette from "../theme/palette";
import { Grid, Tooltip } from "@mui/material";
import TextField from "@mui/material/TextField";
import {
  calculateTotalHours,
  updateHoursByDate,
  calculateMarks,
} from "../utils/calendarUtils";
import useLocales from "../hooks/useLocales";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  sliderContainer: {
    display: "flex",
    padding: "25px 10px",
    justifyContent: "space-between",
  },
  customSxSlider: {
    marginBottom: 0,
    "& .MuiSlider-track": {
      background: palette.light.secondary.activeBtn,
    },
    "& .MuiSlider-rail": {
      position: "relative",
      background: palette.light.background.slider,
      opacity: 1,
      "&::before": {
        content: "'NA'",
        position: "absolute",
        top: "50%",
        left: "50%",
        transform: "translate(-50%, -50%)",
        color: palette.light.text.light,
        fontWeight: "bold",
        fontSize: "10px",
      },
    },
  },
  slider: {
    color: palette.light.secondary.light,
    height: 8,
    "& .MuiSlider-track": {
      border: "none",
    },
    "& .MuiSlider-thumb": {
      height: 24,
      width: 24,
      backgroundColor: palette.dark.primary.contrastText,
      border: "2px solid currentColor",
      "&:focus, &:hover, &.Mui-active, &.Mui-focusVisible": {
        boxShadow: "inherit",
      },
      "&:before": {
        display: "none",
      },
    },
  },
  smallTextField: {
    padding: "8px",
    width: "60px",
    marginLeft: "1px",
    fontWeight: "500",
    borderRadius: "4px",
    alignContent: "center",
  },
  tpbrder: {
    border: `2px solid ${palette.light.text.border}`,
    borderRadius: "10px",
    color: palette.light.text.primary,
  },
}));

export default function CustomSlider({
  sliderItems,
  isMonthlyView,
  isChecked,
  setTwh,
  hoursByDate,
  handleHoursByDate,
  checkboxtype
}) {
  const { translate } = useLocales();
  const classes = useStyles();
  const [data, setData] = useState(sliderItems);

  useEffect(() => {
    setData(sliderItems);
  }, [sliderItems]);

  const marks = calculateMarks(isMonthlyView,checkboxtype);

  const handleValueChange = (obj, newValue) => {
    newValue = parseInt(newValue);
    const maxHours = obj.maxHours;
    // Ensure the newValue does not exceed maxHours
    if (newValue > maxHours) {
      newValue = maxHours;
    }
    // Update the state based on whether it's monthly or weekly
    const newData = data.map((item) => {
      if (isMonthlyView) {
        // For monthly view, check by comparing month and year
        return item.month === obj.month && item.year === obj.year
          ? { ...item, hours: newValue }
          : item;
      } else {
        // For weekly view, check by comparing number, month, and year
        return item.number === obj.number &&
          item.month === obj.month &&
          item.year === obj.year
          ? { ...item, hours: newValue }
          : item;
      }
    });
    setData(newData);
    const updatedValue = newValue || 0;
    const updatedHoursByDate = updateHoursByDate(
      isMonthlyView,
      obj,
      updatedValue,
      hoursByDate
    );
    handleHoursByDate(updatedHoursByDate);
    const newTotalHours = calculateTotalHours(newData);
    setTwh(newTotalHours);
  };

  return (
    <Box className={classes.root}>
      {data?.map((item, index) => {
        const remainingHours = item.maxHours - item.hours;
        return (
          <Grid
            key={index}
            container
            spacing={5}
            alignItems="center"
            className={classes.sliderContainer}
          >
            <Grid item>
              <Typography>
                {isMonthlyView ? item.label : item.weekLabel}
              </Typography>
            </Grid>
            <Grid item xs key={index}>
              <Slider
                value={item.hours}
                onChange={(e, newValue) => handleValueChange(item, newValue)}
                valueLabelDisplay="auto"
                className={classes.slider}
                sx={classes.customSxSlider}
                min={0}
                max={isMonthlyView ? 200 : 40}
                marks={marks}
                valueLabelFormat={
                  item.hours + translate("EstimationCalendar.HOURS")
                }
              />
            </Grid>
            <Grid item>
              <Tooltip title={`Remaining: ${remainingHours} hrs`} arrow>
                <TextField
                  size="small"
                  fullWidth
                  inputProps={{
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                    min: 0,
                    max: item.maxHours ? item.maxHours : 0,
                  }}
                  type="number"
                  value={item.hours ? item.hours : "0"}
                  onChange={(e) => handleValueChange(item, e.target.value)}
                  aria-labelledby={`input-slider-${index}`}
                  InputProps={{
                    sx: {
                      height: 40,
                    },
                  }}
                  label={"0" + "-" + item.maxHours}
                />
              </Tooltip>
            </Grid>
          </Grid>
        );
      })}
    </Box>
  );
}
