import React, { useContext, useEffect, useState } from "react";
import {
  Box,
  Stack,
  Typography,
  TableContainer,
  Paper,
  Button,
  TextField,
  CircularProgress,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useMediaQuery,
  RadioGroup,
  FormControlLabel,
  Radio,
} from "@mui/material";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import useLocales from "../../hooks/useLocales";
import TimeSheetAPI from "../../services/TimeSheetService";
import { axiosPrivate } from "../../services/axios";
import { makeStyles } from "@mui/styles";
import ApprovalTable from "./ApprovalTable";
import { useData } from "../../contexts/DataContext";
import { useSnackbar } from "notistack";
import {
  anchorOrigin,
  TIMESHEET_ROLE_INFO_MESSAGE,
  TIMESHEET_STATUS,
  TS_APPROVAL_OPTIONS,
} from "../../utils/constants";
import TimesheetContext from "../../contexts/TimesheetContext";
import ResponsivePagination from "../../theme/ResponsivePagination";
const useStyles = makeStyles({
  loaderContainer: {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    height: "100px",
  },
});

export default function TimesheetApprovals({ handleClose }) {
  const { enqueueSnackbar } = useSnackbar();
  const [expandedRow, setExpandedRow] = useState(null);
  const [recalledRow, setRecalledRow] = useState(null);
  const [recallComment, setRecallComment] = useState("");
  const [recallErrorMessage, setRecallErrorMessage] = useState("");
  const [billableHours, setBillableHours] = useState({});
  const [nonBillableHours, setNonBillableHours] = useState({});
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [rowsPerPage] = useState(10);
  const [filteredApprovals, setFilteredApprovals] = useState([]);
  const [approvals, setApprovals] = useState([]);
  const [selectedRows, setSelectedRows] = useState([]);
  const [billableErrors, setBillableErrors] = useState({});
  const [nonBillableErrors, setNonBillableErrors] = useState({});
  const [showBulkRecallDialog, setShowBulkRecallDialog] = useState(false);

  const {
    getPendingApprovalCount,
    isHrManager,
    isTsContractManager,
    isTimesheetAdmin,
    isHrAndProjectManager,
    isAdminAndProjectManager,
  } = useContext(TimesheetContext);
  const [approvalType, setApprovalType] = useState(
    isHrAndProjectManager || isAdminAndProjectManager
      ? "project_timesheets"
      : ""
  );

  const { translate } = useLocales();
  const classes = useStyles();
  const isMobile = useMediaQuery("(max-width:600px)");
  const { userData } = useData();

  const [curentTimesheet, setCurentTimesheet] = useState({});
  const [contractErrors, setContractErrors] = useState([]);
  let response = null;

  useEffect(() => {
    let errors = new Array(curentTimesheet?.contracts?.length).fill("");

    if (
      curentTimesheet?.contracts &&
      Array.isArray(curentTimesheet.contracts)
    ) {
      curentTimesheet.contracts.forEach((contract, index) => {
        const billable = billableHours[index];
        const nonBillable = nonBillableHours[index];

        const billableEntered = billable?.hours || billable?.minutes;
        const nonBillableEntered = nonBillable?.hours || nonBillable?.minutes;

        let errorMessage = "";

        if (
          (billable?.hours && !billable?.minutes) ||
          (!billable?.hours && billable?.minutes) ||
          (nonBillable?.hours && !nonBillable?.minutes) ||
          (!nonBillable?.hours && nonBillable?.minutes)
        ) {
          errorMessage = `Please enter time in HH:MM format`;
        } else if (billableEntered || nonBillableEntered) {
          const totalBillableHours =
            parseInt(billable?.hours || "0") +
            parseInt(billable?.minutes || "0") / 60;
          const totalNonBillableHours =
            parseInt(nonBillable?.hours || "0") +
            parseInt(nonBillable?.minutes || "0") / 60;

          const totalHours = totalBillableHours + totalNonBillableHours;

          if (totalHours > contract.timesheet_hours) {
            errorMessage = `Approved hours cannot be more than timesheet hours`;
          }
        }

        errors[index] = errorMessage;
      });
    }

    setContractErrors(errors);
  }, [curentTimesheet, billableHours, nonBillableHours]);

  const fetchApprovals = async (calledFromEffect = false) => {
    const payload = { approver_email: userData?.user_info?.email };
    setLoading(true);

    try {
      const roleApprovalMapping = {
        isTsContractManager: TimeSheetAPI.TIMESHEET_APPROVALS,
        isHrManager: TimeSheetAPI.TIMESHEET_APPROVALS_HR_MANAGER,
        isTimesheetAdmin: TimeSheetAPI.TIMESHEET_APPROVALS_ADMIN,
        isHrAndProjectManager: {
          project_timesheets: TimeSheetAPI.TIMESHEET_APPROVALS,
          timeoff_unplanned: TimeSheetAPI.TIMESHEET_APPROVALS_HR_MANAGER,
        },
        isAdminAndProjectManager: {
          project_timesheets: TimeSheetAPI.TIMESHEET_APPROVALS,
          system_timesheets: TimeSheetAPI.TIMESHEET_APPROVALS_ADMIN,
        },
      };

      if (isHrAndProjectManager || isAdminAndProjectManager) {
        const approvalApiMap = isHrAndProjectManager
          ? roleApprovalMapping.isHrAndProjectManager
          : roleApprovalMapping.isAdminAndProjectManager;
        const apiCall = approvalApiMap[approvalType];
        if (apiCall) {
          response = await apiCall(axiosPrivate, payload);
        }
      } else {
        const apiCall =
          roleApprovalMapping[isTsContractManager && "isTsContractManager"] ||
          roleApprovalMapping[isHrManager && "isHrManager"] ||
          roleApprovalMapping[isTimesheetAdmin && "isTimesheetAdmin"];

        if (apiCall) {
          response = await apiCall(axiosPrivate, payload);
        }
      }

      if (response) {
        console.log("----- response from fetch api", response);
        if (Array.isArray(response.data) && response.data.length > 0) {
          console.log("---- Enter into block, response is non empty");
          const formattedData = response.data.reduce((acc, employee) => {
            const timesheets = employee.pending_timesheets.map((timesheet) => ({
              id: `${employee.employee_id}-${timesheet.week}`,
              pending_timesheets: [timesheet],
              employee_name: employee.employee_name,
              employee_id: employee.employee_id,
              isBillable:
                isTsContractManager || isTimesheetAdmin
                  ? employee.isBillable || false
                  : false,
            }));
            return acc.concat(timesheets);
          }, []);

          setApprovals(formattedData);
          setFilteredApprovals(formattedData);
        } else {
          console.log("---- Enter into response empty block");
          const handleSnackbar = (messageKey, variant = "success") => {
            enqueueSnackbar(translate(messageKey), { anchorOrigin, variant });
          };

          if (
            (isHrManager || isTsContractManager || isTimesheetAdmin) &&
            !isHrAndProjectManager &&
            !isAdminAndProjectManager
          ) {
            console.log(
              "----- Condition met: User is isHrManager || isTsContractManager || isTimesheetAdmin and not HR & Project Manager or Admin & Project Manager"
            );

            if (calledFromEffect) {
              console.log(
                "----- calledFromEffect is true, triggering snackbar and fetching pending approvals"
              );

              handleSnackbar(
                "Recently, the timesheet has been approved by someone"
              );
              getPendingApprovalCount();
            }

            console.log("----- Closing the modal/dialog");
            handleClose();
          } else {
            console.log("----- Condition not met, no action taken");
          }

          if (isHrAndProjectManager) {
            console.log("--- Condition: isHrAndProjectManager is true");

            const payload = { approver_email: userData?.user_info?.email };
            console.log("--- Payload created:", payload);

            if (calledFromEffect) {
              console.log("--- calledFromEffect is true");

              let hrApprovals = null;
              try {
                console.log("--- Fetching HR approvals");
                hrApprovals = await TimeSheetAPI.TIMESHEET_APPROVALS_HR_MANAGER(
                  axiosPrivate,
                  payload
                );

                if (!hrApprovals.data?.length && !response.data?.length) {
                  console.log("--- No HR approvals and no response data");
                  handleSnackbar(
                    "Recently, the timesheet has been approved by someone"
                  );
                  getPendingApprovalCount();
                  handleClose();
                }

                if (hrApprovals.data?.length && !response.data?.length) {
                  console.log(
                    "--- HR approvals found, setting approval type to 'timeoff_unplanned'"
                  );
                  setApprovalType("timeoff_unplanned");
                }
              } catch (error) {
                console.error("--- Error fetching timesheets:", error);
              }
            }

            if (!calledFromEffect) {
              console.log("--- calledFromEffect is false");

              if (
                isHrAndProjectManager &&
                approvalType === "project_timesheets"
              ) {
                console.log("--- Approval type is 'project_timesheets'");

                if (!response.data?.length) {
                  console.log("--- No response data for project_timesheets");
                  let hrApprovals =
                    await TimeSheetAPI.TIMESHEET_APPROVALS_HR_MANAGER(
                      axiosPrivate,
                      payload
                    );

                  if (hrApprovals) {
                    console.log(
                      "--- HR approvals found, setting approval type to 'timeoff_unplanned'"
                    );
                    setApprovalType("timeoff_unplanned");
                  } else {
                    console.log(
                      "--- No HR approvals, fetching pending approval count and closing"
                    );
                    getPendingApprovalCount();
                    handleClose();
                  }
                }
              }

              if (
                isHrAndProjectManager &&
                approvalType === "timeoff_unplanned"
              ) {
                console.log("--- Approval type is 'timeoff_unplanned'");

                if (!response.data?.length) {
                  console.log("--- No response data for timeoff_unplanned");
                  let projectApprovals = await TimeSheetAPI.TIMESHEET_APPROVALS(
                    axiosPrivate,
                    payload
                  );

                  if (projectApprovals) {
                    console.log(
                      "--- Project approvals found, setting approval type to 'project_timesheets'"
                    );
                    setApprovalType("project_timesheets");
                  } else {
                    console.log(
                      "--- No project approvals, fetching pending approval count and closing"
                    );
                    getPendingApprovalCount();
                    handleClose();
                  }
                }
              }
            }
          }

          if (isAdminAndProjectManager) {
            console.log("----- Condition: isAdminAndProjectManager is true");

            const payload = { approver_email: userData?.user_info?.email };
            console.log("----- Payload created:", payload);

            if (calledFromEffect) {
              console.log("----- calledFromEffect is true");

              let adminApprovals = null;
              try {
                console.log("----- Fetching Admin approvals");
                adminApprovals = await TimeSheetAPI.TIMESHEET_APPROVALS_ADMIN(
                  axiosPrivate,
                  payload
                );

                if (!adminApprovals.data?.length && !response.data?.length) {
                  console.log("----- No Admin approvals and no response data");
                  handleSnackbar(
                    "Recently, the timesheet has been approved by someone"
                  );
                  getPendingApprovalCount();
                  handleClose();
                }

                if (adminApprovals.data?.length && !response.data?.length) {
                  console.log(
                    "----- Admin approvals found, setting approval type to 'system_timesheets'"
                  );
                  setApprovalType("system_timesheets");
                }
              } catch (error) {
                console.error("----- Error fetching timesheets:", error);
              }
            }

            if (!calledFromEffect) {
              console.log("----- calledFromEffect is false");

              if (
                isAdminAndProjectManager &&
                approvalType === "project_timesheets"
              ) {
                console.log("----- Approval type is 'project_timesheets'");

                if (!response.data?.length) {
                  console.log("----- No response data for project_timesheets");
                  let adminApprovals =
                    await TimeSheetAPI.TIMESHEET_APPROVALS_ADMIN(
                      axiosPrivate,
                      payload
                    );

                  if (adminApprovals) {
                    console.log(
                      "----- Admin approvals found, setting approval type to 'system_timesheets'"
                    );
                    setApprovalType("system_timesheets");
                  } else {
                    console.log(
                      "----- No Admin approvals, fetching pending approval count and closing"
                    );
                    getPendingApprovalCount();
                    handleClose();
                  }
                }
              }

              if (
                isAdminAndProjectManager &&
                approvalType === "system_timesheets"
              ) {
                console.log("----- Approval type is 'system_timesheets'");

                if (!response.data?.length) {
                  console.log("----- No response data for system_timesheets");
                  let projectApprovals = await TimeSheetAPI.TIMESHEET_APPROVALS(
                    axiosPrivate,
                    payload
                  );

                  if (projectApprovals) {
                    console.log(
                      "----- Project approvals found, setting approval type to 'project_timesheets'"
                    );
                    setApprovalType("project_timesheets");
                  } else {
                    console.log(
                      "----- No project approvals, fetching pending approval count and closing"
                    );
                    getPendingApprovalCount();
                    handleClose();
                  }
                }
              }
            }
          }
        }
      } else {
        console.log("No role matched for fetching approvals");
      }
    } catch (err) {
      console.error("Error fetching approvals:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleManagerAction = async (status = TIMESHEET_STATUS.approved) => {
    setLoading(true);
    const preparePayload = (rows) => {
      const mapContracts = (
        row,
        timesheet,
        index,
        isBillable,
        isRowExpanded
      ) => ({
        timesheet_id: timesheet.contracts[index].timesheet_id,
        employee_id: row.employee_id,
        billable_hours: isRowExpanded
          ? billableHours[index]
            ? `${billableHours[index]?.hours || null}:${
                billableHours[index]?.minutes || null
              }`
            : null
          : status === TIMESHEET_STATUS.approved && isBillable
          ? timesheet.contracts[index].timesheet_hours
          : null,
        non_billable_hours: isRowExpanded
          ? nonBillableHours[index]
            ? `${nonBillableHours[index]?.hours || null}:${
                nonBillableHours[index]?.minutes || null
              }`
            : null
          : status === TIMESHEET_STATUS.approved && !isBillable
          ? timesheet.contracts[index].timesheet_hours
          : null,
        approver_comments:
          status === TIMESHEET_STATUS.recall ? recallComment : "",
        ts_approval_status: status,
      });

      const mapTimesheets = (row, timesheet) => {
        const isBillable = row.isBillable;
        const isRowExpanded = expandedRow === row.id;
        return timesheet.contracts.map((contract, index) =>
          mapContracts(row, timesheet, index, isBillable, isRowExpanded)
        );
      };

      const mapRows = (row) => {
        return row.pending_timesheets.flatMap((timesheet) => {
          if (Array.isArray(timesheet.contracts)) {
            return mapTimesheets(row, timesheet);
          }
          return [];
        });
      };

      const mapHrManager = (rows) => {
        const approverEmail = userData?.user_info?.email;

        const timesheets = rows.flatMap((row, rowIndex) => {
          if (!Array.isArray(row.pending_timesheets)) {
            return [];
          }

          return row.pending_timesheets.map((timesheet, index) => ({
            timesheet_id: timesheet.timesheet_id,
            employee_id: row.employee_id,
            unplanned_hours:
              status === TIMESHEET_STATUS.recall
                ? null
                : timesheet.unplanned_hours,
            timeoff_hours:
              status === TIMESHEET_STATUS.recall
                ? null
                : timesheet.timeoff_hours,
            ts_approval_status: status,
            approver_comments:
              status === TIMESHEET_STATUS.recall ? recallComment : "",
          }));
        });

        return {
          approver_email: approverEmail,
          timesheets,
        };
      };

      const mapAdminManager = (row) => {
        return row.pending_timesheets.map((timesheet) => {
          const timesheets = timesheet.contracts.map((contract, index) => ({
            timesheet_id: contract.timesheet_id,
            billable_hours:
              expandedRow === row.id
                ? billableHours[index]
                  ? `${billableHours[index]?.hours || null}:${
                      billableHours[index]?.minutes || null
                    }`
                  : null
                : status === TIMESHEET_STATUS.approved && row.isBillable
                ? contract.timesheet_hours
                : null,
            non_billable_hours:
              expandedRow === row.id
                ? nonBillableHours[index]
                  ? `${nonBillableHours[index]?.hours || null}:${
                      nonBillableHours[index]?.minutes || null
                    }`
                  : null
                : status === TIMESHEET_STATUS.approved && !row.isBillable
                ? contract.timesheet_hours
                : null,
            ts_approval_status: status,
            approver_comments:
              status === TIMESHEET_STATUS.recall ? recallComment : "",
          }));

          return {
            employee_id: row.employee_id,
            unplanned_hours:
              status === TIMESHEET_STATUS.recall
                ? null
                : timesheet.unplanned_hours,
            timeoff_hours:
              status === TIMESHEET_STATUS.recall
                ? null
                : timesheet.timeoff_hours,
            ts_approval_status: status,
            approver_comments:
              status === TIMESHEET_STATUS.recall ? recallComment : "",
            unplanned_timesheet_id: timesheet.unplanned_timesheet_id,
            timesheets: timesheets,
          };
        });
      };

      if (
        isTsContractManager &&
        !isHrAndProjectManager &&
        !isAdminAndProjectManager
      ) {
        return rows.flatMap(mapRows);
      } else if (
        isHrManager &&
        !isHrAndProjectManager &&
        !isAdminAndProjectManager
      ) {
        return mapHrManager(rows);
      } else if (
        isTimesheetAdmin &&
        !isHrAndProjectManager &&
        !isAdminAndProjectManager
      ) {
        return rows.flatMap(mapAdminManager);
      } else if (
        isHrAndProjectManager &&
        approvalType === "project_timesheets"
      ) {
        return rows.flatMap(mapRows);
      } else if (
        isHrAndProjectManager &&
        approvalType === "timeoff_unplanned"
      ) {
        return mapHrManager(rows);
      } else if (
        isAdminAndProjectManager &&
        approvalType === "project_timesheets"
      ) {
        return rows.flatMap(mapRows);
      } else if (
        isAdminAndProjectManager &&
        approvalType === "system_timesheets"
      ) {
        return rows.flatMap(mapAdminManager);
      } else {
        console.log("cannot create payload");
        return null;
      }
    };

    const handleSnackbar = (messageKey, variant = "success") => {
      enqueueSnackbar(translate(messageKey), { anchorOrigin, variant });
    };

    try {
      const targetRows = selectedRows.length
        ? paginatedData.filter((row) => selectedRows.includes(row.id))
        : [paginatedData.find((row) => row.id === expandedRow)].filter(Boolean);

      if (targetRows.length === 0) {
        return;
      }

      const approvalPayload = preparePayload(targetRows);

      const apiMapping = {
        isTsContractManager: TimeSheetAPI.UPDATE_TIMESHEET_BY_MANAGER,
        isHrManager: TimeSheetAPI.UPDATE_TIMESHEET_BY_HR_MANAGER,
        isTimesheetAdmin: TimeSheetAPI.UPDATE_TIMESHEET_BY_ADMIN,
        isHrAndProjectManager: {
          project_timesheets: TimeSheetAPI.UPDATE_TIMESHEET_BY_MANAGER,
          timeoff_unplanned: TimeSheetAPI.UPDATE_TIMESHEET_BY_HR_MANAGER,
        },
        isAdminAndProjectManager: {
          project_timesheets: TimeSheetAPI.UPDATE_TIMESHEET_BY_MANAGER,
          system_timesheets: TimeSheetAPI.UPDATE_TIMESHEET_BY_ADMIN,
        },
      };

      let apiCall = null;

      if (isHrAndProjectManager || isAdminAndProjectManager) {
        const approvalApiMap = isHrAndProjectManager
          ? apiMapping.isHrAndProjectManager
          : apiMapping.isAdminAndProjectManager;
        apiCall = approvalApiMap[approvalType];
      } else {
        apiCall =
          apiMapping[isTsContractManager && "isTsContractManager"] ||
          apiMapping[isHrManager && "isHrManager"] ||
          apiMapping[isTimesheetAdmin && "isTimesheetAdmin"];
      }
      if (apiCall) {
        await apiCall(axiosPrivate, approvalPayload);
      } else {
        return;
      }

      handleSnackbar(
        status === TIMESHEET_STATUS.approved
          ? "message.approved"
          : "message.recalled"
      );

      if (status === TIMESHEET_STATUS.approved) {
        setBillableHours({});
        setNonBillableHours({});
        setRecallComment("");
        setExpandedRow(null);
      } else if (status === TIMESHEET_STATUS.recall) {
        setShowBulkRecallDialog(false);
        setRecallComment("");
        setExpandedRow(null);
      }

      getPendingApprovalCount();
      fetchApprovals();
    } catch (error) {
      handleSnackbar(
        `Failed to ${status} timesheets. Please try again.`,
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApprovals(true);
  }, [
    isTsContractManager,
    isHrManager,
    isTimesheetAdmin,
    isHrAndProjectManager,
    isAdminAndProjectManager,
    approvalType,
  ]);

  useEffect(() => {
    const filteredData = approvals.filter((row) =>
      row.employee_name?.toLowerCase().includes(searchText.toLowerCase())
    );
    setFilteredApprovals(filteredData);
    setCurrentPage(1);
  }, [searchText, approvals]);

  const handleRowExpand = (id) => {
    setRecallComment("");
    setExpandedRow((prev) => (prev === id ? null : id));
    setRecalledRow(null);
    setBillableHours({});
    setNonBillableHours({});
  };

  const handleSearchChange = (event) => {
    setSearchText(event.target.value);
  };

  const handlePageChange = (event, newPage) => {
    setCurrentPage(newPage);
  };

  const paginatedData = filteredApprovals.slice(
    (currentPage - 1) * rowsPerPage,
    currentPage * rowsPerPage
  );

  const handleCancelRecall = () => {
    setRecallComment("");
    setRecalledRow(null);
    setRecallErrorMessage("");
  };
  const handleApprovalChange = (event) => {
    setApprovalType(event.target.value);
    setExpandedRow(null);
    setSelectedRows([]);
  };
  const handleHoursChange = (type, index, field, value) => {
    if (value.length > 2) {
      return;
    }

    let hours, minutes;

    if (field === "hours") {
      hours = parseInt(value, 10);
      minutes = parseInt(
        type === "billable"
          ? billableHours[index]?.minutes
          : nonBillableHours[index]?.minutes,
        10
      );
    } else if (field === "minutes") {
      hours = parseInt(
        type === "billable"
          ? billableHours[index]?.hours
          : nonBillableHours[index]?.hours,
        10
      );
      minutes = parseInt(value, 10);
    }

    if (minutes > 59) {
      if (type === "billable") {
        setBillableErrors((prev) => ({
          ...prev,
          [index]: "hh:mm format only",
        }));
      } else if (type === "nonBillable") {
        setNonBillableErrors((prev) => ({
          ...prev,
          [index]: "hh:mm format only",
        }));
      }
    } else {
      if (type === "billable") {
        setBillableErrors((prev) => ({
          ...prev,
          [index]: "",
        }));
      } else if (type === "nonBillable") {
        setNonBillableErrors((prev) => ({
          ...prev,
          [index]: "",
        }));
      }
    }

    if (field === "hours") {
      if (type === "billable") {
        setBillableHours((prev) => ({
          ...prev,
          [index]: {
            ...(prev[index] || {}),
            [field]: value,
            minutes: prev[index]?.minutes || "00",
          },
        }));
      } else if (type === "nonBillable") {
        setNonBillableHours((prev) => ({
          ...prev,
          [index]: {
            ...(prev[index] || {}),
            [field]: value,
            minutes: prev[index]?.minutes || "00",
          },
        }));
      }
    } else if (field === "minutes") {
      if (type === "billable") {
        setBillableHours((prev) => ({
          ...prev,
          [index]: {
            ...(prev[index] || {}),
            [field]: value,
            hours: prev[index]?.hours || "00",
          },
        }));
      } else if (type === "nonBillable") {
        setNonBillableHours((prev) => ({
          ...prev,
          [index]: {
            ...(prev[index] || {}),
            [field]: value,
            hours: prev[index]?.hours || "00",
          },
        }));
      }
    }
  };

  const handleBillableHoursChange = (index, field, value, timesheet) => {
    setCurentTimesheet(timesheet);
    handleHoursChange("billable", index, field, value);
  };

  const handleNonBillableHoursChange = (index, field, value, timesheet) => {
    setCurentTimesheet(timesheet);
    handleHoursChange("nonBillable", index, field, value);
  };
  const isApproveDisabled = () => {
    if (isHrManager) {
      return false;
    }

    let isDisabled = true;

    if (expandedRow !== null) {
      const row = paginatedData.find((row) => row.id === expandedRow);
      if (row) {
        for (let i = 0; i < row.pending_timesheets.length; i++) {
          const timesheet = row.pending_timesheets[i];
          for (let j = 0; j < timesheet.contracts.length; j++) {
            const contract = timesheet.contracts[j];
            const billableHour = billableHours[j];
            const nonBillableHour = nonBillableHours[j];
            const billableEntered =
              billableHour?.hours && parseInt(billableHour?.hours) > 0;

            if (billableEntered) {
              const totalBillableHours =
                parseInt(billableHour?.hours || "0") +
                parseInt(billableHour?.minutes || "0") / 60;
              const totalNonBillableHours =
                parseInt(nonBillableHour?.hours || "0") +
                parseInt(nonBillableHour?.minutes || "0") / 60;

              const totalHours = totalBillableHours + totalNonBillableHours;
              const isHoursExceeded = totalHours > contract.timesheet_hours;

              if (contractErrors[j] || isHoursExceeded || !billableEntered) {
                return true;
              } else {
                isDisabled = false;
              }
            } else {
              return true;
            }
          }
        }
      }
    }

    return isDisabled;
  };
  const getTotalPaginationLabel = () => {
    const totalFilterRecords = filteredApprovals.length;
    const startRecord = Math.min(
      totalFilterRecords,
      (currentPage - 1) * rowsPerPage + 1
    );
    const endRecord = Math.min(totalFilterRecords, currentPage * rowsPerPage);

    return `Showing ${startRecord} to ${endRecord} of ${totalFilterRecords} results`;
  };

  const handleBulkRecall = () => {
    setShowBulkRecallDialog(true);
  };

  const handleBulkCancel = () => {
    setShowBulkRecallDialog(false);
    setRecallComment("");
    setRecallErrorMessage("");
  };
  const handleRecallCommentChange = (event) => {
    const value = event.target.value;
    const maxLength = 300;
    const regex = /^[a-zA-Z0-9,.\- ]*$/;

    setRecallComment(value);

    if (!value) {
      setRecallErrorMessage("");
    } else if (!regex.test(value)) {
      setRecallErrorMessage(
        "Only alphabets, digits, comma, full stop, hyphen are allowed."
      );
    } else if (value.length > maxLength) {
      const excessChars = value.length - maxLength;
      setRecallErrorMessage(
        `Maximum length is 300 characters, exceeded by ${excessChars}`
      );
    } else {
      const charsLeft = maxLength - value.length;
      setRecallErrorMessage(`Characters left: ${charsLeft}`);
    }
  };
  const disableSubmitCmt = () => {
    const isCommentError =
      recallErrorMessage && !recallErrorMessage.includes("Characters left");

    const isCommentEmpty = recallComment === "";

    return isCommentError || isCommentEmpty;
  };
  const roleInfoMessages = {
    hr_manager: TIMESHEET_ROLE_INFO_MESSAGE.hr_manager_info_message,
    contract_manager: TIMESHEET_ROLE_INFO_MESSAGE.contract_manager_info_message,
    timesheet_admin: TIMESHEET_ROLE_INFO_MESSAGE.timesheet_admin_info_message,
  };

  const getTimesheetRoleInfoMessage = () => {
    if (isHrManager && !isHrAndProjectManager && !isAdminAndProjectManager)
      return roleInfoMessages.hr_manager;
    if (
      isTsContractManager &&
      !isHrAndProjectManager &&
      !isAdminAndProjectManager
    )
      return roleInfoMessages.contract_manager;
    if (isTimesheetAdmin && !isHrAndProjectManager && !isAdminAndProjectManager)
      return roleInfoMessages.timesheet_admin;

    if (isHrAndProjectManager && approvalType === "project_timesheets")
      return roleInfoMessages.contract_manager;
    if (isHrAndProjectManager && approvalType === "timeoff_unplanned")
      return roleInfoMessages.hr_manager;

    if (isAdminAndProjectManager && approvalType === "project_timesheets")
      return roleInfoMessages.contract_manager;
    if (isAdminAndProjectManager && approvalType === "system_timesheets")
      return roleInfoMessages.timesheet_admin;

    return "";
  };
  return (
    <Box padding={"1%"}>
      <Stack
        direction="row"
        alignItems="center"
        justifyContent="space-between"
        sx={{ width: "100%" }}
      >
        <Stack direction="row" alignItems="center" spacing={1}>
          <HighlightOffIcon
            onClick={handleClose}
            style={{ cursor: "pointer" }}
          />
          <Typography noWrap variant="h4">
            {translate("Approve Timesheet")}
          </Typography>
        </Stack>
        <Box
          sx={{
            marginLeft: "auto",
            padding: "5px 20px",
            backgroundColor: "#edf2f7",
            borderRadius: "4px",
            border: "1px solid #cbd5e0",
          }}
        >
          <Typography color={"error"} sx={{ fontSize: "15px" }}>
            {getTimesheetRoleInfoMessage()}
          </Typography>
        </Box>
      </Stack>

      {loading ? (
        <Box className={classes.loaderContainer}>
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box display="flex" flexDirection="column" gap="20px" margin="20px">
            <TextField
              placeholder="Search by Employee Name"
              value={searchText}
              onChange={handleSearchChange}
              variant="outlined"
              sx={{ width: "100%", maxWidth: "400px" }}
            />
            {(isHrAndProjectManager || isAdminAndProjectManager) && (
              <Box
                display="flex"
                alignItems="center"
                padding="4px 20px"
                backgroundColor="#edf2f7"
                borderRadius="4px"
                border="1px solid #cbd5e0"
              >
                <Typography
                  sx={{
                    marginRight: "20px",
                    fontWeight: "400",
                    fontSize: "15px",
                  }}
                >
                  Select Timesheet Type:
                </Typography>
                <RadioGroup
                  value={approvalType}
                  onChange={handleApprovalChange}
                  row
                >
                  <FormControlLabel
                    value={
                      isAdminAndProjectManager || isHrAndProjectManager
                        ? "project_timesheets"
                        : "unknown_type"
                    }
                    control={<Radio />}
                    label={
                      isAdminAndProjectManager || isHrAndProjectManager
                        ? TS_APPROVAL_OPTIONS.project_timesheets
                        : TS_APPROVAL_OPTIONS.unknown_type
                    }
                  />
                  <FormControlLabel
                    value={
                      isHrAndProjectManager
                        ? "timeoff_unplanned"
                        : isAdminAndProjectManager
                        ? "system_timesheets"
                        : "unknown_type"
                    }
                    control={<Radio />}
                    label={
                      isHrAndProjectManager
                        ? TS_APPROVAL_OPTIONS.time_off_unplanned
                        : isAdminAndProjectManager
                        ? TS_APPROVAL_OPTIONS.system_timesheets
                        : TS_APPROVAL_OPTIONS.unknown_type
                    }
                  />
                </RadioGroup>
              </Box>
            )}

            {isHrManager ? (
              <>
                {selectedRows.length > 0 && (
                  <Box display="flex" justifyContent="flex-end" gap="10px">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() =>
                        handleManagerAction(TIMESHEET_STATUS.approved)
                      }
                    >
                      Approve
                    </Button>
                    <Button variant="outlined" onClick={handleBulkRecall}>
                      Recall
                    </Button>
                  </Box>
                )}
              </>
            ) : (
              <>
                {selectedRows.length > 0 && (
                  <Box display="flex" justifyContent="flex-end" gap="10px">
                    <Button
                      variant="contained"
                      color="primary"
                      onClick={() =>
                        handleManagerAction(TIMESHEET_STATUS.approved)
                      }
                    >
                      Approve
                    </Button>

                    <Button variant="outlined" onClick={handleBulkRecall}>
                      Recall
                    </Button>
                  </Box>
                )}
              </>
            )}
          </Box>

          <TableContainer
            component={Paper}
            style={{
              marginTop: "20px",
              borderRadius: "8px",
              overflow: "hidden",
            }}
          >
            <ApprovalTable
              paginatedData={paginatedData}
              handleRowExpand={handleRowExpand}
              expandedRow={expandedRow}
              recalledRow={recalledRow}
              billableHours={billableHours}
              handleBillableHoursChange={handleBillableHoursChange}
              nonBillableHours={nonBillableHours}
              handleNonBillableHoursChange={handleNonBillableHoursChange}
              isApproveDisabled={isApproveDisabled}
              setRecalledRow={setRecalledRow}
              recallComment={recallComment}
              setRecallComment={setRecallComment}
              handleCancelRecall={handleCancelRecall}
              selectedRows={selectedRows}
              setSelectedRows={setSelectedRows}
              nonBillableErrors={nonBillableErrors}
              billableErrors={billableErrors}
              setBillableHours={setBillableHours}
              setNonBillableHours={setNonBillableHours}
              isHrManager={isHrManager}
              recallErrorMessage={recallErrorMessage}
              setRecallErrorMessage={setRecallErrorMessage}
              handleRecallCommentChange={handleRecallCommentChange}
              disableSubmitCmt={disableSubmitCmt}
              handleManagerAction={handleManagerAction}
              approvals={approvals}
              contractErrors={contractErrors}
              approvalType={approvalType}
              isHrAndProjectManager={isHrAndProjectManager}
            />

            {filteredApprovals.length > 0 && (
              <Box
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  margin: "20px",
                }}
              >
                <Typography variant="body2">
                  {getTotalPaginationLabel()}
                </Typography>

                {!selectedRows.length > 0 && (
                  <ResponsivePagination
                    count={Math.ceil(filteredApprovals.length / rowsPerPage)}
                    page={currentPage}
                    onChange={handlePageChange}
                    color="primary"
                    variant="outlined"
                    shape="rounded"
                    siblingCount={isMobile ? 0 : 1}
                    boundaryCount={isMobile ? 0 : 2}
                    size={isMobile ? "small" : "medium"}
                  />
                )}
              </Box>
            )}
          </TableContainer>

          <Dialog
            open={showBulkRecallDialog}
            onClose={() => setShowBulkRecallDialog(false)}
          >
            <DialogTitle>Add Comment</DialogTitle>
            <DialogContent
              style={{
                padding: "20px",
              }}
            >
              <Box
                sx={{
                  display: "flex",
                  flexDirection: "column",
                  alignItems: "left",
                  width: "400px",
                  margin: "0 auto",
                }}
              >
                <TextField
                  fullWidth
                  multiline
                  rows={4}
                  placeholder="Enter recall comment"
                  value={recallComment}
                  onChange={handleRecallCommentChange}
                  variant="outlined"
                />
                {recallErrorMessage && (
                  <Typography
                    sx={{
                      color:
                        recallErrorMessage.includes("Maximum length is") ||
                        recallErrorMessage.includes("Only alphabets, digits")
                          ? "red"
                          : "black",
                      fontSize: "0.8rem",
                      marginTop: "8px",
                    }}
                  >
                    {recallErrorMessage}
                  </Typography>
                )}
              </Box>
            </DialogContent>

            <DialogActions
              style={{
                justifyContent: "flex-end",
                padding: "0 20px 20px",
              }}
            >
              <Button variant="outlined" onClick={handleBulkCancel}>
                Cancel
              </Button>
              <Button
                variant="contained"
                color="primary"
                onClick={() => handleManagerAction(TIMESHEET_STATUS.recall)}
                disabled={disableSubmitCmt()}
              >
                Recall
              </Button>
            </DialogActions>
          </Dialog>
        </>
      )}
    </Box>
  );
}
