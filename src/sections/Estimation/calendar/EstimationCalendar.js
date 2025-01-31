import React, { useEffect, useState } from "react";
import {
  Box,
  Button,
  Grid,
  Stack,
  Typography,
  Checkbox,
  List,
  Divider,
  AccordionSummary,
  AccordionDetails,
  Accordion,
} from "@mui/material";
import {
  // InfoOutlined,
  ExpandMore as ExpandMoreIcon,
  CheckBoxOutlineBlankOutlined,
  // CheckBoxOutlined,
} from "@mui/icons-material";
import CalendarHeader from "../../Estimation/calendar/CalendarHeader";
import { makeStyles } from "@mui/styles";
import useLocales from "../../../hooks/useLocales";
import {
  // CheckBoxOutlineBlankOutlined,
  CheckBoxOutlined,
  InfoOutlined,
} from "@mui/icons-material";
import palette from "../../../theme/palette";
import CustomSlider from "../../../common/CustomSlider";
import CalendarDaily from "./CalendarDaily";
import { VIEW_TYPE, MONTH_LABELS } from "../../../utils/constants"; // Import constants
import {
  calculateWeekwiseDays,
  distributeHoursWithLimitsAndMinMax,
  calculateTotalWorkingHours,
  updateHoursByDate,
  generateDataForWeeks,
  generateInitialHoursByDate,
  generateMonthlyLabels,
  calculateTotalEstimatedHours,
  updatedHours,
} from "../../../utils/calendarUtils";
import TextField from "@mui/material/TextField";
import { converDateToDDMMYYY } from "../../../utils/formatTime";

const useStyles = makeStyles((theme) => ({
  modalContent: {
    padding: theme.spacing(0.5),
    top: "0",
    width: "100%", // Set the card width to 100% for responsiveness
    margin: "0 auto",
    [theme.breakpoints.down("sm")]: {},
  },
  totalHours: {
    display: "flex",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: "10px",
  },
  totalMrgn: {
    marginBottom: "10px",
  },
  totalBoxHours: {
    background: theme.palette.background.section,
    padding: "16px 8px",
    borderRadius: "4px",
  },
  totalHoursText: {
    marginRight: "10px",
    border: "2px",
    marginLeft: "10px",
  },
  checkboxContainer: {
    display: "flex",
    alignItems: "center",
    margin: "0",
    "& > *": {
      marginRight: theme.spacing(0.25),
      display: "flex",
      alignItems: "center",
    },
  },
  checkboxLabel: {
    marginRight: theme.spacing(1),
    color: palette.dark.grey[500],
    fontWeight: "500",
  },
  infoIcon: {
    marginRight: theme.spacing(1),
  },
  buttonContainer: {
    display: "flex",
    justifyContent: "flex-end",
    marginTop: theme.spacing(2),
  },
  ellipseIcon: {
    content: "''",
    width: "8px",
    height: "8px",
    borderRadius: "50%",
    marginRight: theme.spacing(0.5),
    backgroundColor: palette.dark.success.main,
    display: "inline-block",
  },
  smallTextField: {
    padding: "8px",
    width: "60px",
    marginLeft: "1px",
    fontWeight: "500",
    borderRadius: "4px",
    alignContent: "center",
  },
  infoContainer: {
    textAlign: "center",
    padding: "10px",
    border: `1px dashed var(--warning-light,${theme.palette.warning.light})`,
    borderRadius: "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: theme.spacing(3),
    background: `var(--warning-lighter,${theme.palette.warning.lighter})`,
  },
  infoIcon: {
    marginRight: theme.spacing(1),
  },
  tpbrder: {
    border: `2px solid ${palette.light.text.border}`,
    borderRadius: "10px",
    color: palette.light.text.primary,
  },
  submitBtn: {
    backgroundColor: palette.dark.secondary.activeBtn,
    color: palette.dark.primary.contrastText,
    "&:hover": {
      backgroundColor: palette.dark.secondary.main,
    },
  },
}));

export default function EstimationCalendar({
  setInitialDataDateWise,
  onCancel,
  selectedStartDate,
  selectedEndDate,
  isChecked,
  onEstimatePopupSubmit,
  hoursByDateParent,
  checkboxtype,
}) {
  const { translate } = useLocales();
  const styles = useStyles();

  const [selectedCheckboxes, setSelectedCheckboxes] = useState([]);
  const [viewType, setViewType] = useState(VIEW_TYPE.WEEKLY); // Default view

  const [currentMonth, setCurrentMonth] = useState(new Date(selectedStartDate));
  const [isMonthlyView, setIsMonthlyView] = useState(false);
  const [isWeeklyView, setIsWeeklyView] = useState(false);
  const [sliderItemsWeekly, setSliderItemsWeekly] = useState([]);

  const [sliderItemsMonthly, setSliderItemsMonthly] = useState([]);
  const [monthlyData, setMonthlyData] = useState([]);

  const [currentYear, setCurrentYear] = useState(new Date(selectedStartDate));
  const [hoursByDate, setHoursByDate] = useState(hoursByDateParent);

  const [selectedItems, setSelectedItems] = useState([]);

  const [twh, setTwh] = useState();

  const [totalAvailbleHours, setTotalAvailbleHours] = useState(0);
  const [totalEstimatedHours, setTotalEstimatedHours] = useState(0);
  const [errorMessage, setErrorMessage] = useState("");
  const [maxTotalHoursPerMonth, setMaxTotalHoursPerMonth] = useState(0);
  const [maxTotalHoursPerWeeks, setMaxTotalHoursPerWeeks] = useState(0);
  const [selectAllChecked, setSelectAllChecked] = useState(false);
  const [minHoursPerWeek, setMinHoursPerWeek] = useState(0);
  const [maxHoursPerWeek, setMaxHoursPerWeek] = useState(0);
  const [minHoursPerMonth, setMinHoursPerMonth] = useState(0);
  const [maxHoursPerMonth, setMaxHoursPerMonth] = useState(0);
  const [minHoursPerDay, setMinHoursPerDay] = useState(0);

  const [maxHoursPerDay, setMaxHoursPerDay] = useState(0);
  const [minValue, setMinValue] = useState(0);
  const [maxValue, setMaxValue] = useState(0);
  const [minError, setMinError] = useState(false);
  const [MaxError, setMaxError] = useState(false);
  const [dailyError, setDailyError] = useState("");
  const [weeklyerrorMessage, setWeeklyErrorMessage] = useState("");
  const [minHoursInputtedMonthly, setMinHoursInputtedMonthly] = useState(null);
  const [minHoursInputtedWeekly, setMinHoursInputtedWeekly] = useState(null);
  const [maxHoursInputtedMonthly, setMaxHoursInputtedMonthly] = useState(null);
  const [maxHoursInputtedWeekly, setMaxHoursInputtedWeekly] = useState(null);

  const [minHoursChange, setMinHoursChange] = useState(0);
  const handleViewChange = (newViewType) => {
    setViewType(newViewType);
    setIsMonthlyView(newViewType === VIEW_TYPE.MONTHLY);
    setIsWeeklyView(newViewType === VIEW_TYPE.WEEKLY);
    setSelectedCheckboxes([]);
    setSelectAllChecked(false);
  };
  useEffect(() => {
    if (viewType === VIEW_TYPE.WEEKLY) {
      setIsWeeklyView(viewType === VIEW_TYPE.WEEKLY);
    }
    setViewType(viewType);
  }, []);
  useEffect(() => {
    if (!isWeeklyView) {
      setWeeklyErrorMessage("");
    }
  }, [isWeeklyView]);
  const handleHoursByDate = (data) => {
    setHoursByDate(data);
    setInitialDataDateWise(data);
  };
  const handleCheckboxChange = (e, index, item) => {
    const updatedSelectedCheckboxes = [...selectedCheckboxes];
    const sliderItems = isMonthlyView ? sliderItemsMonthly : sliderItemsWeekly;

    if (index === -1) {
      // Handling the "Select All" checkbox
      setSelectAllChecked(e.target.checked);
      updatedSelectedCheckboxes.splice(0, updatedSelectedCheckboxes.length);

      if (e.target.checked) {
        // If "Select All" is checked, select all other checkboxes
        sliderItems.forEach((_, i) => updatedSelectedCheckboxes.push(i));
        setSelectedItems(sliderItems); // Add all items to selectedItems
      } else {
        setSelectedItems([]); // Remove all items from selectedItems
      }
    } else {
      // If an individual checkbox is checked, add it to the list; if unchecked, remove it
      if (e.target.checked) {
        updatedSelectedCheckboxes.push(index);
        setSelectedItems([...selectedItems, item]);
      } else {
        const indexToRemove = updatedSelectedCheckboxes.indexOf(index);
        if (indexToRemove !== -1) {
          updatedSelectedCheckboxes.splice(indexToRemove, 1);
          setSelectedItems(
            selectedItems.filter((selectedItem) => selectedItem !== item)
          );
        }
      }

      // Update "Select All" checkbox based on whether all individual checkboxes are checked
      const isAllChecked =
        updatedSelectedCheckboxes.length === sliderItems.length;
      setSelectAllChecked(isAllChecked);
    }

    setSelectedCheckboxes(updatedSelectedCheckboxes);
  };

  const handlePrev = () => {
    if (viewType === VIEW_TYPE.MONTHLY) {
      const prevYear = new Date(currentYear);
      prevYear.setFullYear(prevYear.getFullYear() - 1);
      setCurrentYear(prevYear);
    } else {
      const prevMonth = new Date(currentMonth);
      prevMonth.setMonth(prevMonth.getMonth() - 1);
      setCurrentMonth(prevMonth);
    }
  };

  const handleNext = () => {
    if (viewType === VIEW_TYPE.MONTHLY) {
      const nextYear = new Date(currentYear);
      nextYear.setFullYear(nextYear.getFullYear() + 1);
      setCurrentYear(nextYear);
    } else {
      const nextMonth = new Date(currentMonth);
      nextMonth.setMonth(nextMonth.getMonth() + 1);
      setCurrentMonth(nextMonth);
    }
  };

  //initalise hours by date- gloabl object
  useEffect(() => {
    const initialHoursByDate = generateInitialHoursByDate(
      new Date(selectedStartDate),
      new Date(selectedEndDate),
      isChecked,
      hoursByDate,
      checkboxtype
    );
    setHoursByDate(initialHoursByDate);
    setInitialDataDateWise(initialHoursByDate);
  }, []);

  // To update total hours
  useEffect(() => {
    // Always calculate monthly labels
    const monthLabels = generateMonthlyLabels(
      new Date(selectedStartDate),
      new Date(selectedEndDate),
      currentYear,
      hoursByDate,
      checkboxtype
    );

    // Set monthly data regardless of the view
    const monthlyDataFormatted = monthLabels.months.map((item) => {
      return {
        month: item.month,
        hours: item.hours,
      };
    });

    setMonthlyData(monthlyDataFormatted);
    const maxHours = monthLabels?.totalHours || 0;
    setMaxTotalHoursPerMonth(maxHours); // Set total hours for monthly

    if (isMonthlyView) {
      // If it's the monthly view, set slider items for monthly
      setSliderItemsMonthly(monthLabels.months);
      setTwh(maxHours); // Set total working hours for monthly view
    } else {
      // If it's the weekly view, calculate weekwise data
      const weekwiseData = calculateWeekwiseDays(
        selectedStartDate,
        selectedEndDate,
        currentMonth,
        hoursByDate
      );

      const weeklyMaxHours = weekwiseData.reduce(
        (total, entry) => total + entry,
        0
      );
      setTwh(weeklyMaxHours); // Set total working hours for weekly view
      const weeklyLabels = generateDataForWeeks(
        weekwiseData,
        currentMonth,
        selectedStartDate,
        selectedEndDate,
        checkboxtype
      );
      setMaxTotalHoursPerWeeks(weeklyMaxHours);
      setSliderItemsWeekly(weeklyLabels); // Set weekly slider items
    }
  }, [
    hoursByDate,
    selectedStartDate,
    selectedEndDate,
    isChecked,
    currentYear,
    currentMonth,
    isMonthlyView,
    isWeeklyView,
  ]);

  useEffect(() => {
    const totalAvailHours = calculateTotalWorkingHours(
      selectedStartDate,
      selectedEndDate
    );
    setTotalAvailbleHours(totalAvailHours || 0);
    const totalEstimatedHours = calculateTotalEstimatedHours(hoursByDate);
    setTotalEstimatedHours(totalEstimatedHours || 0);
  }, [hoursByDate]);

  useEffect(() => {
    if (isMonthlyView) {
      const monthLabels = generateMonthlyLabels(
        selectedStartDate,
        selectedEndDate,
        currentYear,
        hoursByDate,
        checkboxtype
      );
      const maxHoursArray = monthLabels?.months?.map((item) => item.maxHours);
      const minValue = Math.min(...maxHoursArray);
      const maxValue = Math.max(...maxHoursArray);

      // Use the inputted value if it exists, else fall back to calculated min value
      setMinHoursPerMonth(minHoursInputtedMonthly ?? minValue);
      setMaxHoursPerMonth(maxHoursInputtedMonthly ?? maxValue);
      setMinValue(minValue);
      setMaxValue(maxValue);
    } else if (isWeeklyView) {
      const weekwiseData = calculateWeekwiseDays(
        selectedStartDate,
        selectedEndDate,
        currentMonth,
        hoursByDate
      );
      const weeklyLabels = generateDataForWeeks(
        weekwiseData,
        currentMonth,
        selectedStartDate,
        selectedEndDate,
        checkboxtype
      );
      const maxHoursArray = weeklyLabels?.map((item) => item.maxHours);
      const minValue = Math.min(...maxHoursArray);
      const maxValue = Math.max(...maxHoursArray);

      // Use the inputted value if it exists, else fall back to calculated min value
      setMinHoursPerWeek(minHoursInputtedWeekly ?? minValue);
      setMaxHoursPerWeek(maxHoursInputtedWeekly ?? maxValue);
      setMinValue(minValue);
      setMaxValue(maxValue);
    } else {
      setMinHoursPerDay(0);
      setMaxHoursPerDay(8);
      setMinValue(0);
      setMaxValue(8);
    }
  }, [
    isMonthlyView,
    isWeeklyView,
    minHoursInputtedMonthly,
    minHoursInputtedWeekly,
    maxHoursInputtedMonthly,
    maxHoursInputtedWeekly,
  ]);
  const [expanded, setExpanded] = useState(true); // Initially open

  const handleAccordionToggle = () => {
    setExpanded(!expanded); // Toggle the accordion state
  };

  const renderSlider = () => {
    const sliderItems = isMonthlyView ? sliderItemsMonthly : sliderItemsWeekly;
    return (
      <CustomSlider
        hoursByDate={hoursByDate}
        handleHoursByDate={handleHoursByDate}
        sliderItems={sliderItems}
        isMonthlyView={isMonthlyView}
        isChecked={isChecked}
        setTwh={setTwh}
        checkboxtype={checkboxtype}
      />
    );
  };

  const OnSplitHrs = () => {
    if (!Array.isArray(hoursByDate)) {
      console.error("Error: hoursByDate must be an array.");
      return;
    }

    let minHours, maxHours;
    let updatedHoursByDate = hoursByDate;

    if (isMonthlyView) {
      minHours = parseInt(minHoursPerMonth);
      maxHours = parseInt(maxHoursPerMonth);
      const monthlyLimits = selectedItems.map((x) => x.maxHours);
      const setMonthlyErrorMessage = (unset = false) => {
        if (unset) {
          setWeeklyErrorMessage("");
        } else {
          setWeeklyErrorMessage(
            `Cannot distribute ${twh} total hours across the selected days with the given min and max limits (${minHours}-${maxHours} hrs/month).`
          );
        }
      };

      const distHours = distributeHoursWithLimitsAndMinMax(
        parseInt(twh),
        monthlyLimits,
        minHours,
        maxHours,
        setMonthlyErrorMessage
      );

      selectedItems?.forEach((item, index) => {
        updatedHoursByDate = updateHoursByDate(
          isMonthlyView,
          item,
          distHours[index],
          updatedHoursByDate,
          checkboxtype
        );
      });
    } else if (isWeeklyView) {
      minHours = parseInt(minHoursPerWeek);
      maxHours = parseInt(maxHoursPerWeek);
      const weeklyLimits = selectedItems.map((x) => x.maxHours);
      const setWeeklyErrorMessageFunction = () => {
        setWeeklyErrorMessage(
          `Cannot distribute ${twh} total hours across the selected days with the given min and max limits (${minHours}-${maxHours} hrs/week).`
        );
      };

      const distHours = distributeHoursWithLimitsAndMinMax(
        parseInt(twh),
        weeklyLimits,
        minHours,
        maxHours,
        setWeeklyErrorMessageFunction
      );

      selectedItems.forEach((item, index) => {
        updatedHoursByDate = updateHoursByDate(
          isMonthlyView,
          item,
          distHours[index],
          hoursByDate,
          checkboxtype
        );
      });
    } else {
      minHours = parseInt(minHoursPerDay);
      maxHours = parseInt(maxHoursPerDay);
      const dayObj = {
        year: currentYear.getFullYear(),
        month: currentMonth.getMonth() + 1,
        isDay: true,
        minHours: minHoursPerDay,
        maxHours: maxHoursPerDay,
      };

      updatedHoursByDate = updateHoursByDate(
        true,
        dayObj,
        twh,
        hoursByDate,
        checkboxtype
      );

      if (updatedHoursByDate == null) {
        setDailyError(
          `Cannot distribute ${twh} total hours across the selected days with the given min and max limits (${minHoursPerDay}-${maxHoursPerDay} hrs/day).`
        );
      }
    }

    if (updatedHoursByDate != null) handleHoursByDate(updatedHoursByDate);
  };
  const handleTotalHoursChange = (val) => {
    let newValue = parseInt(val);

    if (newValue > totalAvailbleHours) {
      setErrorMessage(
        `Please enter a value less than or equal to ${totalAvailbleHours}.`
      );
    } else {
      setErrorMessage("");
      setTwh(newValue);
    }
  };

  const handleMinHours = (newValue, isDay) => {
    let val = parseInt(newValue);

    if (isDay) {
      if (val > 8) {
        setMinError(true);
        setMinHoursChange(minValue);
      } else {
        setMinError(false);
        setMinHoursChange(val);
      }
    } else {
      if (val > minValue) {
        setMinError(true);
        setMinHoursChange(minValue);
      } else {
        setMinError(false);
        setMinHoursChange(val);
      }
    }

    if (isMonthlyView) {
      setMinHoursPerMonth(val);
      setMinHoursInputtedMonthly(val); // Store the inputted value for monthly view
    } else if (isWeeklyView) {
      setMinHoursPerWeek(val);
      setMinHoursInputtedWeekly(val); // Store the inputted value for weekly view
    } else {
      setMinHoursPerDay(val);
    }
  };

  const handleMaxHours = (newValue) => {
    let val = parseInt(newValue);
    let minValueChange = isMonthlyView
      ? minHoursPerMonth
      : isWeeklyView
      ? minHoursPerWeek
      : minHoursPerDay;

    if (val <= maxValue) {
      if (
        minValueChange <= maxValue &&
        val >= minHoursChange &&
        maxValue >= val
      ) {
        setMaxError(false);
      } else {
        setMaxError(true);
      }
    } else if (val > maxValue) {
      val = maxValue;
      setMaxError(false);
    }

    if (isMonthlyView) {
      setMaxHoursPerMonth(val);
      setMaxHoursInputtedMonthly(val);
    } else if (isWeeklyView) {
      setMaxHoursPerWeek(val);
      setMaxHoursInputtedWeekly(val);
    } else {
      setMaxHoursPerDay(val);
    }
  };
  const [formattedDailyData, setFormattedDailyData] = useState([]);

  // Callback function to update the state from the child
  const handleFormattedDailyData = (data) => {
    if (!data) {
      console.error("Data is undefined or null");
      return;
    }
    const dateArr = converDateToDDMMYYY(data);
    setFormattedDailyData(dateArr);
  };

  useEffect(() => {
    const newFormattedDailyData = hoursByDate?.map((entry) => ({
      date: entry.fullDate,
      hours: entry.hours,
    }));
    console.log("newFormattedDailyData", JSON.stringify(newFormattedDailyData));
    handleFormattedDailyData(newFormattedDailyData);
  }, [hoursByDate, isWeeklyView]);
  const [transformedData, setTransformedData] = useState({});

  const [previousWeeklyData, setPreviousWeeklyData] = useState([]);

  // Function to convert month number to month name
  const getMonthName = (monthNumber) => {
    const months = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    return months[monthNumber - 1];
  };

  useEffect(() => {
    // Convert sliderItemsWeekly to the desired format
    const newWeeklyData = sliderItemsWeekly.map((item) => ({
      week: item.number,
      hours: item.hours,
    }));

    // Combine new and old weekly data, removing duplicates
    const combinedWeeklyData = [...previousWeeklyData, ...newWeeklyData].reduce(
      (acc, current) => {
        const existing = acc.find(
          (item) => item.month === current.month && item.week === current.week
        );
        if (existing) {
          existing.hours = current.hours; // Update hours if already exists
        } else {
          acc.push(current); // Add new data
        }
        return acc;
      },
      []
    );

    setTransformedData((prevState) => ({
      ...prevState,
      monthly: isMonthlyView
        ? sliderItemsMonthly.map((item) => ({
            month: item.month,
            hours: item.hours,
          }))
        : monthlyData,

      weekly: combinedWeeklyData,
      daily: formattedDailyData,
    }));

    // Update previousWeeklyData state
    setPreviousWeeklyData(combinedWeeklyData);
  }, [
    sliderItemsMonthly,
    sliderItemsWeekly,
    hoursByDate,
    isMonthlyView,
    isWeeklyView,
  ]);
  useEffect(() => {
    if (viewType !== "daily") {
      setDailyError("");
    }
  }, [viewType]); // Correct dependency
  const renderTotalHours = () => (
    <Accordion expanded={expanded} onChange={handleAccordionToggle}>
      <AccordionSummary
        expandIcon={<ExpandMoreIcon />}
        aria-controls="panel1a-content"
        id="panel1a-header"
      >
        <Typography variant="subtitle1" className={styles.totalHoursText}>
          Split Hours
        </Typography>
        <InfoOutlined className={styles.infoIcon} />
      </AccordionSummary>
      <AccordionDetails>
        <div className={styles.totalBoxHours}>
          {isMonthlyView && errorMessage && (
            <Typography
              sx={{ marginBottom: "11px" }}
              variant="subtitle2"
              color="error"
              className={styles.errorMessage}
            >
              {errorMessage}
            </Typography>
          )}
          {viewType === "daily" && dailyError && (
            <Typography
              sx={{ marginBottom: "11px" }}
              variant="subtitle2"
              color="error"
              className={styles.errorMessage}
            >
              {dailyError}
            </Typography>
          )}
          {viewType === "weekly" ||
            (viewType === "monthly" && weeklyerrorMessage && (
              <Typography
                sx={{ marginBottom: "11px" }}
                variant="subtitle2"
                color="error"
                className={styles.errorMessage}
              >
                {weeklyerrorMessage}
              </Typography>
            ))}
          <Box className={styles.totalHours}>
            <Stack direction="row" alignItems="center">
              <Typography variant="subtitle1" className={styles.totalHoursText}>
                Split Hours*
              </Typography>
              <div className={styles.inputContainer}>
                <TextField
                  inputProps={{
                    className: styles.smallTextField,
                    inputMode: "numeric",
                    pattern: "[0-9]*",
                    maxLength: 4,
                  }}
                  type="number"
                  value={twh}
                  onChange={(e) => {
                    handleTotalHoursChange(e.target.value);
                  }}
                  aria-labelledby={`input-slider`}
                  label={twh ? twh : "0"}
                />
              </div>
              <Typography variant="subtitle1" className={styles.totalHoursText}>
                {isMonthlyView
                  ? "Min hrs/month"
                  : isWeeklyView
                  ? "Min hrs/week"
                  : "Min hrs/day"}
              </Typography>
              <TextField
                inputProps={{
                  className: styles.smallTextField,
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                  maxLength: 4,
                }}
                type="number"
                value={
                  isWeeklyView
                    ? minHoursPerWeek
                    : isMonthlyView
                    ? minHoursPerMonth
                    : minHoursPerDay
                }
                aria-labelledby={`input-slider`}
                onChange={(e) => {
                  handleMinHours(
                    e.target.value,
                    !(isMonthlyView || isWeeklyView)
                  );
                }}
                error={minError}
                label={
                  isMonthlyView || isWeeklyView ? "0" + "-" + minValue : "0-8"
                }
              />
              <Typography variant="subtitle1" className={styles.totalHoursText}>
                {isMonthlyView
                  ? "Max hrs/month"
                  : isWeeklyView
                  ? "Max hrs/week"
                  : "Max hrs/day"}
              </Typography>
              <TextField
                className={styles.tpbrder}
                inputProps={{
                  className: styles.smallTextField,
                  inputMode: "numeric",
                  pattern: "[0-9]*",
                  maxLength: 4,
                }}
                type="number"
                value={
                  isWeeklyView
                    ? maxHoursPerWeek
                    : isMonthlyView
                    ? maxHoursPerMonth
                    : maxHoursPerDay
                }
                aria-labelledby={`input-slider`}
                onChange={(e) => {
                  handleMaxHours(e.target.value);
                }}
                error={MaxError}
                label={minHoursChange + "-" + maxValue}
              />
            </Stack>
            <Button
              variant="contained"
              color="primary"
              className={selectedItems?.length > 1 && styles.submitBtn}
              onClick={OnSplitHrs}
              disabled={
                !(
                  (
                    (viewType === VIEW_TYPE.DAILY &&
                      (selectedItems?.length > 1 || minHoursPerDay > 0)) || // Enable for daily view
                    (viewType === VIEW_TYPE.WEEKLY &&
                      selectedItems?.length > 1) || // Enable for weekly view
                    (viewType === VIEW_TYPE.MONTHLY &&
                      selectedItems?.length > 1)
                  ) // Enable for monthly view
                )
              }
              sx={{ bgcolor: "#8056F7" }}
            >
              {translate("EstimationCalendar.SPLIT_HOURS")}
            </Button>
          </Box>
          {(viewType === VIEW_TYPE.WEEKLY ||
            viewType === VIEW_TYPE.MONTHLY) && (
            <Stack>
              <Box className={styles.checkboxContainer}>
                <Box
                  display="flex"
                  flexWrap="wrap"
                  gap={1}
                  justifyContent="flex-start"
                  sx={{
                    width: "100%",
                    padding: 1,
                    boxSizing: "border-box",
                  }}
                >
                  <Box display="flex" alignItems="center" gap={1}>
                    <Checkbox
                      icon={<CheckBoxOutlineBlankOutlined />}
                      checkedIcon={<CheckBoxOutlined />}
                      checked={selectAllChecked}
                      onChange={(e) => handleCheckboxChange(e, -1, null)}
                    />
                    <Typography
                      variant="body2"
                      className={styles.checkboxLabel}
                    >
                      Select All
                    </Typography>
                  </Box>
                  {(isMonthlyView
                    ? sliderItemsMonthly
                    : sliderItemsWeekly
                  )?.map((item, index) => (
                    <Box
                      key={item.number}
                      display="flex"
                      alignItems="flex-start"
                      minWidth="80px"
                    >
                      <Checkbox
                        icon={<CheckBoxOutlineBlankOutlined />}
                        checkedIcon={<CheckBoxOutlined />}
                        checked={selectedCheckboxes.includes(index)}
                        onChange={(e) => handleCheckboxChange(e, index, item)}
                      />
                      <Typography
                        variant="body2"
                        className={styles.checkboxLabel}
                        sx={{ marginTop: "7px" }}
                      >
                        {item.label}
                      </Typography>
                    </Box>
                  ))}
                </Box>
              </Box>
            </Stack>
          )}
        </div>
      </AccordionDetails>
    </Accordion>
  );

  const renderSummary = () => (
    <Grid container alignItems="center">
      <Grid item xs={6}>
        <List>
          <Typography variant="body2">
            <span className={styles.ellipseIcon}></span>
            {translate("EstimationCalendar.TOTAL_AVAIL_HOURS")}:{" "}
            {totalAvailbleHours} Hrs
          </Typography>
          <Typography variant="body2">
            <span className={styles.ellipseIcon}></span>
            {translate("EstimationCalendar.TOTAL_ESTIMATED_HOURS")}:{" "}
            {totalEstimatedHours} Hrs
          </Typography>
        </List>
      </Grid>
      <Grid item xs={6}>
        <Box className={styles.buttonContainer}>
          <Stack direction="row" spacing={2}>
            <Button variant="outlined" color="primary" onClick={onCancel}>
              {translate("cancel")}
            </Button>
            <Button
              variant="contained"
              color="primary"
              className={styles.submitBtn}
              onClick={() => {
                onEstimatePopupSubmit(
                  totalEstimatedHours,
                  hoursByDate,
                  totalAvailbleHours,
                  transformedData
                );
              }}
            >
              {translate("submit")}
            </Button>
          </Stack>
        </Box>
      </Grid>
    </Grid>
  );

  const renderCalendarContent = () => {
    switch (viewType) {
      case VIEW_TYPE.WEEKLY:
      case VIEW_TYPE.MONTHLY:
        return (
          <>
            {renderTotalHours()}
            {renderSlider()}
            {renderSummary()}
          </>
        );
      case VIEW_TYPE.DAILY:
        return (
          <>
            <Divider />
            <Box className={styles.infoContainer} my={3}>
              <Stack direction="row" alignItems="center">
                <InfoOutlined color="warning" className={styles.infoIcon} />
                <Typography variant="subtitle2">
                  {translate("EstimationCalendar.HOURS_NOTIFICATION")}
                </Typography>
              </Stack>
            </Box>
            <Divider />
            {renderTotalHours()}
            <CalendarDaily
              handleHoursByDate={handleHoursByDate}
              hoursByDate={hoursByDate}
              currentYear={currentYear}
              currentMonth={currentMonth}
              selectedStartDate={selectedStartDate}
              selectedEndDate={selectedEndDate}
              isChecked={isChecked}
              setTwh={setTwh}
              weeklyview={isWeeklyView}
              // hoursValues={hoursValues}
              // sethoursValues={sethoursValues}
            />
            {renderSummary()}
          </>
        );
      default:
        return null;
    }
  };

  return (
    <Box className={styles.modalContent}>
      <CalendarHeader
        onViewChange={handleViewChange}
        currentYear={currentYear}
        currentMonth={currentMonth}
        onPrev={handlePrev}
        onNext={handleNext}
        activeViewType={viewType}
        selectedStartDate={selectedStartDate}
        selectedEndDate={selectedEndDate}
      />
      {renderCalendarContent()}
    </Box>
  );
}
