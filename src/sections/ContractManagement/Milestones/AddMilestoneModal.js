import React, { useEffect, useState } from "react";
import {
  Box,
  TextField,
  Button,
  Typography,
  Stack,
  MenuItem,
  Grid,
  ButtonGroup,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Tooltip,
} from "@mui/material";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { DatePicker } from "@mui/x-date-pickers/DatePicker";
import { useSnackbar } from "notistack";
import { createStyles, useTheme } from "@mui/styles";
import useAxiosPrivate, {
  isValidResponse,
} from "../../../hooks/useAxiosPrivate";
import useLocales from "../../../hooks/useLocales";

import MilestoneTable from "./MilestoneTable";
import ContractAPI from "../../../services/ContractService";
import useClient from "../../../hooks/useClient";
import { displayError } from "../../../utils/handleErrors";
import MilestoneAPI from "../../../services/MilestoneService";
import MandatoryTextField from "../../../pages/MandatoryTextField";
import { anchorOrigin } from "../../../utils/constants";
import { useNavigate } from "react-router-dom";
import { PATH_PAGE } from "../../../routes/paths";
const useStyles = createStyles((theme) => ({
  modalHeader: {
    display: "flex",
    alignItems: "center",
    margin: "15px",
  },
  closeIcon: {
    height: "50px",
    width: "30px",
    margin: "10px",
  },
  section: {
    padding: "16px",
  },
  inputField: {
    width: "100%",
  },
  smallInputField: {
    width: "25%",
  },
  addButton: {
    float: "right",
    marginLeft: "auto",
    colors: "black",
  },
  createButton: {
    float: "right",
    margin: "10px",
  },
  contractBox: {
    display: "inline-flex",
    flexDirection: "row",
  },
  contractText: {
    fontSize: "12px",
    padding: "8px",
    color: theme.palette.text.main,
  },
}));

function AddMilestoneModal({ mileStoneData, onAddMilestone, handleClose }) {
  const isEditMode = mileStoneData ? true : false;
  const theme = useTheme();
  const navigate = useNavigate();
  const styles = useStyles(theme);
  const axiosPrivate = useAxiosPrivate();
  const { enqueueSnackbar } = useSnackbar();
  const { translate } = useLocales();
  const { selectedClient } = useClient();
  const [selected, setSelected] = useState("manual");
  const [selectedOption, setSelectedOption] = useState("");
  const [tableData, setTableData] = useState(mileStoneData?.milestones ?? []);
  const [isDropdownClicked, setIsDropdownClicked] = useState(false);
  const [errorMessage, setErrorMessageText] = useState("");
  const handleDropdownOpen = () => {
    if (!isDropdownClicked) {
      setIsDropdownClicked(true);
    }
  };
  const [totalAmount, setTotalAmount] = useState(
    mileStoneData?.milestone_total_amount ?? ""
  );
  const [isLoading, setIsLoading] = useState(true);
  const [startDateValue, setStartDateValue] = useState(null);
  const [milestoneDeliverables, setMilestoneDeliverables] = useState("");
  const [milestoneAmount, setMilestoneAmount] = useState("");
  const [milestoneAutoAmount, setMilestoneAutoAmount] = useState("");
  const [customStartDate, setCustomStartDate] = useState();
  const [customEndDate, setCustomEndDate] = useState();
  const [calculatedData, setCalculatedData] = useState({});
  const [milestoneRedirectionId, setMileStoneRedirectionId] = useState("");
  const [mileStoneName, setMileStoneName] = useState(mileStoneData?.name ?? "");
  const [dateDisableSettings, setDateDisableSettings] = useState({
    isMonthDisabled: false,
    isBiWeekDisabled: false,
    isWeekDisabled: false,
  });
  const [contractDataList, setContractDataList] = useState([]);
  const [selectedContract, setSelectedContract] = React.useState({});

  const [minDate, setMinDate] = useState(null);
  const [maxDate, setMaxDate] = useState(null);
  const [milestoneNameExist, setMileStoneNameExist] = useState(false);
  const [selectedContractAmount, setSelectedContractAmount] = useState("");
  const [selectedContractStartDate, setSelectedContractStartDate] =
    useState("");
  const [selectedContractEndDate, setSelectedContractEndDate] = useState("");
  const [error, setError] = useState("");
  const [isMilestoneDataChanged, setIsMilestoneDataChanged] = useState(false);

  useEffect(() => {
    if (isEditMode) {
      setIsMilestoneDataChanged(false);
    }
  }, [isEditMode]);

  useEffect(() => {
    if (isEditMode && tableData.length !== mileStoneData.milestones.length) {
      setIsMilestoneDataChanged(true);
    }
  }, [tableData, isEditMode, mileStoneData]);

  useEffect(() => {
    fetchSOWContracts();
  }, []);

  useEffect(() => {
    if (selectedContract) {
      setCustomEndDate(selectedContractEndDate);
      setCustomStartDate(selectedContractStartDate);
    }
  }, [selectedContract, selectedContractEndDate, selectedContractStartDate]);

  const isWeekend = (date) => {
    const day = date.getDay();
    return day === 0 || day === 6;
  };

  useEffect(() => {
    let updatedTotalAmount = 0;
    let latestDateObj = new Date(0);

    tableData.forEach((element) => {
      updatedTotalAmount += Number(element.milestoneAmount);
      const currentDate = new Date(element.startDateValue);
      if (currentDate > latestDateObj) {
        latestDateObj = currentDate;
      }
    });

    setTotalAmount(updatedTotalAmount);

    const nextDateObj = new Date(latestDateObj);
    nextDateObj.setDate(latestDateObj.getDate() + 1);
    // Adjust `nextDateObj` if it falls on a weekend
    const dayOfWeek = nextDateObj.getDay();
    if (dayOfWeek === 6) {
      // Saturday
      nextDateObj.setDate(nextDateObj.getDate() + 2); // Move to Monday
    } else if (dayOfWeek === 0) {
      // Sunday
      nextDateObj.setDate(nextDateObj.getDate() + 1); // Move to Monday
    }
    // Format the date to MM/DD/YYYY
    const year = nextDateObj.getFullYear();
    const month = String(nextDateObj.getMonth() + 1).padStart(2, "0");
    const day = String(nextDateObj.getDate()).padStart(2, "0");
    const finalFormattedDate = `${month}/${day}/${year}`;

    const formatDateToMMDDYYYY = (date) => {
      if (!date) return "";
      const d = new Date(date);
      const formattedMonth = String(d.getMonth() + 1).padStart(2, "0");
      const formattedDay = String(d.getDate()).padStart(2, "0");
      const formattedYear = d.getFullYear();
      return `${formattedMonth}/${formattedDay}/${formattedYear}`;
    };

    const endDateFormatted = customEndDate
      ? formatDateToMMDDYYYY(customEndDate)
      : "";

    if (finalFormattedDate > endDateFormatted) {
      setCustomEndDate(null);
      setCustomStartDate(null);
      console.log("All date span is Completed");
    } else {
      setCustomStartDate(finalFormattedDate);
    }

    if (tableData.length >= 1) {
      if (finalFormattedDate > endDateFormatted && endDateFormatted !== "") {
        setCustomEndDate(null);
        setCustomStartDate(null);
        console.log("All date span is Completed");
      } else {
        setCustomStartDate(finalFormattedDate);
        setCustomEndDate(selectedContractEndDate);
      }
    }

    if (tableData.length < 1 && selectedContract) {
      // If tableData is empty, use contract start date
      setCustomStartDate(selectedContractStartDate);
      setCustomEndDate(selectedContractEndDate);
    }
  }, [tableData, selectedContractStartDate, selectedContractEndDate]);

  useEffect(() => {
    if (selectedContract?.uuid) {
      checkMileStoneExist(selectedContract.uuid);
    }
  }, [selectedContract]);

  useEffect(() => {
    const count = countDaysBetween(customStartDate, customEndDate);
    if (count < 7) {
      setSelectedOption("");
      setDateDisableSettings({
        isMonthDisabled: true,
        isBiWeekDisabled: true,
        isWeekDisabled: true,
      });
    } else if (count < 15) {
      setDateDisableSettings({
        isMonthDisabled: true,
        isBiWeekDisabled: true,
        isWeekDisabled: false,
      });
    } else if (count < 30) {
      setDateDisableSettings({
        isMonthDisabled: true,
        isBiWeekDisabled: false,
        isWeekDisabled: false,
      });
    } else {
      setDateDisableSettings({
        isMonthDisabled: false,
        isBiWeekDisabled: false,
        isWeekDisabled: false,
      });
    }
  }, [customStartDate, customEndDate]);

  function countDaysBetween(startDate, endDate) {
    // Convert date strings into Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Normalize both dates to start at midnight (00:00:00)
    start.setHours(0, 0, 0, 0);
    end.setHours(0, 0, 0, 0);

    // Calculate the difference in milliseconds
    const diffTime = end - start;

    // Convert milliseconds to days
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24)) + 1;

    // Return the number of days between the two dates
    return diffDays >= 0 ? diffDays : 0; // Ensure that the result is not negative
  }

  async function checkMileStoneExist(contractId) {
    try {
      const response = await MilestoneAPI.CHECK(axiosPrivate, contractId);
      if (response?.data?.exists) {
        setMileStoneRedirectionId(response?.data?.milestone_data?.uuid);
      } else {
        setMileStoneRedirectionId("");
      }
    } catch (error) {
      console.log(
        "Error while checking milestone exist for given contract or not : ",
        error
      );
    }
  }

  const gotoMilestonePage = () => {
    navigate(PATH_PAGE.contracts.milestoneDetail, {
      state: { uuid: milestoneRedirectionId },
    });
  };

  const onContractChange = (event) => {
    const item = event.target.value;
    setSelectedContract(item);

    if (item && item.start_date && item.end_date) {
      const contractStartDate = new Date(item.start_date);
      const contractEndDate = new Date(item.end_date);
      setSelectedContractAmount(item.total_contract_amount);
      setSelectedContractStartDate(contractStartDate.toDateString());
      setSelectedContractEndDate(contractEndDate.toDateString());
      setMinDate(contractStartDate);
      setMaxDate(contractEndDate);

      if (
        !startDateValue ||
        startDateValue < contractStartDate ||
        startDateValue > contractEndDate
      ) {
        // setStartDateValue(contractStartDate);
      }
    } else {
      setStartDateValue(null);
      setMinDate(null);
      setMaxDate(null);
    }
  };

  const handleStartDateChange = (newValue) => {
    const formatDateToMMDDYYYY = (date) => {
      if (!date) return "";
      const d = new Date(date);
      const formattedMonth = String(d.getMonth() + 1).padStart(2, "0");
      const formattedDay = String(d.getDate()).padStart(2, "0");
      const formattedYear = d.getFullYear();
      return `${formattedMonth}/${formattedDay}/${formattedYear}`;
    };
    const formatedDate = formatDateToMMDDYYYY(newValue);
    setStartDateValue(formatedDate);
  };

  const handleCustomStartDateChange = (newValue) => {
    setCustomStartDate(newValue);
  };

  const handleCustomEndDateChange = (newValue) => {
    setCustomEndDate(newValue);
  };

  const handleDeleteRow = (position) => {
    const updatedItems = tableData.filter((_, index) => index !== position);
    setTableData(updatedItems);
  };
  function getMileStoneTableRow(
    milestoneNumber,
    startDateValue,
    milestoneDeliverables,
    milestoneAmount
  ) {
    return {
      milestoneNumber: milestoneNumber,
      startDateValue: startDateValue,
      milestoneDeliverables: milestoneDeliverables,
      milestoneAmount: milestoneAmount,
    };
  }

  const handleAutoFillRepeatRow = () => {
    const prevTableData = tableData;
    if (selectedOption === "monthly") {
      const availableMonths = calculatedData.numberOfPeriods;
      const availableDateArr = calculatedData.dates;
      if (
        availableMonths * milestoneAutoAmount >
        (
          tryParseNumber(selectedContractAmount) - tryParseNumber(totalAmount)
        ).toFixed(2)
      ) {
        setErrorMessageText(
          "Total Amount for Monthly repeat is greater than available amount"
        );
        setSelectedOption("");
      } else {
        const monthlyRepeatedArr = createStructuraldata(
          availableMonths,
          availableDateArr,
          prevTableData,
          milestoneAutoAmount
        );
        setTableData([...prevTableData, ...monthlyRepeatedArr]);
      }
    }
    if (selectedOption === "biWeekly") {
      const availableBiWeeks = calculatedData.numberOfPeriods;
      const availableDateArr = calculatedData.dates;
      if (
        availableBiWeeks * milestoneAutoAmount >
        (
          tryParseNumber(selectedContractAmount) - tryParseNumber(totalAmount)
        ).toFixed(2)
      ) {
        setErrorMessageText(
          "Total Amount for Bi-Weekly repeat is greater than available amount"
        );
        setSelectedOption("");
      } else {
        const biWeekRepeatedArr = createStructuraldata(
          availableBiWeeks,
          availableDateArr,
          prevTableData,
          milestoneAutoAmount
        );
        setTableData([...prevTableData, ...biWeekRepeatedArr]);
      }
    }
    if (selectedOption === "weekly") {
      const availableWeeks = calculatedData.numberOfPeriods;
      const availableDateArr = calculatedData.dates;
      if (
        availableWeeks * milestoneAutoAmount >
        (
          tryParseNumber(selectedContractAmount) - tryParseNumber(totalAmount)
        ).toFixed(2)
      ) {
        setErrorMessageText(
          "Total Amount for Weekly repeat is greater than available amount"
        );
        setSelectedOption("");
      } else {
        const weekRepeatedArr = createStructuraldata(
          availableWeeks,
          availableDateArr,
          prevTableData,
          milestoneAutoAmount
        );
        setTableData([...prevTableData, ...weekRepeatedArr]);
      }
    }
    setMilestoneDeliverables("");
    setMilestoneAutoAmount("");
    setSelectedOption("");
  };

  const handleAutoFillSplitRow = () => {
    const prevTableData = tableData;
    let milestoneAmount = parseFloat(milestoneAutoAmount);
    if (selectedOption === "monthly") {
      const availableMonths = calculatedData.numberOfPeriods;
      const availableDateArr = calculatedData.dates;
      milestoneAmount = milestoneAmount / availableMonths;
      const monthlyRepeatedArr = createStructuraldata(
        availableMonths,
        availableDateArr,
        prevTableData,
        milestoneAmount
      );
      setTableData([...prevTableData, ...monthlyRepeatedArr]);
    }
    if (selectedOption === "biWeekly") {
      const availableBiWeeks = calculatedData.numberOfPeriods;
      const availableDateArr = calculatedData.dates;
      const prevTableData = tableData;
      milestoneAmount = milestoneAmount / availableBiWeeks;
      const biWeekRepeatedArr = createStructuraldata(
        availableBiWeeks,
        availableDateArr,
        prevTableData,
        milestoneAmount
      );
      setTableData([...prevTableData, ...biWeekRepeatedArr]);
    }
    if (selectedOption === "weekly") {
      const availableWeeks = calculatedData.numberOfPeriods;
      const availableDateArr = calculatedData.dates;
      milestoneAmount = milestoneAmount / availableWeeks;
      const weekRepeatedArr = createStructuraldata(
        availableWeeks,
        availableDateArr,
        prevTableData,
        milestoneAmount
      );
      setTableData([...prevTableData, ...weekRepeatedArr]);
    }
    setMilestoneDeliverables("");
    setMilestoneAutoAmount("");
    setSelectedOption("");
  };

  const handleAddRow = () => {
    if (!selectedContract || !mileStoneName) {
      const error = new Error(translate("Enter all mandatory fields !"));
      displayError(enqueueSnackbar, error, { anchorOrigin });
      return;
    }
    const existingTotal = tableData.reduce(
      (acc, current) => acc + Number(current.milestoneAmount),
      0
    );

    const selectedContractAmount = tryParseNumber(
      selectedContract.total_contract_amount
    );

    const proposedTotal = existingTotal + tryParseNumber(milestoneAmount);

    if (proposedTotal > selectedContractAmount && !selectedContract) {
      const error = new Error(translate("error.Add"));
      displayError(enqueueSnackbar, error, { anchorOrigin });
      return;
    }

    const newRow = getMileStoneTableRow(
      (tableData?.length ?? 0) + 1,
      startDateValue,
      milestoneDeliverables,
      milestoneAmount
    );
    setTableData((prevTableData) => [...prevTableData, newRow]);

    setStartDateValue(null);
    setMilestoneDeliverables("");
    setMilestoneAmount("");
  };

  const handleMilestoneAmountChange = (value) => {
    if (parseFloat(value) < 0) {
      setError("Milestone amount must be non-negative");
    } else if (parseFloat(value) === 0) {
      setError("Milestone amount must be non-zero");
    } else if (
      parseFloat(value) >
      (
        tryParseNumber(selectedContractAmount) - tryParseNumber(totalAmount)
      ).toFixed(2)
    ) {
      setError(
        "The entered amount cannot exceed the remaining contract amount."
      );
    } else {
      setError("");
      setErrorMessageText("");
    }
    setMilestoneAmount(value);
  };

  const handleAutoMilestoneAmountChange = (value) => {
    if (parseFloat(value) < 0) {
      setError("Milestone amount must be non-negative");
    } else if (parseFloat(value) === 0) {
      setError("Milestone amount must be non-zero");
    } else if (
      parseFloat(value) >
      (
        tryParseNumber(selectedContractAmount) - tryParseNumber(totalAmount)
      ).toFixed(2)
    ) {
      setError(
        "The entered amount cannot exceed the remaining contract amount."
      );
    } else {
      setError("");
      setErrorMessageText("");
    }
    setMilestoneAutoAmount(value);
  };

  const tryParseNumber = (value) => {
    try {
      return Number(value) || 0;
    } catch (error) {
      console.error("Error parsing number:", error);
      return 0;
    }
  };

  // const onError = (message) => {
  //   displayError(enqueueSnackbar, new Error("MileStone - " + message), {
  //     anchorOrigin,
  //   });
  // };
  const onError = (message) => {
    enqueueSnackbar("MileStone - " + message, {
      anchorOrigin,
      variant: "error",
    });
  };
  const onAddedSuccess = () => {
    enqueueSnackbar(
      translate(isEditMode ? "message.update" : "message.create"),
      { anchorOrigin }
    );
    onAddMilestone();
  };

  const handleCreateMileStone = async () => {
    if (selectedClient.uuid) {
      const payload = {
        client_uuid: selectedClient.uuid,
        contract_sow_uuid: selectedContract.uuid,
        milestones: tableData,
        milestone_total_amount: totalAmount.toFixed(2),
        name: mileStoneName,
      };

      requestAddMileStone(payload);
    }
  };

  function callOnError() {
    onError(translate(isEditMode ? "error.update" : "error.create"));
  }

  async function requestAddMileStone(payload) {
    try {
      const response = isEditMode
        ? await MilestoneAPI.UPDATE(axiosPrivate, mileStoneData.uuid, payload)
        : await MilestoneAPI.ADD(axiosPrivate, payload);
      if (isValidResponse(response)) {
        onAddedSuccess();
      } else {
        callOnError();
      }
    } catch (error) {
      displayError(enqueueSnackbar, error, { anchorOrigin });
      console.log("Error in requestAddMileStone ", error);
    }
  }
  useEffect(() => {
    if (isEditMode) {
      checkedit();
    }
  }, [contractDataList]);

  async function fetchSOWContracts() {
    if (selectedClient.uuid) {
      try {
        const response = await ContractAPI.LIST(
          axiosPrivate,
          selectedClient.uuid,
          1,
          1000
        );

        if (isValidResponse(response)) {
          setContractDataList(response.data.results);

          // const Contract = response.data.results;
          // if (Contract) {
          //   const contractStartDate = new Date(Contract.start_date);
          //   setStartDateValue(contractStartDate);
          // }
          setIsLoading(false);
          if (isEditMode) {
            checkedit();
          }
        } else {
          onError(translate("error.fetch"));
        }
      } catch (error) {
        console.log("Error in fetchSOWContracts : ", error);
        onError(translate("error.fetch"));
      }
    }
  }
  async function checkMileStoneNameTaken(payload) {
    try {
      const response = await ContractAPI.MILESTONENAMECHECK(
        axiosPrivate,
        payload
      );
      console.log(response);
      setMileStoneNameExist(response?.data?.exists);
    } catch (error) {
      console.log("Error in checking mileStone name Exist or not ", error);
      callOnError();
    }
  }
  function checkedit() {
    const contract = contractDataList?.find(
      (item) => item?.contractsow_name === mileStoneData?.contractsow_name
    );
    if (contract) {
      setSelectedContract(contract);
      setSelectedContractAmount(contract.total_contract_amount);
      setSelectedContractStartDate(
        new Date(contract.start_date).toDateString()
      );
      setSelectedContractEndDate(new Date(contract.end_date).toDateString());
    }
  }

  const isCreateDisabled = () => {
    if (isEditMode) {
      return (
        !selectedContract.uuid ||
        !mileStoneName ||
        tableData.length === 0 ||
        !isMilestoneDataChanged
      );
    } else {
      if (milestoneRedirectionId) {
        return true;
      }
      return !selectedContract.uuid || !mileStoneName || tableData.length === 0;
    }
  };

  const handleWeeklyChange = () => {
    if (
      customStartDate &&
      customEndDate &&
      milestoneAutoAmount &&
      milestoneDeliverables
    ) {
      setCalculatedData({});
      setSelectedOption("weekly");
      const weeklyData = calculation(customStartDate, customEndDate, "weekly");
      setCalculatedData(weeklyData);
    } else {
      setErrorMessageText("Enter mandatory fields");
      setCalculatedData({});
    }
  };

  const handleBiWeeklyChange = () => {
    if (
      customStartDate &&
      customEndDate &&
      milestoneAutoAmount &&
      milestoneDeliverables
    ) {
      setCalculatedData({});
      setSelectedOption("biWeekly");
      const biweeklydata = calculation(
        customStartDate,
        customEndDate,
        "bi-weekly"
      );
      setCalculatedData(biweeklydata);
    } else {
      setCalculatedData({});
      setErrorMessageText("Enter mandatory fields");
    }
  };

  function calculation(startDate, endDate, option) {
    // Convert date strings into Date objects
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Initialize an array to store the calculated dates
    const dates = [];
    // Initialize a counter for the number of periods
    let numberOfPeriods = 0;

    // Function to format dates as MM/DD/YYYY
    function formatDate(date) {
      const month = ("0" + (date.getMonth() + 1)).slice(-2);
      const day = ("0" + date.getDate()).slice(-2);
      const year = date.getFullYear();
      return `${month}/${day}/${year}`;
    }

    // Helper function to get the next Friday after a given date
    const getNextFriday = (date) => {
      const result = new Date(date);
      result.setDate(result.getDate() + ((5 - result.getDay() + 7) % 7)); // 5 is Friday
      result.setHours(0, 0, 0, 0); // Set to start of the day
      return result;
    };

    switch (option) {
      case "monthly":
        let currentDate = new Date(start);
        currentDate.setMonth(currentDate.getMonth() + 1); // Start calculation from the next month
        while (currentDate <= end) {
          const day = currentDate.getDay();
          if (currentDate < end) {
            if (day === 6) {
              // Saturday
              currentDate.setDate(currentDate.getDate() + 2); // Move to Monday
            } else if (day === 0) {
              // Sunday
              currentDate.setDate(currentDate.getDate() + 1); // Move to Monday
            }
          }
          dates.push(formatDate(currentDate));
          numberOfPeriods++; // Increment the count of periods
          currentDate.setMonth(currentDate.getMonth() + 1);
          // Handle cases where the next month has fewer days
          if (currentDate.getDate() < start.getDate()) {
            currentDate.setDate(0); // Go to the last day of the previous month
          }
        }
        // Check if there's a remaining period to include
        if (currentDate > end) {
          dates.push(formatDate(end));
          numberOfPeriods++; // Increment the count for the end date period
        }
        break;

      case "bi-weekly":
        // Find the first Friday after the start date
        const firstFriday = getNextFriday(start);

        // Calculate the second Friday, which is two weeks after the first Friday
        const secondFriday = new Date(firstFriday);
        secondFriday.setDate(firstFriday.getDate() + 14);

        // Check if the second Friday is after the end date
        if (secondFriday > end) {
          dates.push(formatDate(end));
          numberOfPeriods = 1; // Only one period, which is the end date
          break;
        }

        // Start with the second Friday for bi-weekly calculations
        let currentFriday = secondFriday;

        // Calculate bi-weekly Fridays
        while (currentFriday <= end) {
          dates.push(formatDate(currentFriday));
          numberOfPeriods++;
          // Move to the next bi-weekly Friday
          currentFriday.setDate(currentFriday.getDate() + 14);
        }

        // Handle any remaining days after the last bi-weekly Friday
        if (
          currentFriday > end &&
          dates[dates.length - 1] !== formatDate(end)
        ) {
          // Only push the end date if it wasn't already added
          if (currentFriday - 14 !== end.getTime()) {
            dates.push(formatDate(end));
            numberOfPeriods++; // Include the end date period
          }
        }
        break;
      case "weekly":
        const firstFridayWeekly = getNextFriday(start);
        // Check if the first Friday is beyond the end date
        if (firstFridayWeekly > end) {
          dates.push(formatDate(end));
          numberOfPeriods = 1; // Only one period, which is the end date
          break;
        }

        // Add all Fridays to the array
        let currentFridayWeekly = firstFridayWeekly;
        while (currentFridayWeekly <= end) {
          dates.push(formatDate(currentFridayWeekly));
          numberOfPeriods++;
          // Move to the next Friday
          currentFridayWeekly.setDate(currentFridayWeekly.getDate() + 7);
        }

        // Handle any remaining days after the last Friday
        if (
          currentFridayWeekly > end &&
          dates[dates.length - 1] !== formatDate(end)
        ) {
          dates.push(formatDate(end));
          numberOfPeriods++; // Include the end date period
        }
        break;

      default:
        throw new Error(
          'Invalid option. Use "monthly", "bi-weekly", or "weekly".'
        );
    }
    return {
      dates,
      numberOfPeriods,
    };
  }

  const handleMonthlyChange = () => {
    if (
      customStartDate &&
      customEndDate &&
      milestoneAutoAmount &&
      milestoneDeliverables
    ) {
      setCalculatedData({});
      setSelectedOption("monthly");
      const monthlydata = calculation(
        customStartDate,
        customEndDate,
        "monthly"
      );
      setCalculatedData(monthlydata);
    } else {
      setCalculatedData({});
      setErrorMessageText("Enter mandatory fields");
    }
  };

  function createStructuraldata(
    number,
    availableDateArr,
    prevTableData,
    milestoneAutoAmount
  ) {
    const startMilestoneNumber =
      prevTableData.length > 0
        ? prevTableData[prevTableData.length - 1].milestoneNumber + 1
        : 1;
    const newMilestones = availableDateArr.map((date, index) => ({
      startDateValue: date,
      milestoneAmount: milestoneAutoAmount,
      milestoneNumber: startMilestoneNumber + index,
      milestoneDeliverables: milestoneDeliverables,
    }));
    return newMilestones;
  }

  function handleAutoFillClick() {
    setSelected("autoFill");

    if (selectedContract && tableData.length <= 0) {
      // When no tableData is present, set dates from selected contract
      setCustomEndDate(selectedContractEndDate);
      setCustomStartDate(selectedContractStartDate);
    }

    if (tableData.length >= 1) {
      let latestDateObj = new Date(0);

      // Find the latest date from tableData
      tableData.forEach((element) => {
        const currentDate = new Date(element.startDateValue);
        if (currentDate > latestDateObj) {
          latestDateObj = currentDate;
        }
      });

      const nextDateObj = new Date(latestDateObj);
      nextDateObj.setDate(latestDateObj.getDate() + 1);
      // Adjust `nextDateObj` if it falls on a weekend
      const dayOfWeek = nextDateObj.getDay();
      if (dayOfWeek === 6) {
        // Saturday
        nextDateObj.setDate(nextDateObj.getDate() + 2); // Move to Monday
      } else if (dayOfWeek === 0) {
        // Sunday
        nextDateObj.setDate(nextDateObj.getDate() + 1); // Move to Monday
      }
      // Convert to MM/DD/YYYY format
      const year = nextDateObj.getFullYear();
      const month = String(nextDateObj.getMonth() + 1).padStart(2, "0"); // Month is 0-indexed, so add 1
      const day = String(nextDateObj.getDate()).padStart(2, "0");
      const finalFormattedDate = `${month}/${day}/${year}`;

      // Convert formatted date to Date object for comparison
      const finalStartDate = new Date(nextDateObj);
      const formatDateToMMDDYYYY = (date) => {
        if (!date) return "";
        const d = new Date(date);
        const formattedMonth = String(d.getMonth() + 1).padStart(2, "0");
        const formattedDay = String(d.getDate()).padStart(2, "0");
        const formattedYear = d.getFullYear();
        return `${formattedMonth}/${formattedDay}/${formattedYear}`;
      };

      const endDateFormatted = customEndDate
        ? formatDateToMMDDYYYY(customEndDate)
        : "";

      if (formatDateToMMDDYYYY(finalStartDate) > endDateFormatted) {
        // If the calculated start date is greater than the end date, clear both
        console.log("All date span is Completed");
        setCustomEndDate(null);
        setCustomStartDate(null);
      } else {
        // Otherwise, set the custom start date
        setCustomStartDate(finalFormattedDate);
      }

      if (tableData.length >= 1) {
        if (finalFormattedDate > endDateFormatted) {
          setCustomEndDate(null);
          setCustomStartDate(null);
          console.log("All date span is Completed");
        } else {
          setCustomStartDate(finalFormattedDate);
          setCustomEndDate(selectedContractEndDate);
        }
      }
    }
  }

  const disabledRangeAndWeekend = (date, startDate, endDate) => {
    // Convert dates to Date objects for comparison
    const start = new Date(startDate);
    const end = new Date(endDate);

    // Check if the date is outside the specified range
    if (date < start || date > end) {
      return true;
    }

    // Check if the date falls on a weekend (0 = Sunday, 6 = Saturday)
    const dayOfWeek = date.getDay();
    if (dayOfWeek === 0 || dayOfWeek === 6) {
      return true;
    }

    // Date is within range and not a weekend, so it's enabled
    return false;
  };

  return (
    <div>
      <>
        <Box sx={styles.modalHeader}>
          <HighlightOffIcon onClick={handleClose} sx={styles.closeIcon} />
          <Typography variant="h5">
            {translate(
              isEditMode
                ? "MILESTONES.EDIT_MILESTONE"
                : "MILESTONES.ADD_MILESTONE"
            )}
          </Typography>
        </Box>
        {milestoneRedirectionId && !isEditMode && (
          <Box>
            <Stack direction={"row"}>
              <Typography
                sx={{ color: "red", fontSize: "12px", marginLeft: "1rem" }}
              >
                For this contract the milestone is already exists.
              </Typography>
              <Typography
                onClick={gotoMilestonePage}
                sx={{
                  color: "blue",
                  fontSize: "12px",
                  cursor: "pointer",
                  textDecoration: "underline",
                }}
              >
                Click here to view
              </Typography>
            </Stack>
          </Box>
        )}
        <Box sx={styles.section}>
          <Grid container spacing={2}>
            {/* <Stack direction="row" spacing={2}> */}
            <Grid item xs={12} sm={6} md={6}>
              <TextField
                disabled={isEditMode}
                select
                fullWidth
                error={isDropdownClicked && contractDataList?.length === 0}
                helperText={
                  isDropdownClicked && contractDataList?.length === 0
                    ? translate("No contracts available")
                    : ""
                }
                label={
                  <MandatoryTextField
                    label={translate("CONTRACTS.CONTRACT_NAME")}
                  />
                }
                value={selectedContract}
                onChange={onContractChange}
                SelectProps={{
                  onOpen: handleDropdownOpen,
                }}
                FormHelperTextProps={{
                  sx: { marginTop: 2 }, // Adjust the margin top value as needed
                }}
              >
                {contractDataList?.map((item) => (
                  <MenuItem key={item.uuid} value={item}>
                    {item.contractsow_name}
                  </MenuItem>
                ))}
              </TextField>
            </Grid>
            <Grid item xs={12} sm={6} md={6}>
              <TextField
                disabled={isEditMode}
                label={
                  <MandatoryTextField
                    label={translate("MILESTONES.MILESTONE_NAME")}
                  />
                }
                value={mileStoneName}
                inputProps={{ maxLength: 50 }}
                onChange={(e) => {
                  const newValue = e.target.value.replace(
                    /[^A-Za-z0-9\s]/g,
                    ""
                  );
                  setMileStoneName(newValue);
                  checkMileStoneNameTaken({ name: newValue });
                }}
                error={milestoneNameExist}
                helperText={
                  milestoneNameExist
                    ? translate(
                        "Milestone name already taken. Please choose a different one."
                      )
                    : ""
                }
                size="medium"
                variant="outlined"
                sx={styles.inputField}
              />
            </Grid>
          </Grid>
        </Box>

        {selectedContract.contractsow_name && (
          <Box>
            <Stack
              sx={{
                backgroundColor: "#f3efff",
                height: "40px",
                marginLeft: "15px",
                display: "inline-flex",
                alignItems: "center",
                borderRadius: "4px",
              }}
              direction={"row"}
              spacing={1}
            >
              <Typography sx={{ paddingLeft: "10px" }}>
                {translate("CONTRACTS.TOTAL_CONTRACT_AMOUNT") +
                  ":" +
                  selectedContractAmount}
              </Typography>
              <Typography>|</Typography>
              <Typography sx={{ paddingRight: "10px" }}>
                {translate("CONTRACTS.REMAINING_CONTRACT_AMOUNT") +
                  ": " +
                  (
                    tryParseNumber(selectedContractAmount) -
                    tryParseNumber(totalAmount)
                  ).toFixed(2)}
              </Typography>
            </Stack>
          </Box>
        )}
        {selectedContract.contractsow_name && (
          <Box sx={styles.contractBox}>
            <Stack sx={{ marginLeft: "15px" }} direction={"row"} spacing={1}>
              <Typography sx={styles.contractText}>
                {translate("CONTRACTS.START_DATE") +
                  " : " +
                  selectedContractStartDate}
              </Typography>
              <Typography sx={styles.contractText}>|</Typography>
              <Typography sx={styles.contractText}>
                {translate("CONTRACTS.END_DATE") +
                  " : " +
                  selectedContractEndDate}
              </Typography>
            </Stack>
          </Box>
        )}

        <Box sx={styles.section}>
          <Box
            sx={{
              backgroundColor: "#f8f6f0",
              padding: "1rem",
              borderRadius: "5px",
            }}
          >
            <Typography variant="h6">
              {translate("Add Milestone Item")}
            </Typography>
            <ButtonGroup
              disableElevation
              variant="contained"
              aria-label="Disabled button group"
              //disabled={milestoneRedirectionId}
            >
              <Button
                onClick={() => setSelected("manual")}
                sx={{
                  backgroundColor: selected === "autoFill" ? "gray" : "primary",
                }}
              >
                Manual
              </Button>
              <Button
                sx={{
                  backgroundColor: selected === "manual" ? "gray" : "primary",
                }}
                onClick={handleAutoFillClick}
              >
                Autofill
              </Button>
            </ButtonGroup>
            {selected === "manual" ? (
              <Grid container spacing={2} marginTop="1px">
                <Grid item xs={12} sm={6} md={6}>
                  <TextField
                    type="number"
                    label={
                      <MandatoryTextField
                        label={translate("MILESTONES.MILESTONE_AMOUNT")}
                      />
                    }
                    // size="medium"
                    value={milestoneAmount}
                    inputProps={{ maxLength: 50 }}
                    variant="outlined"
                    // sx={styles.smallInputField}
                    onChange={(e) =>
                      handleMilestoneAmountChange(e.target.value)
                    }
                    error={Boolean(error)}
                    helperText={error}
                    fullWidth
                    //disabled={milestoneRedirectionId}
                  />
                </Grid>
                <Grid item xs={12} sm={6} md={6}>
                  <DatePicker
                    label={
                      <span>
                        {translate("MILESTONES.MILESTONE_DATE")}
                        <span style={{ color: "red" }}>*</span>
                      </span>
                    }
                    value={startDateValue}
                    onChange={handleStartDateChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        fullWidth
                        inputProps={{
                          ...params.inputProps,
                          readOnly: true,
                        }}
                      />
                    )}
                    inputFormat="yyyy-MM-dd"
                    // sx={styles.smallInputField}
                    minDate={selectedContractStartDate}
                    shouldDisableDate={(date) =>
                      disabledRangeAndWeekend(
                        date,
                        selectedContractStartDate,
                        selectedContractEndDate
                      )
                    }
                    PopperProps={{
                      sx: {
                        ".MuiPaper-root": {
                          maxHeight: "295px", // Adjust as necessary
                          overflowY: "auto",
                        },
                      },
                    }}
                    //disabled={milestoneRedirectionId}
                  />
                </Grid>
              </Grid>
            ) : (
              <Grid container spacing={2} marginTop="1px">
                <Grid item xs={12} sm={4} md={4}>
                  <TextField
                    type="number"
                    label={
                      <MandatoryTextField
                        label={translate("MILESTONES.ENTER_MILESTONE_AMOUNT")}
                      />
                    }
                    variant="outlined"
                    value={milestoneAutoAmount}
                    onChange={(e) =>
                      handleAutoMilestoneAmountChange(e.target.value)
                    }
                    fullWidth
                    error={Boolean(error)}
                    helperText={error}
                  />
                </Grid>
                <Grid item xs={12} sm={4} md={4}>
                  <DatePicker
                    views={["year", "month", "day"]}
                    label={
                      <span>
                        Start Date<span style={{ color: "red" }}>*</span>
                      </span>
                    }
                    value={customStartDate}
                    onChange={handleCustomStartDateChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        helperText={null}
                        fullWidth
                        inputProps={{
                          ...params.inputProps,
                          readOnly: true,
                        }}
                      />
                    )}
                    inputFormat="yyyy-MM-dd"
                    shouldDisableDate={(date) =>
                      disabledRangeAndWeekend(
                        date,
                        selectedContractStartDate,
                        selectedContractEndDate
                      )
                    }
                  />
                </Grid>
                <Grid item xs={12} sm={4} md={4}>
                  <DatePicker
                    views={["year", "month", "day"]}
                    label={
                      <span>
                        End Date <span style={{ color: "red" }}>*</span>
                      </span>
                    }
                    value={customEndDate}
                    onChange={handleCustomEndDateChange}
                    renderInput={(params) => (
                      <TextField
                        {...params}
                        helperText={null}
                        fullWidth
                        inputProps={{
                          ...params.inputProps,
                          readOnly: true,
                        }}
                      />
                    )}
                    inputFormat="yyyy-MM-dd"
                    shouldDisableDate={(date) =>
                      disabledRangeAndWeekend(
                        date,
                        selectedContractStartDate,
                        selectedContractEndDate
                      )
                    }
                    minDate={customStartDate}
                  />
                </Grid>
              </Grid>
            )}
            <Grid container spacing={2} marginTop="1px">
              <Grid item xs={12} sm={12} md={12}>
                <TextField
                  label={
                    <MandatoryTextField
                      label={translate("MILESTONES.MILESTONE_DELIVERABLES")}
                    />
                  }
                  value={milestoneDeliverables}
                  inputProps={{ maxLength: 50 }}
                  variant="outlined"
                  onChange={(e) => {
                    setMilestoneDeliverables(e.target.value);
                    setErrorMessageText("");
                  }}
                  fullWidth
                  //disabled={milestoneRedirectionId}
                />
                {errorMessage && (
                  <Typography
                    sx={{ color: "red", marginTop: "5px" }}
                    error={errorMessage}
                  >
                    {errorMessage}
                  </Typography>
                )}
              </Grid>
              <Grid item xs={12}>
                <Box display="flex" width="100%" sx={{ alignItems: "center" }}>
                  {selected === "autoFill" && (
                    <FormGroup row>
                      <Tooltip
                        title={
                          dateDisableSettings.isWeekDisabled
                            ? "The selected date range is invalid for this option. Please select a different date range."
                            : ""
                        }
                        arrow
                      >
                        <span>
                          <FormControlLabel
                            control={
                              <Checkbox
                                disabled={dateDisableSettings.isWeekDisabled}
                                checked={selectedOption === "weekly"}
                                onChange={handleWeeklyChange}
                              />
                            }
                            label="Every Week"
                          />
                        </span>
                      </Tooltip>
                      <Tooltip
                        title={
                          dateDisableSettings.isBiWeekDisabled
                            ? "The selected date range is invalid for this option. Please select a different date range."
                            : ""
                        }
                        arrow
                      >
                        <span>
                          <FormControlLabel
                            control={
                              <Checkbox
                                disabled={dateDisableSettings.isBiWeekDisabled}
                                checked={selectedOption === "biWeekly"}
                                onChange={handleBiWeeklyChange}
                              />
                            }
                            label="Every 2-Week"
                          />
                        </span>
                      </Tooltip>
                      <Tooltip
                        title={
                          dateDisableSettings.isMonthDisabled
                            ? "The selected date range is invalid for this option. Please select a different date range."
                            : ""
                        }
                        arrow
                      >
                        <span>
                          <FormControlLabel
                            control={
                              <Checkbox
                                disabled={dateDisableSettings.isMonthDisabled}
                                checked={selectedOption === "monthly"}
                                onChange={handleMonthlyChange}
                              />
                            }
                            label="Every Month"
                          />
                        </span>
                      </Tooltip>
                    </FormGroup>
                  )}
                  {selected === "manual" ? (
                    <Button
                      variant="contained"
                      color="secondary"
                      sx={styles.addButton}
                      onClick={handleAddRow}
                      disabled={
                        !startDateValue ||
                        !milestoneDeliverables ||
                        !milestoneAmount ||
                        Number(milestoneAmount) < 1 ||
                        error
                      }
                      size="small"
                    >
                      {translate("add")}
                    </Button>
                  ) : (
                    <>
                      <Button
                        variant="contained"
                        color="secondary"
                        sx={styles.addButton}
                        onClick={handleAutoFillSplitRow}
                        disabled={
                          !milestoneDeliverables ||
                          !milestoneAutoAmount ||
                          !selectedOption ||
                          error
                        }
                        size="small"
                      >
                        {translate("Split Amount")}
                      </Button>
                      <Button
                        variant="contained"
                        color="secondary"
                        sx={styles.addButton}
                        onClick={handleAutoFillRepeatRow}
                        disabled={
                          !milestoneDeliverables ||
                          !milestoneAutoAmount ||
                          !selectedOption ||
                          error
                        }
                        size="small"
                      >
                        {translate("Repeat")}
                      </Button>
                    </>
                  )}
                </Box>
              </Grid>
            </Grid>
          </Box>
        </Box>
        <Box sx={styles.section}>
          <MilestoneTable tableData={tableData} onDeleteRow={handleDeleteRow} />
        </Box>

        <Box sx={styles.section} onClick={handleCreateMileStone}>
          <Button
            color="primary"
            variant="contained"
            sx={styles.createButton}
            disabled={isCreateDisabled()}
          >
            {translate(
              isEditMode
                ? "MILESTONES.UPDATE_MILESTONES"
                : "MILESTONES.CREATE_MILESTONES"
            )}
          </Button>
        </Box>
      </>
    </div>
  );
}

export default AddMilestoneModal;
