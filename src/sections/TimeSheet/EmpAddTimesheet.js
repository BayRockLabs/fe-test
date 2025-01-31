import React, { useEffect, useState } from "react";
import useLocales from "../../hooks/useLocales";
import { createStyles } from "@mui/styles";
import { useTheme } from "@emotion/react";
import { useData } from "../../contexts/DataContext";
import { isValidResponse } from "../../hooks/useAxiosPrivate";
import { axiosPrivate } from "../../services/axios";
import TimeSheetAPI from "../../services/TimeSheetService";
import { anchorOrigin, TIMESHEET_STATUS } from "../../utils/constants";
import { useSnackbar } from "notistack";
import { fDateDMY, fDateMDY } from "../../utils/formatTime";
import AddTimesheetForm from "./AddTimesheetForm";

export default function EmpAddTimesheet({
  employeeId,
  handleClose,
  ongoingProjectArr,
  clinetNameArr,
  weekWiseTimesheetPage,
  alocatedDataHrs,
  isOngoingWeek,
  isRecall,
  setIsRecall,
}) {
  const { translate } = useLocales();
  const { userData } = useData();
  const theme = useTheme();
  const styles = useStyles(theme);
  const { enqueueSnackbar } = useSnackbar();
  const [totalHrs, setTotalHrs] = useState("");
  const [totalBillableHrs, setTotalBillableHrs] = useState("");
  const [allocatedClientData, setAllocatedClientData] = useState(
    weekWiseTimesheetPage ? alocatedDataHrs : []
  );
  const [billableHours, setBillableHours] = useState({});
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [weekNumber, setWeekNumber] = useState(0);
  const [currentYear, setCurrentYear] = useState();
  const [checkedStates, setCheckedStates] = useState({});
  const [errorMessage, setErrorMessage] = useState("");
  const [errorMessageUnplanned, setErrorMessageUnplanned] = useState("");
  const [errorMessageTimeOff, setErrorMessageTimeOff] = useState("");
  const [errorMessageBillable, setErrorMessageBillable] = useState("");
  const [unPlannedHrs, setUnPlannedHrs] = useState("");
  const [unPlannedHrsCmt, setUnPlannedHrsCmt] = useState("");
  const [timeOffHrs, setTimeOffHrs] = useState("");
  const [timeOffHrsCmt, setTimeOffHrsCmt] = useState("");
  const [errorMessagesBillable, setErrorMessagesBillable] = useState({});
  const [timesheetStatus, setTimesheetStatus] = useState("");
  const [unPlannedHrsCmtError, setUnPlannedHrsCmtError] = useState("");
  const [timeOffHrsCmtError, setTimeOffHrsCmtError] = useState("");
  const [isLoading, setLoading] = useState(false);

  useEffect(() => {
    if (weekWiseTimesheetPage && alocatedDataHrs) {
      setStartDate(alocatedDataHrs[0].start_date);
      setEndDate(alocatedDataHrs[0].end_date);
      setWeekNumber(alocatedDataHrs[0].week_number);
    }
    setCurrentYear(new Date().getFullYear());
  }, [weekWiseTimesheetPage, alocatedDataHrs]);

  useEffect(() => {
    const totalMinutes = Object.values(billableHours).reduce(
      (acc, curr) => acc + timeToMinutes(curr),
      0
    );
    const totalBillable = minutesToTime(totalMinutes);
    setTotalBillableHrs(totalBillable);
  }, [billableHours]);

  useEffect(() => {
    const totalBillableMinutes = timeToMinutes(totalBillableHrs);
    const unPlannedMinutes = timeToMinutes(unPlannedHrs);
    const timeOffMinutes = timeToMinutes(timeOffHrs);
    const totalMinutes =
      totalBillableMinutes + unPlannedMinutes + timeOffMinutes;
    if (totalMinutes > 2400) {
      setErrorMessage("Total hours exceed 40:00. Please adjust your entries.");
      setTotalHrs(minutesToTime(totalMinutes));
    } else if (totalMinutes === 2400) {
      setTotalHrs("40:00");
      setErrorMessage("");
    } else {
      setErrorMessage("");
      setTotalHrs(minutesToTime(totalMinutes));
    }
  }, [totalBillableHrs, unPlannedHrs, timeOffHrs]);

  function timeToMinutes(time) {
    if (!time) {
      return 0;
    }
    const [hours, minutes] = time.split(":").map(Number);
    return hours * 60 + minutes;
  }

  function minutesToTime(minutes) {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${String(hours).padStart(2, "0")}:${String(mins).padStart(2, "0")}`;
  }

  async function fetchOngoingProjectAllocatedHrsData(payload) {
    try {
      setLoading(true);
      const response = await TimeSheetAPI.TIMESHEET_ONGOING_ALLOCATEDHRS(
        axiosPrivate,
        payload
      );
      if (response && response.status === 200) {
        if (Array.isArray(response.data.timesheets)) {
          setAllocatedClientData(response.data.timesheets);
          setTimesheetStatus(response.data.timesheets[0]?.timesheet_status);
          setStartDate(response.data.timesheets[0].week_start_date);
          setEndDate(response.data.timesheets[0].week_end_date);
          setWeekNumber(response.data.week_number);

          if (
            timesheetStatus === TIMESHEET_STATUS.submitted ||
            TIMESHEET_STATUS.recall
          ) {
            const billableHours = response.data.timesheets.reduce(
              (prev, curr) => {
                return {
                  ...prev,
                  [curr.contract_sow_name]: `${curr.billable_hours}`,
                };
              },
              {}
            );
            setBillableHours(billableHours);
            setUnPlannedHrs(`${response.data.unplanned_hours}`);
            setTimeOffHrs(`${response.data.timeoff_hours}`);
            setUnPlannedHrsCmt(response.data.unplanned_hours_comments);
            setTimeOffHrsCmt(response.data.timeoff_hours_comments);
          }
        } else {
          setAllocatedClientData([]);
        }
      } else {
        console.error("Invalid response:", response);
      }
    } catch (error) {
      console.log("Error while getting allocated hours:", error);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    const fetchData = async () => {
      try {
        const userEmail = userData?.user_info?.email;
        const clientNames =
          ongoingProjectArr?.map((item) => item.client_name) || [];

        const payload =
          !weekWiseTimesheetPage && isOngoingWeek
            ? {
                employee_email: userEmail,
                client_names: weekWiseTimesheetPage
                  ? clinetNameArr
                  : clientNames,
              }
            : alocatedDataHrs?.length > 0
            ? {
                employee_email: userEmail,
                start_date: fDateMDY(alocatedDataHrs[0].start_date),
                end_date: fDateMDY(alocatedDataHrs[0].end_date),
              }
            : null;

        if (payload && !isRecall) {
          await fetchOngoingProjectAllocatedHrsData(payload);
        }
      } catch (error) {
        console.error("Error fetching data:", error);
      }
    };

    fetchData();
  }, []);

  const fetchRecallTimesheet = async (payload) => {
    setLoading(true);
    try {
      const response = await TimeSheetAPI.RECALL_TIMESHEET(
        axiosPrivate,
        payload
      );
      if (response && response.status === 200) {
        setAllocatedClientData(response.data.timesheets);
        setTimesheetStatus(response.data.timesheets[0]?.timesheet_status);
        const billableHours = response.data.timesheets.reduce((prev, curr) => {
          return {
            ...prev,
            [curr.contract_sow_name]: `${curr.billable_hours}`,
          };
        }, {});
        setBillableHours(billableHours);
        setUnPlannedHrs(`${response.data.unplanned_hours}`);
        setTimeOffHrs(`${response.data.timeoff_hours}`);
        setUnPlannedHrsCmt(response.data.unplanned_hours_comments);
        setTimeOffHrsCmt(response.data.timeoff_hours_comments);
      } else {
        console.error("Invalid response:", response);
      }
    } catch (error) {
      console.error("Error fetching timesheet:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const fetchData = async () => {
      if (isRecall) {
        setStartDate(alocatedDataHrs[0].start_date);
        setEndDate(alocatedDataHrs[0].end_date);
        const payload = {
          employee_email: userData?.user_info?.email,
          start_date: fDateMDY(alocatedDataHrs[0].start_date),
          end_date: fDateMDY(alocatedDataHrs[0].end_date),
        };

        try {
          await fetchRecallTimesheet(payload);
          setIsRecall(false);
        } catch (error) {
          console.error("Error fetching recall timesheet:", error);
        }
      }
    };

    fetchData();
  }, []);

  function getCurrentWeekInfo() {
    const today = new Date();
    const currentDate = new Date(today);
    const startOfWeek = new Date(currentDate);
    startOfWeek.setDate(
      currentDate.getDate() -
        (currentDate.getDay() === 0 ? 6 : currentDate.getDay() - 1)
    );
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    const weekNumber = getWeekNumber(currentDate);
    return {
      weekNumber,
      startOfWeek,
      endOfWeek,
    };
  }
  function getWeekNumber(date) {
    const currentDate = new Date(date);
    currentDate.setHours(0, 0, 0, 0);
    currentDate.setDate(
      currentDate.getDate() + 4 - (currentDate.getDay() || 7)
    );
    const yearStart = new Date(currentDate.getFullYear(), 0, 1);
    const daysDifference = Math.floor(
      (currentDate - yearStart) / (24 * 60 * 60 * 1000)
    );
    return Math.floor(daysDifference / 7) + 1;
  }
  const handleCommentChange = (value, setComment, setError, hours) => {
    const regex = /^[a-zA-Z0-9,.\- ]*$/; // Allow 0
    const maxLength = 300;

    setComment(value);
    if (!value.trim() && /[1-9]/.test(hours)) {
      setError("Comment is required.");
    } else if (!regex.test(value)) {
      setError("Only alphabets, digits, comma, full stop, hyphen are allowed.");
    } else if (value.length > maxLength) {
      setError(`Maximum length of ${maxLength} characters exceeded.`);
    } else if (!/[1-9]/.test(hours) && !value.trim()) {
      setError("");
    } else {
      setError(`${value.length}/${maxLength}`);
    }
  };

  const handleUnplannedHrsCmtAdded = (e) => {
    handleCommentChange(
      e.target.value,
      setUnPlannedHrsCmt,
      setUnPlannedHrsCmtError,
      unPlannedHrs
    );
  };

  const handleTimeOffHrsCmtAdded = (e) => {
    handleCommentChange(
      e.target.value,
      setTimeOffHrsCmt,
      setTimeOffHrsCmtError,
      timeOffHrs
    );
  };

  const handleHrsChange = (type, part, e) => {
    const value = e.target.value;
    const currentHrs = type === "unplanned" ? unPlannedHrs : timeOffHrs;

    if (value.length > 2) {
      return;
    }
    let isValid = true;
    let updatedHrs = "";
    if (part === "hours") {
      const [_, minutes] = currentHrs.split(":");
      if (value > 40) {
        isValid = false;
        if (type === "unplanned") {
          setErrorMessageUnplanned("Hours cannot exceed 40.");
        } else {
          setErrorMessageTimeOff("Hours cannot exceed 40.");
        }
      }
      const updatedMinutes =
        (value && !minutes) || minutes.trim() === "" ? "00" : minutes;
      updatedHrs = value ? `${value}:${updatedMinutes}` : `:${updatedMinutes}`;
      if (type === "unplanned") {
        setUnPlannedHrs(updatedHrs);
      } else {
        setTimeOffHrs(updatedHrs);
      }
    } else if (part === "minutes") {
      const [hours, _] = currentHrs.split(":");
      if (value > 59) {
        isValid = false;
        if (type === "unplanned") {
          setErrorMessageUnplanned("Enter hh:mm format only");
        } else {
          setErrorMessageTimeOff("Enter hh:mm format only");
        }
      }
      updatedHrs = hours ? `${hours}:${value}` : `:${value}`;
      if (type === "unplanned") {
        setUnPlannedHrs(updatedHrs);
      } else {
        setTimeOffHrs(updatedHrs);
      }
    }
    const [hours, minutes] = updatedHrs.split(":");

    if (parseInt(hours, 10) > 40) {
      isValid = false;
      if (type === "unplanned") {
        setErrorMessageUnplanned("Hours cannot exceed 40.");
      } else {
        setErrorMessageTimeOff("Hours cannot exceed 40.");
      }
    }
    if (parseInt(minutes, 10) > 59) {
      isValid = false;
      if (type === "unplanned") {
        setErrorMessageUnplanned("Enter hh:mm format only");
      } else {
        setErrorMessageTimeOff("Enter hh:mm format only");
      }
    }
    if (isValid) {
      const containsNonZeroDigit = /[1-9]/;
      if (type === "unplanned") {
        setErrorMessageUnplanned("");
        if (
          containsNonZeroDigit.test(hours) ||
          containsNonZeroDigit.test(minutes)
        ) {
          if (!unPlannedHrsCmt) {
            setUnPlannedHrsCmtError("Comment is required.");
          } else {
            setUnPlannedHrsCmtError("");
          }
        } else {
          setUnPlannedHrsCmtError("");
        }
      } else {
        setErrorMessageTimeOff("");
        if (
          containsNonZeroDigit.test(hours) ||
          containsNonZeroDigit.test(minutes)
        ) {
          if (!timeOffHrsCmt) {
            setTimeOffHrsCmtError("Comment is required.");
          } else {
            setTimeOffHrsCmtError("");
          }
        } else {
          setTimeOffHrsCmtError("");
        }
      }
    }
  };
  const handleHoursChange = (type, contractSowNames) => (e) => {
    if (type === "timeSheet") {
      const newHour = e.target.value;

      if (newHour.length > 2) {
        return;
      }

      const prevValueOfClient = billableHours[contractSowNames]
        ? billableHours[contractSowNames]
        : "00:00";
      const [hour, minute] = prevValueOfClient.split(":");
      const updatedMinute = minute || "00";
      const updatedHrs = `${newHour}:${updatedMinute}`;

      setBillableHours((prev) => ({
        ...prev,
        [contractSowNames]: updatedHrs,
      }));

      if (parseInt(newHour, 10) > 40) {
        setErrorMessagesBillable((prev) => ({
          ...prev,
          [contractSowNames]: "Hours can't exceed 40",
        }));
      } else {
        const [newHourValid, newMinuteValid] = updatedHrs.split(":");
        if (parseInt(newMinuteValid, 10) > 59) {
          setErrorMessagesBillable((prev) => ({
            ...prev,
            [contractSowNames]: "Enter in hh:mm format only",
          }));
        } else {
          setErrorMessagesBillable((prev) => ({
            ...prev,
            [contractSowNames]: "",
          }));
        }
      }
    }
  };

  useEffect(() => {
    const containsNonZeroDigit = /[1-9]/;

    // Validate unPlannedHrs and its comment
    if (!/^[a-zA-Z0-9,.\- ]*$/.test(unPlannedHrsCmt)) {
      setUnPlannedHrsCmtError(
        "Only alphabets, digits, comma, full stop, hyphen are allowed"
      );
    } else if (!containsNonZeroDigit.test(unPlannedHrs)) {
      if (unPlannedHrsCmt && unPlannedHrsCmt.trim() !== "") {
        setUnPlannedHrsCmtError("Enter hours first.");
      } else {
        setUnPlannedHrsCmtError("");
      }
    } else if (
      !unPlannedHrsCmt ||
      unPlannedHrsCmt.trim() === "" ||
      unPlannedHrsCmt === "No comment added"
    ) {
      setUnPlannedHrsCmtError("Comment is required.");
    } else {
      setUnPlannedHrsCmtError("");
    }

    // Validate timeOffHrs and its comment
    if (!/^[a-zA-Z0-9,.\- ]*$/.test(timeOffHrsCmt)) {
      setTimeOffHrsCmtError(
        "Only alphabets, digits, comma, full stop, hyphen are allowed"
      );
    } else if (!containsNonZeroDigit.test(timeOffHrs)) {
      if (timeOffHrsCmt && timeOffHrsCmt.trim() !== "") {
        setTimeOffHrsCmtError("Enter hours first.");
      } else {
        setTimeOffHrsCmtError("");
      }
    } else if (
      !timeOffHrsCmt ||
      timeOffHrsCmt.trim() === "" ||
      timeOffHrsCmt === "No comment added"
    ) {
      setTimeOffHrsCmtError("Comment is required.");
    } else {
      setTimeOffHrsCmtError("");
    }
  }, [unPlannedHrs, unPlannedHrsCmt, timeOffHrs, timeOffHrsCmt]);

  const handleMinutesChange = (type, contractSowNames) => (e) => {
    if (type === "timeSheet") {
      const newMinute = e.target.value;

      if (newMinute.length > 2) {
        return;
      }

      const prevValueOfClient = billableHours[contractSowNames]
        ? billableHours[contractSowNames]
        : "00:00";
      const [hour, minute] = prevValueOfClient.split(":");
      const updatedMinute = `${hour}:${newMinute}`;

      setBillableHours((prev) => ({
        ...prev,
        [contractSowNames]: updatedMinute,
      }));

      if (parseInt(newMinute, 10) > 59) {
        setErrorMessagesBillable((prev) => ({
          ...prev,
          [contractSowNames]: "Enter in hh:mm format only",
        }));
      } else {
        const [newHourValid, newMinuteValid] = updatedMinute.split(":");
        if (parseInt(newHourValid, 10) > 40) {
          setErrorMessagesBillable((prev) => ({
            ...prev,
            [contractSowNames]: "Hours can't exceed 40",
          }));
        } else {
          setErrorMessagesBillable((prev) => ({
            ...prev,
            [contractSowNames]: "",
          }));
        }
      }
    }
  };

  const handleCheckboxChange = (contractSowNames) => (e) => {
    setCheckedStates((prev) => ({
      ...prev,
      [contractSowNames]: e.target.checked,
    }));
  };
  const onSubmitTimesheetClick = async () => {
    setLoading(true);
    const payload = {
      employee_id: employeeId,
      year: currentYear,
      week_number: weekNumber,
      non_billable_hours: timeOffHrs || "00:00",
      unplanned_hours: unPlannedHrs || "00:00",
      total_hours: totalHrs,
      non_billable_hours_comments: timeOffHrsCmt || "",
      unplanned_hours_comments: unPlannedHrsCmt || "",
      timesheets:
        ongoingProjectArr.length === 0
          ? [{ billable_hours: "00:00" }]
          : allocatedClientData.map((item, index) => ({
              key: `${item.client_name}_${index}`,
              client_name: item.client_name,
              contract_sow_name: item.contract_sow_name,
              billable_hours: billableHours[item.contract_sow_name] || "00:00",
            })),
    };
    try {
      const response = await TimeSheetAPI.ADD_TIMESHEET(axiosPrivate, payload);
      if (isValidResponse(response)) {
        onSucces(response?.data);
        handleClose();
      }
    } catch (error) {
      console.log("Error while adding timesheet:", error);
    } finally {
      setLoading(false);
    }
  };
  const onSucces = (message) => {
    enqueueSnackbar(translate("Timesheet Submitted Successfully"), {
      anchorOrigin,
    });
  };
  const isSubmitDisabled = () => {
    if (timesheetStatus === TIMESHEET_STATUS.approved) {
      return true;
    }

    const billablehrsEntryCount = Object.keys(billableHours).length;
    const isAllBillableHrsAdded =
      billablehrsEntryCount === allocatedClientData.length;
    const validTotalHrs = totalHrs === "40:00";
    const notContainError = !(
      errorMessage ||
      errorMessageBillable ||
      errorMessageTimeOff
    );

    const hasExceedingHours = allocatedClientData.some((item) => {
      const allocatedHrs = timeToMinutes(`${item.allocated_hours}:`);
      const billableHrs = timeToMinutes(
        billableHours[item.contract_sow_name] || "00:00"
      );
      return (
        billableHrs > allocatedHrs && !checkedStates[item.contract_sow_name]
      );
    });

    const isCommentError =
      (unPlannedHrsCmtError && !unPlannedHrsCmtError.includes("/")) ||
      (timeOffHrsCmtError && !timeOffHrsCmtError.includes("/"));

    return !(
      validTotalHrs &&
      isAllBillableHrsAdded &&
      notContainError &&
      !hasExceedingHours &&
      !isCommentError
    );
  };

  return (
    <AddTimesheetForm
      isLoading={isLoading}
      handleClose={handleClose}
      startDate={startDate}
      endDate={endDate}
      totalHrs={totalHrs}
      totalBillableHrs={totalBillableHrs}
      unPlannedHrs={unPlannedHrs}
      timeOffHrs={timeOffHrs}
      errorMessage={errorMessage}
      ongoingProjectArr={ongoingProjectArr}
      allocatedClientData={allocatedClientData}
      handleHoursChange={handleHoursChange}
      billableHours={billableHours}
      handleMinutesChange={handleMinutesChange}
      errorMessagesBillable={errorMessagesBillable}
      timeToMinutes={timeToMinutes}
      checkedStates={checkedStates}
      handleCheckboxChange={handleCheckboxChange}
      handleHrsChange={handleHrsChange}
      errorMessageUnplanned={errorMessageUnplanned}
      handleUnplannedHrsCmtAdded={handleUnplannedHrsCmtAdded}
      unPlannedHrsCmtError={unPlannedHrsCmtError}
      setUnPlannedHrsCmtError={setUnPlannedHrsCmtError}
      unPlannedHrsCmt={unPlannedHrsCmt}
      errorMessageTimeOff={errorMessageTimeOff}
      handleTimeOffHrsCmtAdded={handleTimeOffHrsCmtAdded}
      timeOffHrsCmtError={timeOffHrsCmtError}
      setTimeOffHrsCmtError={setTimeOffHrsCmtError}
      timeOffHrsCmt={timeOffHrsCmt}
      isSubmitDisabled={isSubmitDisabled}
      onSubmitTimesheetClick={onSubmitTimesheetClick}
      timesheetStatus={timesheetStatus}
    />
  );
}

const useStyles = createStyles((theme) => ({
  titleStackParams: {
    direction: "row",
    spacing: 1,
    alignItems: "center",
  },
  stackParams: {
    direction: "row",
    spacing: 4,
    alignItems: "center",
    marginTop: 4,
    marginBottom: 4,
    justifyContent: "space-evenly",
  },
  docItemText: {
    fontSize: "10px",
    color: theme.palette.text.main,
  },
  contractExistError: {
    color: "red",
    fontSize: "12px",
  },
}));
