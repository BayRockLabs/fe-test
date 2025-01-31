import * as React from "react";
import MenuItem from "@mui/material/MenuItem";
import {
  Box,
  Checkbox,
  FormControl,
  FormControlLabel,
  Grid,
  IconButton,
  InputAdornment,
  Radio,
  RadioGroup,
  Stack,
  Typography,
} from "@mui/material";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import DateRangeIcon from "@mui/icons-material/DateRange";

import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import TextField from "@mui/material/TextField";

import { useState, useEffect } from "react";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";

import Button from "@mui/material/Button";
import Autocomplete from "@mui/material/Autocomplete";
import { displayError } from "../../utils/handleErrors";
import { useSnackbar } from "notistack";
import ResourceTable, { createAddResourceData } from "./ResourceTable";

import {
  calculateTotalWorkingHours,
  generateInitialHoursByDate,
  generateTimeData,
  getHoursWithoutWeekends,
} from "../../utils/calendarUtils";
import { createStyles, useTheme, makeStyles } from "@mui/styles";
import Dialog from "@mui/material/Dialog";
import DialogContent from "@mui/material/DialogContent";
import EstimationCalendar from "./calendar/EstimationCalendar";
import useLocales from "../../hooks/useLocales";
import CreateEstimation from "./CreateEstimation";
import {
  CheckBoxOutlineBlankOutlined,
  CheckBoxOutlined,
  Edit,
} from "@mui/icons-material";
import useClient from "../../hooks/useClient";
import PayRateAPI from "../../services/PayRateService";
import { fCurrency } from "../../utils/formatNumber";
import MandatoryTextField from "../../pages/MandatoryTextField";
import { anchorOrigin } from "../../utils/constants";
import { isValid } from "date-fns";
import MultipleSelectCheckmarks from "../../components/MultipleSelectCheckmarks";

const classesStyles = makeStyles((theme) => ({
  CheckBoxMrgn: {
    // marginTop: "37px !important",
    width: "100% ",
  },
  checkboxAndLabel: {
    display: "flex ",
    alignItems: "center ",
  },
  checkbox_estimation: {
    marginRight: "0px ",
    paddingLeft: "0px ",
    paddingRight: "0px ",
  },
}));

function AddEstimationForm({
  detailData,
  resourceTableData,
  handleClose,
  onEstimationAdded,
}) {
  const isEditMode = detailData ? true : false;
  const theme = useTheme();
  const styles = useStyles(theme);
  const classes = classesStyles();
  const { translate } = useLocales();
  const axiosPrivate = useAxiosPrivate();
  const { enqueueSnackbar } = useSnackbar();
  const { selectedClient } = useClient();

  const [selectedResource, setSelectedResource] = useState("");
  const [selectedRegion, setSelectedRegion] = useState("");
  const [selectedSkill, setSelectedSkill] = useState([]);
  const [selectedPayRate, setSelectedPayRate] = useState("");
  const [selectedPayRateItem, setSelectedPayRateItem] = useState({});
  const [selectedBillAllocation, setSelectedBillAllocation] = useState("");

  const [estimatedHourHint, setEstimatedHourHint] = useState(null);
  const [selectedStartDate, setSelectedStartDate] = useState(null);
  const [selectedEndDate, setSelectedEndDate] = useState(null);
  const [selectedEstimationName, setSelectedEstimationName] = useState(
    detailData?.name ?? ""
  );
  const [selectedExperience, setSelectedExperience] = useState("");
  const [billingName, setBillingName] = useState(
    detailData?.billing ?? "Enterprise"
  );
  const [billableOrNonBillable, setBillableOrNonBillable] = useState("");
  const focusEstimationNameInputRef = React.useRef(null); // Create a ref
  const [payRateMap, setPayRateMap] = useState({});
  const [resourceList, setResourceList] = useState([]);
  const [InitialDataDateWise, setInitialDataDateWise] = useState([]);
  const [skillOption, setSkillOption] = useState([]);
  const [regionOption, setRegionOption] = useState([]);
  const [costHrs, setCostHrs] = useState("");
  const [estimationData, setEstimationData] = useState();
  const [isEstimationHoursModalOpen, setEstimationHoursModalOpen] =
    useState(false); // State to control the modal

  const [tableData, setTableData] = useState(resourceTableData ?? []);
  const [isFullTimeChecked, setIsFullTimeChecked] = useState(false);
  const [isCheckBoxSelected, setIsCheckBoxSelected] = useState(false);
  const [isHalfTimeChecked, setIsHalfTimeChecked] = useState(false);
  const [is25PercentTimeChecked, setIs25PercentTimeChecked] = useState(false);
  const [is75PercentTimeChecked, setIs75PercentTimeChecked] = useState(false);
  const [numOfResources, setNumOfResources] = useState("");
  const resourceOptions = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
  const [checkboxtype, setCheckbox] = useState("");

  const timeData = generateTimeData(
    selectedStartDate,
    selectedEndDate,
    isFullTimeChecked,
    isHalfTimeChecked,
    is25PercentTimeChecked,
    is75PercentTimeChecked
  );

  const totalAvailHours = calculateTotalWorkingHours(
    selectedStartDate,
    selectedEndDate
  );
  const handleChange = (event) => {
    const value = event.target.value;
    setNumOfResources(value);
  };
  const [isEditItemDeleted, setEditItemDeleted] = useState(false);
  const [hoursByDate, setHoursByDate] = useState([]);

  const { uuid, name } = selectedClient || {};
  const [formDisabled, setFormDisabled] = useState(true);
  const [filteredResourceList, setFilteredResourceList] = useState([]);
  const [isDateValid, setIsDateValid] = useState(false);

  const handleDeleteRow = (position) => {
    // Prevent deleting the last remaining record
    if (tableData.length === 1) {
      enqueueSnackbar("You must have at least one record in the table.", {
        variant: "warning",
        anchorOrigin,
      });
      return; // Exit the function to prevent deletion
    }

    // Proceed with deleting the record if there's more than one record
    const updatedItems = tableData.filter((_, index) => index !== position);
    setTableData(updatedItems);
    setEditItemDeleted(true);
    setFormDisabled(false);
  };

  const onEstimationAddedSuccess = () => {
    enqueueSnackbar(
      translate(isEditMode ? "message.update" : "message.create"),
      { anchorOrigin }
    );
    onEstimationAdded();
  };

  useEffect(() => {
    const fetchResData = async () => {
      try {
        const response = await PayRateAPI.PayRateList(axiosPrivate);
        onPayRateLoaded(response?.data?.result);
      } catch (error) {
        displayError(enqueueSnackbar, error, { anchorOrigin });
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
    fetchResData();

    // Use the ref to focus the input element
    focusEstimationNameInputRef.current.focus();
  }, []);

  useEffect(() => {
    if (detailData) {
      setBillingName(detailData.billing ?? "");
    }
  }, [detailData]);

  useEffect(() => {
    // Reapply the pay rate adjustment if billingName changes
    if (selectedRegion && payRateMap[selectedResource]) {
      handleRegionChange({ target: { value: selectedRegion } });
    }

    // Set default to 'Billable' for "Enterprise" or "Startup"
    if (billingName === "Enterprise" || billingName === "Startup") {
      setBillableOrNonBillable("Billable");
    }
  }, [billingName]);

  useEffect(() => {
    onFullTimeCheckChange();
  }, [
    isFullTimeChecked,
    selectedStartDate,
    selectedEndDate,
    isHalfTimeChecked,
    is25PercentTimeChecked,
    is75PercentTimeChecked,
  ]);

  useEffect(() => {
    onRoleChange();
  }, [selectedResource]);
  useEffect(() => {
    const initialHoursByDate = generateInitialHoursByDate(
      selectedStartDate,
      selectedEndDate,
      isCheckBoxSelected,
      hoursByDate,
      checkboxtype
    );
    setInitialDataDateWise(initialHoursByDate);
  }, [
    isFullTimeChecked,
    isHalfTimeChecked,
    is75PercentTimeChecked,
    is25PercentTimeChecked,
  ]);

  const handleSearchQueryChange = (query) => {
    // Filter resource roles based on search query
    const filteredRoles = resourceList.filter((role, index, self) => {
      const matchesSearch = role.toLowerCase().includes(query.toLowerCase());
      const isFirstOccurrence = self.findIndex((r) => r === role) === index;
      return matchesSearch && isFirstOccurrence;
    });
    setFilteredResourceList(filteredRoles);
  };

  const handleRegionChange = (event) => {
    const region = event.target.value;
    setSelectedRegion(region);
    if (!region) {
      setSelectedPayRate("");
      setSelectedPayRateItem(null);
      return;
    }
    const foundItem = payRateMap[selectedResource]?.find(
      (item) => item.location === region
    );

    if (foundItem) {
      let multiplierForBillable = 1;
      if (billingName === "Enterprise" || billingName === "Startup") {
        if (billableOrNonBillable === "Billable") {
          multiplierForBillable = 1;
        } else {
          multiplierForBillable = 0;
        }
      } else if (billingName === "Internal") {
        multiplierForBillable = 0;
      }

      let adjustedPayRate = foundItem.billrate * multiplierForBillable;

      // Apply the 125% multiplier if billing is for "Startup"
      if (billingName === "Startup") {
        adjustedPayRate = (1.25 * adjustedPayRate).toFixed(2).toString();
      }

      setSelectedPayRate(Number(adjustedPayRate));
      setSelectedPayRateItem({
        ...foundItem,
        billrate: adjustedPayRate,
      });
    }
  };
  const handleSkillChange = (event, newValue) => {
    setSelectedSkill(newValue);
    if (newValue.length === 0) {
      setSelectedRegion("");
      setSelectedPayRate("");
      setSelectedPayRateItem(null);
    }
  };

  const handleEstimationNameChange = (event) => {
    const rawValue = event.target.value;
    const filteredValue = rawValue.replace(/[^A-Za-z0-9\s]/g, "");
    setSelectedEstimationName(filteredValue);
  };

  const handleBillingChange = (event) => {
    setBillingName(event.target.value);
  };

  const handleStartDateChange = (value) => {
    if (value && isValid(value)) {
      const startDate = new Date(value);
      setSelectedStartDate(startDate);
      setIsDateValid(true);
    } else {
      setSelectedStartDate(null);
      setIsDateValid(false);
    }
  };
  const handleEndDateChange = (value) => {
    if (isValid && isValid(value)) {
      const endDate = new Date(value);
      setSelectedEndDate(endDate);
      setIsDateValid(true);
    } else {
      setSelectedEndDate(null);
      setIsDateValid(false);
    }
  };

  const handlePayRate = (event) => {
    const value = event.target.value;

    const isValid = /^(?!-)(\d+(\.\d{0,2})?)?$/.test(value);
    if (!isValid) return;

    const payRate = parseFloat(value);
    setSelectedPayRate(value);

    if (selectedPayRateItem) {
      setSelectedPayRateItem({
        ...selectedPayRateItem,
        billrate: value,
      });
    }
  };

  useEffect(() => {
    // Reapply the pay rate adjustment if billingName or billableOrNonBillable changes
    if (selectedRegion && payRateMap[selectedResource]) {
      handleRegionChange({ target: { value: selectedRegion } });
    }
  }, [billingName, billableOrNonBillable]);

  const handleRadioChange = (event) => {
    setBillableOrNonBillable(event.target.value);
  };

  const handleEstimationHoursModalOpen = () => {
    if (selectedStartDate && selectedEndDate) {
      setEstimationHoursModalOpen(true);
    }
  };

  const handleEstimationHoursModalClose = () => {
    setEstimationHoursModalOpen(false);
  };

  const resetForm = () => {
    setHoursByDate([]);
  };
  const onEstimatePopupSubmit = (value, hoursByDate, cost, estData) => {
    const totalAvailHours = calculateTotalWorkingHours(
      selectedStartDate,
      selectedEndDate
    );
    setIsFullTimeChecked(value === totalAvailHours);
    setSelectedBillAllocation(value);
    setEstimatedHourHint(null);
    setEstimationHoursModalOpen(false);
    setHoursByDate(hoursByDate);
    setCostHrs(cost);
    setEstimationData(estData);
  };

  const handleAddResource = () => {
    function getWeekNumberTimeData(date) {
      const [day, month, year] = date
        .split("/")
        .map((num) => parseInt(num, 10));
      const tempDate = new Date(year, month - 1, day);
      tempDate.setDate(tempDate.getDate() + 3 - ((tempDate.getDay() + 6) % 7));
      const firstThursday = tempDate;
      const yearStart = new Date(firstThursday.getFullYear(), 0, 1);
      return Math.ceil(((firstThursday - yearStart) / 86400000 + 1) / 7);
    }

    function generateWeeklyData(dailyData) {
      const weeklyData = [];
      dailyData?.forEach((entry) => {
        const date = entry.date;
        const weekNumber = getWeekNumberTimeData(date);
        const existingWeek = weeklyData.find(
          (item) => item.week === weekNumber
        );
        if (existingWeek) {
          existingWeek.hours += entry.hours;
        } else {
          weeklyData.push({ week: weekNumber, hours: entry.hours });
        }
      });
      return weeklyData;
    }

    const formatDate = (date, isEnd = false) => {
      const parsedDate = new Date(date);
      const year = parsedDate.getFullYear();
      const month = parsedDate.getMonth();
      const day = parsedDate.getDate();
      const hours = isEnd ? 23 : 0;
      const minutes = isEnd ? 59 : 0;
      const seconds = isEnd ? 59 : 0;
      const milliseconds = isEnd ? 999 : 0;

      const formattedDate = new Date(
        year,
        month,
        day,
        hours,
        minutes,
        seconds,
        milliseconds
      );
      return formattedDate;
    };

    const startDateFormatted = selectedStartDate
      ? formatDate(selectedStartDate)
      : null;
    const endDateFormatted = selectedEndDate
      ? formatDate(selectedEndDate, true)
      : null;

    const newResourceData = createAddResourceData(
      selectedResource,
      selectedRegion,
      billableOrNonBillable,
      selectedSkill,
      selectedBillAllocation * numOfResources,
      selectedPayRate,
      selectedStartDate,
      selectedEndDate,
      selectedPayRateItem,
      costHrs,
      estimationData,
      timeData,
      totalAvailHours,
      numOfResources,
      selectedExperience,
      InitialDataDateWise,
      checkboxtype
    );

    newResourceData.id_start_date = startDateFormatted.toISOString();
    newResourceData.id_end_date = endDateFormatted.toISOString();

    const weeklyData = newResourceData?.id_estimation_Data
      ? generateWeeklyData(newResourceData?.id_estimation_Data?.daily)
      : generateWeeklyData(newResourceData?.id_time_data?.daily);

    if (newResourceData?.id_estimation_Data) {
      newResourceData.id_estimation_Data.weekly = weeklyData;
    } else if (newResourceData?.id_time_data) {
      newResourceData.id_time_data.weekly = weeklyData;
    }

    setTableData([...tableData, newResourceData]);
    clearFields();
    resetForm();
    setFormDisabled(false);
  };

  function clearFields() {
    setSelectedResource("");
    setSelectedRegion("");
    setSelectedSkill([]);
    setSelectedPayRate("");
    setSelectedBillAllocation("");
    setSelectedStartDate(null);
    setSelectedEndDate(null);
    // setIsFullTimeChecked(false);
    setSelectedPayRateItem({});
    setFormDisabled(false);
    setCostHrs(0);
    setIsFullTimeChecked(false);
    setIsCheckBoxSelected(false);
    setIsHalfTimeChecked(false);
    setIs25PercentTimeChecked(false);
    setIs75PercentTimeChecked(false);
    setNumOfResources("");
    setSelectedExperience("");
    setCheckbox("");
  }

  const disableAddResourceButton = () => {
    return (
      !selectedResource ||
      !selectedRegion ||
      !selectedBillAllocation ||
      !selectedStartDate ||
      !selectedEndDate ||
      !selectedSkill ||
      !numOfResources
    );
  };

  const isEndDateDisabled = () => {
    return !selectedStartDate;
  };

  function isEstimationHourIconDisabled() {
    return !(selectedStartDate && selectedEndDate);
  }

  const handleCheckboxChange = (event) => {
    setIsFullTimeChecked(event.target.checked);
    setIsCheckBoxSelected(event.target.checked);
    setIsHalfTimeChecked(false);
    setIs25PercentTimeChecked(false);
    setIs75PercentTimeChecked(false);
    if (event.target.checked) {
      setCheckbox("fulltime");
    } else {
      setCheckbox("");
    }
  };

  const handleHalfTimeCheckboxChange = (e) => {
    setIsHalfTimeChecked(e.target.checked);
    setIsCheckBoxSelected(e.target.checked);
    setIsFullTimeChecked(false);
    setIs25PercentTimeChecked(false);
    setIs75PercentTimeChecked(false);
    if (e.target.checked) {
      setCheckbox("halftime");
    } else {
      setCheckbox("");
    }
  };
  const handle25PercentageTimeCheckboxChange = (e) => {
    setIs25PercentTimeChecked(e.target.checked);
    setIsCheckBoxSelected(e.target.checked);
    setIsFullTimeChecked(false);
    setIsHalfTimeChecked(false);
    setIs75PercentTimeChecked(false);
    if (e.target.checked) {
      setCheckbox("25percent");
    } else {
      setCheckbox("");
    }
  };
  const handle75PercentageTimeCheckboxChange = (e) => {
    setIs75PercentTimeChecked(e.target.checked);
    setIsCheckBoxSelected(e.target.checked);
    setIsFullTimeChecked(false);
    setIsHalfTimeChecked(false);
    setIs25PercentTimeChecked(false);
    if (e.target.checked) {
      setCheckbox("75percent");
    } else {
      setCheckbox("");
    }
  };

  const isWeekday = (date) => {
    const day = date.getDay();
    // 0 is Sunday, 6 is Saturday
    return day === 0 || day === 6;
  };

  function getEstimatedHourTextColor() {
    return estimatedHourHint
      ? theme.palette.text.disabled
      : theme.palette.text.primary;
  }

  function getEstimatedHourText() {
    return estimatedHourHint ?? selectedBillAllocation;
  }

  function onFullTimeCheckChange() {
    setEstimatedHourHint(null);
    if (!selectedStartDate || !selectedEndDate) {
      setSelectedBillAllocation("");
      return;
    }
    const hours = getHoursWithoutWeekends(selectedStartDate, selectedEndDate);
    if (
      isFullTimeChecked ||
      isHalfTimeChecked ||
      is25PercentTimeChecked ||
      is75PercentTimeChecked
    ) {
      if (isFullTimeChecked) {
        setSelectedBillAllocation(hours);
      } else if (isHalfTimeChecked) {
        setSelectedBillAllocation(hours * 0.5);
      } else if (is25PercentTimeChecked) {
        setSelectedBillAllocation(hours * 0.25);
      } else if (is75PercentTimeChecked) {
        setSelectedBillAllocation(hours * 0.75);
      }
      setHoursByDate([]);
    } else {
      setSelectedBillAllocation("");
      setEstimatedHourHint(hours);
    }
  }

  async function onRoleChange() {
    if (!selectedResource) return;
    const selectedResourceSkills = payRateMap[selectedResource]?.reduce(
      (acc, curr) => acc.concat(curr.skill),
      []
    );
    setSkillOption([...new Set(selectedResourceSkills)]);
    setRegionOption(payRateMap[selectedResource] ?? []);
  }
  async function onPayRateLoaded(payRateList) {
    let skillHashMap = {};
    let resourceRoles = [];
    payRateList?.forEach((item) => {
      const key = item.role;
      resourceRoles.push(item.role);
      let itemArray = skillHashMap[key] ?? [];
      itemArray = [...itemArray, item];
      skillHashMap = {
        ...skillHashMap,
        [key]: itemArray,
      };
    });
    setPayRateMap(skillHashMap);
    setResourceList(resourceRoles);
    setFilteredResourceList([...new Set(resourceRoles)]);
  }
  const splitTypeCheck = () => {
    if (isFullTimeChecked) {
      return true;
    } else if (isHalfTimeChecked) {
      return true;
    } else if (is25PercentTimeChecked) {
      return true;
    } else if (is75PercentTimeChecked) {
      return true;
    }
    return false;
  };
  const [selectedResourceData, setSelectedResourceData] = useState(null);
  const [isEditResource, setIsEditResource] = useState(false);

  const handleEditRow = (row) => {
    setSelectedResourceData(row);
    setIsEditResource(true);
  };
  useEffect(() => {
    if (selectedResourceData) {
      setSelectedResource(selectedResourceData.id_role);
      setNumOfResources(selectedResourceData.id_num_of_resources);
      setBillableOrNonBillable(selectedResourceData.id_billability);
      setSelectedSkill(selectedResourceData.id_skill.split(", "));
      setSelectedExperience(selectedResourceData.id_experience);
      setSelectedRegion(selectedResourceData.id_region);
      setSelectedPayRate(selectedResourceData.id_pay_rate);
      setSelectedStartDate(selectedResourceData.id_start_date);
      setSelectedEndDate(selectedResourceData.id_end_date);
      setSelectedPayRateItem(selectedResourceData.id_other_pay_rate_data);
      setEstimationData(selectedResourceData.id_estimation_Data);
      setCheckbox(selectedResourceData?.id_checkbox);
      setInitialDataDateWise(
        selectedResourceData?.id_initial_estimation_datewise
      );
      setSelectedBillAllocation(selectedResourceData?.id_estimation_hour);
      if (selectedResourceData?.id_checkbox === "halftime") {
        setIsHalfTimeChecked(true);
        setIsFullTimeChecked(false);
        setIs25PercentTimeChecked(false);
        setIs75PercentTimeChecked(false);
      } else if (selectedResourceData?.id_checkbox === "fulltime") {
        setIsFullTimeChecked(true);
        setIsHalfTimeChecked(false);
        setIs25PercentTimeChecked(false);
        setIs75PercentTimeChecked(false);
      } else if (selectedResourceData?.id_checkbox === "25percent") {
        setIs25PercentTimeChecked(true);
        setIsHalfTimeChecked(false);
        setIsFullTimeChecked(false);
        setIs75PercentTimeChecked(false);
      } else if (selectedResourceData?.id_checkbox === "75percent") {
        setIs75PercentTimeChecked(true);
        setIsHalfTimeChecked(false);
        setIsFullTimeChecked(false);
        setIs25PercentTimeChecked(false);
      } else {
        setIsHalfTimeChecked(false);
        setIsFullTimeChecked(false);
        setIs25PercentTimeChecked(false);
        setIs75PercentTimeChecked(false);
      }
    }
  }, [selectedResourceData]);
  const handleUpdate = () => {
    // Function to get the week number from a date in DD/MM/YYYY format (id_time_data)
    function getWeekNumberTimeData(date) {
      const [day, month, year] = date
        .split("/")
        .map((num) => parseInt(num, 10));
      const tempDate = new Date(year, month - 1, day); // MM is 0-indexed in JS
      tempDate.setHours(0, 0, 0, 0); // Set time to 00:00 to ensure no time interference
      tempDate.setDate(tempDate.getDate() + 3 - ((tempDate.getDay() + 6) % 7)); // Adjust to Thursday of the week
      const firstThursday = tempDate;
      const yearStart = new Date(firstThursday.getFullYear(), 0, 1);
      return Math.ceil(((firstThursday - yearStart) / 86400000 + 1) / 7); // Calculate week number
    }

    // Function to generate weekly data based on daily data
    function generateWeeklyData(dailyData, isEstimationData = true) {
      const weeklyData = [];
      dailyData?.forEach((entry) => {
        const date = entry.date;
        const weekNumber = getWeekNumberTimeData(date);
        const existingWeek = weeklyData.find(
          (item) => item.week === weekNumber
        );

        if (existingWeek) {
          existingWeek.hours += entry.hours; // Accumulate hours for the same week
        } else {
          weeklyData.push({ week: weekNumber, hours: entry.hours }); // Add new week data if not found
        }
      });

      return weeklyData;
    }
    if (selectedResourceData) {
      const updatedBillableAllocationHrs = !selectedBillAllocation
        ? selectedResourceData.id_estimation_hour
        : selectedBillAllocation;
      const updatedCostHrs = !costHrs
        ? selectedResourceData.id_cost_hrs
        : costHrs;
      const updatedRow = createAddResourceData(
        selectedResource,
        selectedRegion,
        billableOrNonBillable,
        selectedSkill,
        updatedBillableAllocationHrs * numOfResources,
        selectedPayRate,
        selectedStartDate,
        selectedEndDate,
        selectedPayRateItem,
        updatedCostHrs,
        estimationData,
        timeData,
        totalAvailHours,
        numOfResources,
        selectedExperience,
        setInitialDataDateWise,
        checkboxtype
      );
      if (updatedRow?.id_checkbox) {
        updatedRow.id_estimation_Data = updatedRow?.id_time_data;
      }
      const weeklyData = generateWeeklyData(
        updatedRow?.id_estimation_Data?.daily
      );
      updatedRow.id_estimation_Data.weekly = weeklyData;
      const updatedTableData = tableData?.map((row) =>
        row === selectedResourceData ? updatedRow : row
      );
      setTableData(updatedTableData);
      setSelectedResourceData(null);
      clearFields();
      resetForm();
      setIsEditResource(false);
    }
  };

  const handleCancel = () => {
    clearFields();
    setSelectedResourceData(null);
    setIsEditResource(false);
  };
  return (
    <>
      <Box padding={"2% 2% 10% 2%"}>
        <Stack direction="row" spacing={1} alignItems={"center"}>
          <HighlightOffIcon onClick={handleClose} />
          <Typography noWrap variant="h4">
            {translate("effortEstimations")}
          </Typography>
        </Stack>
        <Grid container spacing={2} marginTop={2} marginBottom={3}>
          <Grid item xs={12} sm={4} md={4}>
            <TextField
              fullWidth
              label={
                <MandatoryTextField
                  label={translate("PriceEstimation.ESTIMATION_NAME")}
                />
              }
              value={selectedEstimationName}
              onChange={handleEstimationNameChange}
              inputRef={focusEstimationNameInputRef}
              inputProps={{ maxLength: 25 }}
            />
          </Grid>
          <Grid item xs={12} sm={4} md={4}>
            <TextField
              disabled={tableData.length > 0}
              InputLabelProps={{ shrink: true }}
              id="outlined-select-contract-term"
              select
              fullWidth
              label={<MandatoryTextField label={translate("Billing")} />}
              value={billingName}
              onChange={handleBillingChange}
              inputRef={focusEstimationNameInputRef}
            >
              {BILLING.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4} md={4}>
            <TextField
              fullWidth
              label={translate("ClientPreviewScreen.CLIENT_NAME")}
              value={name || ""}
              onChange={handleEstimationNameChange}
              disabled={true}
            />
          </Grid>
        </Grid>
        <Typography variant="h6">{translate("addResources")}</Typography>

        <Grid container spacing={2} marginTop={2}>
          <Grid item xs={12} sm={4} md={4}>
            <Autocomplete
              fullWidth
              id="tags-outlined"
              options={filteredResourceList}
              value={selectedResource}
              onChange={(event, newValue) => {
                setSelectedResource(newValue);
                if (newValue) {
                  const experience =
                    payRateMap[newValue]?.[0]?.experience || "";
                  setSelectedExperience(experience);

                  // Reset other related states if needed
                  setSelectedSkill([]);
                  setSelectedRegion("");
                  setSelectedPayRate("");
                  setSelectedPayRateItem(null);
                } else {
                  setSelectedExperience(""); // Reset experience if no role selected
                }
              }}
              onInputChange={(event, newInputValue) => {
                handleSearchQueryChange(newInputValue);
              }}
              renderInput={(params) => (
                <TextField
                  {...params}
                  label={
                    <MandatoryTextField label={translate("resourceRole")} />
                  }
                  inputProps={{ ...params.inputProps }}
                />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={4} md={4}>
            <TextField
              fullWidth
              select
              label={
                <MandatoryTextField label={translate("Num of Resources")} />
              }
              value={numOfResources}
              onChange={handleChange}
            >
              {resourceOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option} {option === 1 ? "Resource" : "Resources"}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4} md={4}>
            <MultipleSelectCheckmarks
              setSkillOption={setSkillOption}
              skillOption={skillOption}
              setSelectedSkill={setSelectedSkill}
              selectedSkill={selectedSkill}
              disabledSkill={!selectedResource}
            />
          </Grid>
        </Grid>

        <Grid container spacing={2} marginTop={1}>
          <Grid item xs={12} sm={4} md={4}>
            <TextField
              fullWidth
              label={
                <MandatoryTextField
                  label={translate("Estimations.Experience")}
                />
              }
              value={selectedExperience || ""}
              InputProps={{
                readOnly: true, // Makes the field non-editable
              }}
            />
          </Grid>
          <Grid item xs={12} sm={4} md={4}>
            <TextField
              fullWidth
              select
              label={<MandatoryTextField label={translate("region")} />}
              value={selectedRegion}
              onChange={handleRegionChange}
              disabled={selectedSkill.length === 0}
            >
              {regionOption.map((regionItem) => (
                <MenuItem key={regionItem.location} value={regionItem.location}>
                  {regionItem.location}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} sm={4} md={4}>
            <TextField
              fullWidth
              label={<MandatoryTextField label={translate("payRate")} />}
              onChange={handlePayRate}
              value={selectedPayRate}
              InputProps={{
                inputMode: "decimal", // Allows numeric keypad on mobile
                pattern: "\\d*(\\.\\d{0,2})?", // Enforce validation at the input level
                startAdornment: (
                  <InputAdornment position="start">$</InputAdornment>
                ),
              }}
              disabled={process.env.REACT_APP_ENABLE_BILLRATE_EDIT === "false"}
            />
            <FormControl component="fieldset">
              <RadioGroup
                row
                value={billableOrNonBillable}
                onChange={handleRadioChange}
              >
                <FormControlLabel
                  value="Billable"
                  control={<Radio />}
                  label="Billable"
                  disabled={billingName === "Internal"}
                  checked={
                    billingName !== "Internal" &&
                    billableOrNonBillable === "Billable"
                  }
                />
                <FormControlLabel
                  value="Non-Billable"
                  control={<Radio />}
                  label="Non-Billable"
                  disabled={billingName === "Internal"}
                  checked={
                    billingName === "Internal" ||
                    billableOrNonBillable === "Non-Billable"
                  }
                />
              </RadioGroup>
            </FormControl>
          </Grid>
        </Grid>
        <Grid container spacing={2}>
          <Grid item xs={12} sm={4} md={4}>
            <DatePicker
              views={["year", "month", "day"]}
              label={<MandatoryTextField label={translate("Start Date")} />}
              disablePast={process.env?.APP_ENABLED_PAST_DATES || false}
              value={selectedStartDate}
              onChange={handleStartDateChange}
              shouldDisableDate={isWeekday}
              inputFormat="yyyy-MM-dd"
              renderInput={(params) => (
                <TextField {...params} helperText={null} fullWidth />
              )}
              disabled={!selectedRegion}
            />
          </Grid>

          <Grid item xs={12} sm={4} md={4}>
            <DatePicker
              views={["year", "month", "day"]}
              label={<MandatoryTextField label={translate("End Date")} />}
              disabled={isEndDateDisabled()}
              minDate={selectedStartDate ?? new Date()}
              value={selectedEndDate}
              onChange={handleEndDateChange}
              shouldDisableDate={isWeekday}
              inputFormat="yyyy-MM-dd"
              renderInput={(params) => (
                <TextField {...params} helperText={null} fullWidth />
              )}
            />
          </Grid>
          <Grid item xs={12} sm={4} md={4}>
            <TextField
              fullWidth
              type="number"
              label={<MandatoryTextField label={translate("estimationHrs")} />}
              value={getEstimatedHourText()}
              InputProps={{
                sx: {
                  "& input": {
                    color: getEstimatedHourTextColor(),
                  },
                },
                endAdornment: (
                  <InputAdornment position="end">
                    <IconButton
                      onClick={handleEstimationHoursModalOpen}
                      edge="end"
                      disabled={isEstimationHourIconDisabled()}
                    >
                      <DateRangeIcon />
                    </IconButton>
                  </InputAdornment>
                ),
              }}
              disabled={!selectedEndDate}
            />
            <Box sx={{ display: "flex", alignItems: "center" }}>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Checkbox
                  icon={<CheckBoxOutlineBlankOutlined />}
                  checkedIcon={<CheckBoxOutlined />}
                  checked={is25PercentTimeChecked}
                  onChange={handle25PercentageTimeCheckboxChange}
                  className={classes.checkbox_estimation}
                  disabled={!selectedEndDate}
                />
                <Typography sx={{ marginRight: "3px" }} variant="body2">
                  25%
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Checkbox
                  icon={<CheckBoxOutlineBlankOutlined />}
                  checkedIcon={<CheckBoxOutlined />}
                  checked={isHalfTimeChecked}
                  onChange={handleHalfTimeCheckboxChange}
                  className={classes.checkbox_estimation}
                  disabled={!selectedEndDate}
                />
                <Typography sx={{ marginRight: "3px" }} variant="body2">
                  50%
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Checkbox
                  icon={<CheckBoxOutlineBlankOutlined />}
                  checkedIcon={<CheckBoxOutlined />}
                  checked={is75PercentTimeChecked}
                  onChange={handle75PercentageTimeCheckboxChange}
                  className={classes.checkbox_estimation}
                  disabled={!selectedEndDate}
                />
                <Typography sx={{ marginRight: "3px" }} variant="body2">
                  75%
                </Typography>
              </Box>
              <Box sx={{ display: "flex", alignItems: "center" }}>
                <Checkbox
                  icon={<CheckBoxOutlineBlankOutlined />}
                  checkedIcon={<CheckBoxOutlined />}
                  checked={isFullTimeChecked}
                  onChange={handleCheckboxChange}
                  className={classes.checkbox_estimation}
                  disabled={!selectedEndDate}
                />
                <Typography variant="body2">100%</Typography>
              </Box>
            </Box>
          </Grid>
        </Grid>
        <Stack
          direction="row"
          alignItems={"center"}
          marginTop={5}
          marginBottom={5}
          justifyContent={"space-between"}
        >
          <Box sx={styles.payRateBox} justifyContent={"space-evenly"}>
            <Typography sx={styles.payRateText}>{"\u2B24"}</Typography>
            <Typography sx={styles.payRateText}>
              {translate("payRate") +
                " - " +
                fCurrency(selectedPayRateItem?.billrate)}
            </Typography>
            <Typography sx={styles.payRateText}>{"\u2B24"}</Typography>
            <Typography sx={styles.payRateText}>
              {translate("companyRate") +
                " - " +
                fCurrency(selectedPayRateItem?.companyrate)}
            </Typography>
            <Typography sx={styles.payRateText}>{"\u2B24"}</Typography>
            <Typography sx={styles.payRateText}>
              {translate("marketRate") +
                " - " +
                fCurrency(selectedPayRateItem?.marketrate)}
            </Typography>
          </Box>

          {!isEditResource ? (
            <Button
              variant="contained"
              color="secondary"
              onClick={handleAddResource}
              disabled={!isDateValid || disableAddResourceButton()}
              // sx={{ color: "black", marginRight: "-220px" }}
            >
              {translate("addResources")}
            </Button>
          ) : (
            ""
          )}

          {isEditResource ? (
            <>
              <Button
                variant="contained"
                color="primary"
                onClick={handleUpdate}
                disabled={!selectedResourceData}
                sx={{ marginRight: "-260px" }}
              >
                Update Resource
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={handleCancel}
                disabled={!selectedResourceData}
              >
                cancel
              </Button>
            </>
          ) : (
            ""
          )}
        </Stack>

        <ResourceTable
          tableData={tableData}
          onDeleteRow={handleDeleteRow}
          onEditRow={handleEditRow}
        />

        <CreateEstimation
          detailData={detailData}
          clientId={uuid}
          clientName={name}
          tableData={tableData}
          estimationName={selectedEstimationName}
          onFormSubmitted={onEstimationAddedSuccess}
          isEditDelete={isEditItemDeleted}
          formDisabled={formDisabled}
          PayRateData={selectedPayRateItem}
          billingName={billingName}
        />

        <Dialog
          open={isEstimationHoursModalOpen}
          onClose={handleEstimationHoursModalClose}
          maxWidth="md"
          fullWidth
        >
          <DialogContent className={useStyles.modalContainer}>
            <EstimationCalendar
              setInitialDataDateWise={setInitialDataDateWise}
              onCancel={handleEstimationHoursModalClose}
              onEstimatePopupSubmit={onEstimatePopupSubmit}
              selectedStartDate={selectedStartDate}
              selectedEndDate={selectedEndDate}
              isChecked={splitTypeCheck()}
              hoursByDateParent={hoursByDate}
              checkboxtype={checkboxtype}
            />
          </DialogContent>
        </Dialog>
      </Box>
    </>
  );
}
export default AddEstimationForm;

const useStyles = createStyles((theme) => ({
  rootBox: {
    margin: "15px",
    fontFamily: "Inter",
    fontSize: "24px",
    fontWeight: "700",
    lineHeight: "29px",
    color: theme.palette.text.primary,
    height: "50px",
  },
  modalContainer: {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    width: "auto",
  },
  payRateBox: {
    display: "flex",
    flexDirection: "row",
  },
  payRateText: {
    fontSize: "10px",
    margin: "8px",
    color: theme.palette.text.main,
  },
}));

export const SKILLS = [
  "Python",
  "Android",
  "Java",
  "Kotlin",
  "Flutter",
  "iOS",
  "Swift",

  "React Native",

  "C++",

  "HTML",
  "CSS",
  "Javascript",
  "React",
  "NodeJS",
  "PHP",
  "Angular",

  "MySQL",
  "Oracle",
  "MongoDB",
  "MS SQL",
  "NoSQL",

  "Networking Protocols",
  "Routing",
  "Network",
  "Cloud",
  "Virtualization",

  "Penetration Testing",
  "Vulnerability Assessment",

  "Tableau",

  "Risk Assessment",
  "Planning",

  "Amazon Web Services",
  "AWS",
  "Microsoft Azure",
  "Google Cloud",

  "Terraform",
  "Ansible",
  "Kubernetes",
  "Grafana",
  "Prometheus",

  "Manual Testing",
  "Automation Testing",

  "Business Analyst",

  "Procurement",
  "Software Licenses",
  "Vendor Relationship",
];

export const BILLING = ["Startup", "Enterprise", "Internal"];
