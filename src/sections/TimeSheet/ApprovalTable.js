import React, { useState, useEffect } from "react";
import {
  Box,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  Paper,
  TextField,
  InputAdornment,
  Button,
  Checkbox,
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import MandatoryTextField from "../../pages/MandatoryTextField";
import useLocales from "../../hooks/useLocales";
import { TIMESHEET_STATUS } from "../../utils/constants";

export default function ApprovalTable({
  paginatedData,
  handleRowExpand,
  expandedRow,
  billableHours,
  handleBillableHoursChange,
  nonBillableHours,
  handleNonBillableHoursChange,
  handleManagerAction,
  isApproveDisabled,
  setRecalledRow,
  recallComment,
  setRecallComment,
  handleCancelRecall,
  recalledRow,
  selectedRows,
  setSelectedRows,
  nonBillableErrors,
  billableErrors,
  setBillableHours,
  setNonBillableHours,
  isHrManager,
  recallErrorMessage,
  setRecallErrorMessage,
  handleRecallCommentChange,
  disableSubmitCmt,
  approvalType,
  approvals,
  contractErrors,
  isHrAndProjectManager,
}) {
  const { translate } = useLocales();

  const [selectAll, setSelectAll] = useState(false);
  const [inputDisabled, setInputDisabled] = useState(false);

  const handleSelectAllChange = (e) => {
    const checked = e.target.checked;
    setSelectAll(checked);
    if (checked) {
      setSelectedRows(paginatedData.map((row) => row.id));
    } else {
      setSelectedRows([]);
    }
  };

  const handleRowSelectChange = (id) => {
    setSelectedRows((prevState) => {
      const isSelected = prevState.includes(id);
      if (isSelected) {
        const newState = prevState.filter((rowId) => rowId !== id);
        return newState;
      } else {
        const newState = [...prevState, id];
        return newState;
      }
    });
  };

  useEffect(() => {
    if (selectedRows.length === paginatedData.length) {
      setSelectAll(true);
    } else {
      setSelectAll(false);
    }
  }, [selectedRows, paginatedData.length]);

  const handleRecallClick = () => {
    setRecalledRow(true);
    setInputDisabled(true);
    setBillableHours({});
    setNonBillableHours({});
  };

  return (
    <Table>
      <TableHead>
        <TableRow
          style={{
            backgroundColor: "#f4f4f4",
            marginBottom: "10px",
          }}
        >
          {paginatedData.length > 0 && (
            <TableCell
              padding="checkbox"
              style={{ cursor: expandedRow ? "not-allowed" : "pointer" }}
            >
              <Checkbox
                disabled={!!expandedRow}
                checked={selectAll}
                onChange={handleSelectAllChange}
              />
            </TableCell>
          )}
          <TableCell style={{ width: "20%" }}>Employee Name</TableCell>
          <TableCell>Start Date - End Date</TableCell>
          <TableCell align="center"></TableCell>
        </TableRow>
      </TableHead>
      <Box height="10px" />
      <TableBody>
        {approvals && approvals.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} align="center">
              <Typography>No pending approvals</Typography>
            </TableCell>
          </TableRow>
        ) : paginatedData.length === 0 ? (
          <TableRow>
            <TableCell colSpan={4} align="center">
              <Typography>No data found</Typography>
            </TableCell>
          </TableRow>
        ) : (
          paginatedData.map((row) => (
            <React.Fragment key={row.id}>
              <TableRow
                hover
                onClick={(e) => {
                  if (
                    e.target.type !== "checkbox" &&
                    selectedRows.length === 0
                  ) {
                    handleRowExpand(row.id);
                  }
                }}
                style={{
                  cursor: selectedRows.length === 0 ? "pointer" : "default",
                  backgroundColor: expandedRow === row.id ? "#f9f9f9" : "white",
                  borderBottom: "1px solid #e0e0e0",
                }}
              >
                <TableCell
                  padding="checkbox"
                  style={{ cursor: expandedRow ? "not-allowed" : "pointer" }}
                  onClick={(e) => expandedRow && e.stopPropagation()}
                >
                  <Checkbox
                    checked={selectedRows.includes(row.id)}
                    onChange={() => handleRowSelectChange(row.id)}
                    disabled={!!expandedRow}
                  />
                </TableCell>

                <TableCell>{row.employee_name}</TableCell>
                <TableCell>
                  {(!isHrAndProjectManager && isHrManager) ||
                  (approvalType === "timeoff_unplanned" &&
                    isHrAndProjectManager)
                    ? row.pending_timesheets
                        .map((ts) => ts.week_number)
                        .join(", ")
                    : [
                        ...new Set(
                          row.pending_timesheets.map((ts) => ts.week_number)
                        ),
                      ].join(", ")}
                </TableCell>

                <TableCell align="center">
                  {expandedRow === row.id ? (
                    <KeyboardArrowUpIcon />
                  ) : (
                    selectedRows.length === 0 && <KeyboardArrowDownIcon />
                  )}
                </TableCell>
              </TableRow>

              {expandedRow === row.id && (
                <TableRow>
                  <TableCell
                    colSpan={4}
                    style={{
                      backgroundColor: "#f5f5f5",
                      padding: "16px",
                    }}
                  >
                    {(!isHrAndProjectManager && isHrManager) ||
                    (approvalType === "timeoff_unplanned" &&
                      isHrAndProjectManager) ? (
                      <TableContainer
                        component={Paper}
                        style={{ marginBottom: "16px" }}
                      >
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell
                                style={{
                                  boxShadow: "none",
                                  borderRadius: 0,
                                }}
                              >
                                Approval Type
                              </TableCell>
                              <TableCell>Hours</TableCell>
                              <TableCell
                                style={{
                                  boxShadow: "none",
                                  borderRadius: 0,
                                }}
                              >
                                Comments
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {row.pending_timesheets.map((timesheet, index) => (
                              <React.Fragment key={index}>
                                <TableRow>
                                  <TableCell>Unplanned</TableCell>
                                  <TableCell>
                                    {timesheet.unplanned_hours}
                                  </TableCell>
                                  <TableCell>
                                    {timesheet.unplanned_hours_comments}
                                  </TableCell>
                                </TableRow>
                                <TableRow>
                                  <TableCell>Time Off</TableCell>
                                  <TableCell>
                                    {timesheet.timeoff_hours}
                                  </TableCell>
                                  <TableCell>
                                    {timesheet.timeoff_hours_comments}
                                  </TableCell>
                                </TableRow>
                              </React.Fragment>
                            ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    ) : (
                      <TableContainer
                        component={Paper}
                        style={{ marginBottom: "16px" }}
                      >
                        <Table size="small">
                          <TableHead>
                            <TableRow>
                              <TableCell
                                style={{
                                  boxShadow: "none",
                                  borderRadius: 0,
                                }}
                              >
                                Client
                              </TableCell>
                              <TableCell>Contract Name</TableCell>
                              <TableCell>Allocated Hours</TableCell>
                              <TableCell>Timesheet Hours</TableCell>
                              <TableCell>
                                <MandatoryTextField
                                  label={translate("Billable Hours")}
                                ></MandatoryTextField>
                              </TableCell>
                              <TableCell
                                style={{
                                  boxShadow: "none",
                                  borderRadius: 0,
                                }}
                              >
                                Non Billable Hours
                              </TableCell>
                            </TableRow>
                          </TableHead>
                          <TableBody>
                            {row.pending_timesheets &&
                              row.pending_timesheets.map((timesheet) => (
                                <React.Fragment key={timesheet.week_number}>
                                  {timesheet.contracts &&
                                    timesheet.contracts.map(
                                      (contract, index) => {
                                        return (
                                          <>
                                            <TableRow
                                              key={index}
                                              style={{
                                                borderBottom:
                                                  "1px solid #e0e0e0",
                                              }}
                                            >
                                              <TableCell>
                                                {contract.client_name}
                                              </TableCell>
                                              <TableCell>
                                                {contract.contract_sow_name}
                                              </TableCell>
                                              <TableCell>
                                                {contract.allocated_hours}
                                              </TableCell>
                                              <TableCell>
                                                {contract.timesheet_hours}
                                              </TableCell>
                                              <TableCell>
                                                <Box
                                                  display="flex"
                                                  alignItems="center"
                                                >
                                                  <TextField
                                                    size="small"
                                                    value={
                                                      billableHours[index]
                                                        ?.hours || ""
                                                    }
                                                    onChange={(e) =>
                                                      handleBillableHoursChange(
                                                        index,
                                                        "hours",
                                                        e.target.value,
                                                        timesheet
                                                      )
                                                    }
                                                    placeholder="00"
                                                    variant="outlined"
                                                    inputProps={{
                                                      maxLength: 2,
                                                      style: {
                                                        textAlign: "center",
                                                        backgroundColor:
                                                          "#ffffff",
                                                      },
                                                    }}
                                                    sx={{
                                                      width: "50px",
                                                      marginRight: 0.5,
                                                      marginLeft: 0.5,
                                                    }}
                                                    type="number"
                                                    disabled={inputDisabled}
                                                  />
                                                  <InputAdornment position="end">
                                                    :
                                                  </InputAdornment>
                                                  <TextField
                                                    size="small"
                                                    value={
                                                      billableHours[index]
                                                        ?.minutes || ""
                                                    }
                                                    onChange={(e) =>
                                                      handleBillableHoursChange(
                                                        index,
                                                        "minutes",
                                                        e.target.value
                                                      )
                                                    }
                                                    placeholder="00"
                                                    variant="outlined"
                                                    inputProps={{
                                                      maxLength: 2,
                                                      style: {
                                                        textAlign: "center",
                                                        backgroundColor:
                                                          "#ffffff",
                                                      },
                                                    }}
                                                    sx={{ width: "50px" }}
                                                    type="number"
                                                    disabled={inputDisabled}
                                                  />
                                                </Box>

                                                {billableErrors[index] && (
                                                  <Typography
                                                    color="error"
                                                    sx={{
                                                      fontSize: "12px",
                                                      marginTop: "5px",
                                                      textAlign: "center",
                                                    }}
                                                  >
                                                    {billableErrors[index]}
                                                  </Typography>
                                                )}
                                              </TableCell>

                                              <TableCell>
                                                <Box
                                                  display="flex"
                                                  alignItems="center"
                                                >
                                                  <TextField
                                                    size="small"
                                                    value={
                                                      nonBillableHours[index]
                                                        ?.hours || ""
                                                    }
                                                    onChange={(e) =>
                                                      handleNonBillableHoursChange(
                                                        index,
                                                        "hours",
                                                        e.target.value,
                                                        timesheet
                                                      )
                                                    }
                                                    placeholder="00"
                                                    variant="outlined"
                                                    inputProps={{
                                                      maxLength: 2,
                                                      style: {
                                                        textAlign: "center",
                                                        backgroundColor:
                                                          "#ffffff",
                                                      },
                                                    }}
                                                    sx={{
                                                      width: "50px",
                                                      marginRight: 0.5,
                                                      marginLeft: 0.5,
                                                    }}
                                                    type="number"
                                                    disabled={inputDisabled}
                                                  />
                                                  <InputAdornment position="end">
                                                    :
                                                  </InputAdornment>
                                                  <TextField
                                                    size="small"
                                                    value={
                                                      nonBillableHours[index]
                                                        ?.minutes || ""
                                                    }
                                                    onChange={(e) =>
                                                      handleNonBillableHoursChange(
                                                        index,
                                                        "minutes",
                                                        e.target.value
                                                      )
                                                    }
                                                    placeholder="00"
                                                    variant="outlined"
                                                    inputProps={{
                                                      maxLength: 2,
                                                      style: {
                                                        textAlign: "center",
                                                        backgroundColor:
                                                          "#ffffff",
                                                      },
                                                    }}
                                                    sx={{ width: "50px" }}
                                                    type="number"
                                                    disabled={inputDisabled}
                                                  />
                                                </Box>

                                                {nonBillableErrors[index] && (
                                                  <Typography
                                                    color="error"
                                                    sx={{
                                                      fontSize: "12px",
                                                      marginTop: "5px",
                                                      textAlign: "center",
                                                    }}
                                                  >
                                                    {nonBillableErrors[index]}
                                                  </Typography>
                                                )}
                                              </TableCell>
                                            </TableRow>

                                            {contractErrors[index] && (
                                              <TableRow colSpan={6}>
                                                {" "}
                                                <TableCell
                                                  colSpan={6}
                                                  sx={{
                                                    textAlign: "right",
                                                    paddingRight: "10px",
                                                  }}
                                                >
                                                  <Typography
                                                    color="error"
                                                    sx={{
                                                      fontSize: "12px",
                                                    }}
                                                  >
                                                    {contractErrors[index]}
                                                  </Typography>
                                                </TableCell>
                                              </TableRow>
                                            )}
                                          </>
                                        );
                                      }
                                    )}
                                  <TableRow
                                    style={{
                                      borderBottom: "1px solid #e0e0e0",
                                    }}
                                  >
                                    <TableCell>
                                      Unplanned Hours:
                                      {timesheet.unplanned_hours}
                                    </TableCell>
                                    <TableCell>
                                      Time Off: {timesheet.timeoff_hours}
                                    </TableCell>
                                  </TableRow>
                                </React.Fragment>
                              ))}
                          </TableBody>
                        </Table>
                      </TableContainer>
                    )}
                    {(!isHrAndProjectManager && isHrManager) ||
                    (approvalType === "timeoff_unplanned" &&
                      isHrAndProjectManager) ? (
                      <>
                        {!recalledRow ? (
                          <Box
                            display="flex"
                            justifyContent="flex-end"
                            gap="10px"
                          >
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() => {
                                handleManagerAction(TIMESHEET_STATUS.approved);
                              }}
                            >
                              Approve
                            </Button>

                            <Button
                              variant="outlined"
                              onClick={handleRecallClick}
                            >
                              Recall
                            </Button>
                          </Box>
                        ) : (
                          <Box marginTop={2}>
                            <TextField
                              minRows={3}
                              multiline
                              placeholder="Enter your comment"
                              fullWidth
                              value={recallComment}
                              onChange={handleRecallCommentChange}
                              sx={{ padding: "8px" }}
                            />
                            {recallErrorMessage && (
                              <Typography
                                sx={{
                                  color:
                                    recallErrorMessage.includes(
                                      "Maximum length is"
                                    ) ||
                                    recallErrorMessage.includes(
                                      "Only alphabets, digits"
                                    )
                                      ? "red"
                                      : "black",
                                  fontSize: "0.8rem",
                                  marginTop: "8px",
                                }}
                              >
                                {recallErrorMessage}
                              </Typography>
                            )}
                            <Box
                              display="flex"
                              justifyContent="flex-end"
                              gap="10px"
                            >
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={() =>
                                  handleManagerAction(TIMESHEET_STATUS.recall)
                                }
                                disabled={disableSubmitCmt()}
                              >
                                Submit
                              </Button>
                              <Button
                                variant="outlined"
                                onClick={() => {
                                  handleCancelRecall();
                                  setInputDisabled(false);
                                }}
                              >
                                Cancel
                              </Button>
                            </Box>
                          </Box>
                        )}
                      </>
                    ) : (
                      <>
                        {!recalledRow ? (
                          <Box
                            display="flex"
                            justifyContent="flex-end"
                            gap="10px"
                          >
                            <Button
                              variant="contained"
                              color="primary"
                              onClick={() =>
                                handleManagerAction(TIMESHEET_STATUS.approved)
                              }
                              disabled={isApproveDisabled()}
                            >
                              Approve
                            </Button>

                            <Button
                              variant="outlined"
                              onClick={handleRecallClick}
                            >
                              Recall
                            </Button>
                          </Box>
                        ) : (
                          <Box marginTop={2}>
                            <TextField
                              minRows={3}
                              multiline
                              placeholder="Enter your comment"
                              fullWidth
                              value={recallComment}
                              onChange={handleRecallCommentChange}
                              sx={{ padding: "8px" }}
                            />

                            {recallErrorMessage && (
                              <Typography
                                sx={{
                                  color:
                                    recallErrorMessage.includes(
                                      "Maximum length is"
                                    ) ||
                                    recallErrorMessage.includes(
                                      "Only alphabets, digits"
                                    )
                                      ? "red"
                                      : "black",
                                  fontSize: "0.8rem",
                                  marginTop: "8px",
                                }}
                              >
                                {recallErrorMessage}
                              </Typography>
                            )}
                            <Box
                              display="flex"
                              justifyContent="flex-end"
                              gap="10px"
                            >
                              <Button
                                variant="contained"
                                color="primary"
                                onClick={() =>
                                  handleManagerAction(TIMESHEET_STATUS.recall)
                                }
                                disabled={disableSubmitCmt()}
                              >
                                Submit
                              </Button>
                              <Button
                                variant="outlined"
                                onClick={() => {
                                  handleCancelRecall();
                                  setInputDisabled(false);
                                }}
                              >
                                Cancel
                              </Button>
                            </Box>
                          </Box>
                        )}
                      </>
                    )}
                  </TableCell>
                </TableRow>
              )}
            </React.Fragment>
          ))
        )}
      </TableBody>
    </Table>
  );
}
