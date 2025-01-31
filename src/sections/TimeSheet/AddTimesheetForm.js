import React from "react";
import useLocales from "../../hooks/useLocales";
import {
  Box,
  Checkbox,
  FormControlLabel,
  Grid,
  Stack,
  TextField,
  Typography,
  Button,
  InputAdornment,
  CircularProgress,
} from "@mui/material";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import { TIMESHEET_STATUS } from "../../utils/constants";
import { fDateDMY } from "../../utils/formatTime";

export default function AddTimesheetForm({
  isLoading,
  handleClose,
  timesheetStatus,
  startDate,
  endDate,
  totalHrs,
  totalBillableHrs,
  unPlannedHrs,
  timeOffHrs,
  errorMessage,
  ongoingProjectArr,
  allocatedClientData,
  handleHoursChange,
  billableHours,
  handleMinutesChange,
  errorMessagesBillable,
  timeToMinutes,
  checkedStates,
  handleCheckboxChange,
  handleHrsChange,
  errorMessageUnplanned,
  handleUnplannedHrsCmtAdded,
  unPlannedHrsCmtError,
  setUnPlannedHrsCmtError,
  unPlannedHrsCmt,
  errorMessageTimeOff,
  handleTimeOffHrsCmtAdded,
  timeOffHrsCmtError,
  setTimeOffHrsCmtError,
  timeOffHrsCmt,
  isSubmitDisabled,
  onSubmitTimesheetClick,
}) {
  const { translate } = useLocales();
  return (
    <Box>
      {isLoading ? (
        <Box
          sx={{
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            height: "100vh",
          }}
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          <Box padding={"2% 3% 10% 4%"}>
            <Stack
              direction="row"
              alignItems="center"
              justifyContent="space-between"
              sx={{ width: "100%" }}
            >
              <Stack direction="row" alignItems="center" spacing={1}>
                <HighlightOffIcon onClick={handleClose} />
                <Typography noWrap variant="h4">
                  {translate("Submit Timesheet")}
                </Typography>
              </Stack>
              {timesheetStatus !== TIMESHEET_STATUS.not_submitted && (
                <Box
                  sx={{
                    marginLeft: "auto",
                    padding: "5px 20px",
                    backgroundColor: "#edf2f7",
                    borderRadius: "4px",
                    border: "1px solid #cbd5e0",
                  }}
                >
                  <Typography color={"error"}>
                    {timesheetStatus === TIMESHEET_STATUS.submitted
                      ? TIMESHEET_STATUS.timesheet_submitted
                      : timesheetStatus === TIMESHEET_STATUS.approved
                      ? TIMESHEET_STATUS.timessheet_approved
                      : timesheetStatus === TIMESHEET_STATUS.recall
                      ? TIMESHEET_STATUS.timesheet_recall
                      : TIMESHEET_STATUS.timessheet_not_submitted}
                  </Typography>
                </Box>
              )}
            </Stack>

            <Box>
              <Box>
                <Typography sx={{ marginLeft: "0.5rem", marginTop: "0.5rem" }}>
                  Start Date - End Date
                </Typography>
              </Box>
              <Box>
                <Stack
                  sx={{
                    backgroundColor: "#f7f8fb",
                    height: "40px",
                    display: "inline-flex",
                    alignItems: "center",
                    borderRadius: "4px",
                    padding: 1,
                    marginLeft: "0.5rem",
                    marginTop: "0.5rem",
                  }}
                  direction={"row"}
                >
                  <Typography>
                    {fDateDMY(startDate)} - {fDateDMY(endDate)}
                  </Typography>
                </Stack>
              </Box>
            </Box>
            <Box sx={{ marginTop: 1 }}>
              <Stack
                sx={{
                  backgroundColor: "#f3efff",
                  height: "40px",
                  display: "inline-flex",
                  alignItems: "center",
                  borderRadius: "4px",
                  marginLeft: "0.5rem",
                  marginTop: "0.5rem",
                  marginBottom: "0.5rem",
                }}
                direction={"row"}
                spacing={1}
              >
                <Typography sx={{ paddingLeft: "10px" }}>
                  Total Hrs - {totalHrs}
                </Typography>
                <Typography>|</Typography>
                <Typography sx={{ paddingRight: "10px" }}>
                  Timesheet Hrs - {totalBillableHrs}
                </Typography>
                <Typography>|</Typography>
                <Typography sx={{ paddingRight: "10px" }}>
                  Unplanned Hrs - {unPlannedHrs}
                </Typography>
                <Typography>|</Typography>
                <Typography sx={{ paddingRight: "10px" }}>
                  Time Off Hrs - {timeOffHrs}
                </Typography>
              </Stack>
              {errorMessage && (
                <Typography sx={{ marginLeft: 1 }} color="red">
                  {errorMessage}
                </Typography>
              )}
            </Box>
            <Box sx={{ marginLeft: "0.5rem", marginTop: "0.5rem" }}>
              {ongoingProjectArr.length === 0 ? (
                <Box>
                  <Typography color="red">
                    No clients allocated yet. Please enter your unplanned hours
                    and time off to proceed.
                  </Typography>
                </Box>
              ) : (
                <>
                  <Grid container spacing={4}>
                    <Grid item xs={5}>
                      <label
                        style={{
                          display: "block",
                          color: "#4a5568",
                          fontWeight: "500",
                          marginBottom: "8px",
                        }}
                      >
                        Client Name
                      </label>
                    </Grid>
                    <Grid item xs={3.5}>
                      <label
                        style={{
                          display: "block",
                          color: "#4a5568",
                          fontWeight: "500",
                          marginBottom: "8px",
                        }}
                      >
                        Allocated Hrs
                      </label>
                    </Grid>
                    <Grid item xs={3.5}>
                      <label
                        style={{
                          display: "block",
                          color: "#4a5568",
                          fontWeight: "500",
                          marginBottom: "8px",
                        }}
                      >
                        Timesheet Hrs
                      </label>
                    </Grid>
                  </Grid>

                  {allocatedClientData.map((item, index) => (
                    <Box key={`${item.client_name}_${index}`}>
                      <Grid container spacing={4} key={item.client_name}>
                        <Grid item xs={5}>
                          <TextField
                            value={item.client_name}
                            fullWidth
                            variant="outlined"
                            InputProps={{
                              readOnly: true,
                              style: { backgroundColor: "#edf2f7" },
                            }}
                          />
                          {timesheetStatus === TIMESHEET_STATUS.recall && (
                            <Box
                              sx={{
                                border: "1px solid #e0e0e0",
                                borderRadius: "8px",
                                padding: "10px",
                                marginTop: "10px",
                                marginBottom: "15px",
                                width: "500px",
                              }}
                            >
                              <Typography
                                sx={{
                                  fontSize: "12px",
                                }}
                              >
                                <span style={{ color: "black" }}>
                                  Approver's Comment:
                                </span>{" "}
                                <span style={{ color: "red" }}>
                                  {item.manager_comments}
                                </span>
                              </Typography>
                            </Box>
                          )}
                        </Grid>

                        <Grid item xs={3.5}>
                          <TextField
                            value={item.allocated_hours}
                            fullWidth
                            variant="outlined"
                            InputProps={{
                              readOnly: true,
                              style: { backgroundColor: "#edf2f7" },
                            }}
                          />
                        </Grid>
                        <Grid item xs={3.5} sx={{ marginBottom: "10px" }}>
                          <Box
                            sx={{
                              border: "1px solid #dce0e4",
                              borderRadius: "5px",
                              paddingTop: 0.9,
                              paddingBottom: 0.9,
                              backgroundColor: "#ffffff",
                              display: "flex",
                              alignItems: "center",
                              gap: 1,
                            }}
                          >
                            <TextField
                              size="small"
                              onChange={handleHoursChange(
                                "timeSheet",
                                item.contract_sow_name
                              )}
                              placeholder="00"
                              variant="outlined"
                              disabled={
                                timesheetStatus === TIMESHEET_STATUS.approved
                              }
                              value={
                                billableHours[item.contract_sow_name]?.split(
                                  ":"
                                )[0]
                              }
                              inputProps={{
                                maxLength: 2,
                                style: {
                                  textAlign: "center",
                                  backgroundColor: "#ffffff",
                                },
                              }}
                              sx={{
                                width: "60px",
                                marginLeft: 1,
                              }}
                              type="number"
                            />
                            <InputAdornment position="end">:</InputAdornment>
                            <TextField
                              onChange={handleMinutesChange(
                                "timeSheet",
                                item.contract_sow_name
                              )}
                              placeholder="00"
                              size="small"
                              variant="outlined"
                              value={
                                billableHours[item.contract_sow_name]?.split(
                                  ":"
                                )[1]
                              }
                              disabled={
                                timesheetStatus === TIMESHEET_STATUS.approved
                              }
                              inputProps={{
                                maxLength: 2,
                                style: {
                                  textAlign: "center",
                                  backgroundColor: "#ffffff",
                                },
                              }}
                              sx={{ width: "60px", marginRight: 1 }}
                              type="number"
                            />
                          </Box>

                          {timeToMinutes(`${item.allocated_hours}:`) <
                            timeToMinutes(
                              String(billableHours[item.contract_sow_name])
                            ) &&
                            timesheetStatus !== TIMESHEET_STATUS.approved && (
                              <FormControlLabel
                                sx={{
                                  alignItems: "flex-start",
                                  marginTop: "8px",
                                }}
                                control={
                                  <Checkbox
                                    style={{
                                      color: checkedStates[
                                        item.contract_sow_name
                                      ]
                                        ? "#3b82f6"
                                        : "red",
                                      cursor:
                                        timesheetStatus ===
                                        TIMESHEET_STATUS.approved
                                          ? "not-allowed"
                                          : "pointer",
                                    }}
                                    checked={
                                      !!checkedStates[item.contract_sow_name]
                                    }
                                    disabled={
                                      timesheetStatus ===
                                      TIMESHEET_STATUS.approved
                                    }
                                    onChange={handleCheckboxChange(
                                      item.contract_sow_name
                                    )}
                                  />
                                }
                                label={
                                  <span
                                    style={{
                                      color: checkedStates[
                                        item.contract_sow_name
                                      ]
                                        ? "#4a5568"
                                        : "red",
                                    }}
                                  >
                                    Overtime Entry Requires Manager Approval.
                                    Please select the checkbox to confirm
                                  </span>
                                }
                              />
                            )}
                        </Grid>
                      </Grid>
                    </Box>
                  ))}
                </>
              )}
            </Box>
            <Box sx={{ marginLeft: "0.5rem", marginTop: "0.5rem" }}>
              <Grid
                sx={{
                  backgroundColor: "#f8f6f0",
                  display: "flex",
                  alignItems: "center",
                  borderRadius: "10px",
                  padding: "10px",
                }}
                container
              >
                <Grid item xs={4} sx={{ width: "25%", padding: 2.5 }}>
                  <label
                    style={{
                      display: "block",
                      color: "#4a5568",
                      fontWeight: "500",
                      marginBottom: "8px",
                    }}
                  >
                    Unallocated / Non-Working
                  </label>
                  <Box
                    sx={{
                      border: "1px solid #dce0e4",
                      borderRadius: "5px",
                      paddingTop: 0.9,
                      paddingBottom: 0.9,
                      backgroundColor: "#ffffff",
                    }}
                    display="flex"
                    alignItems="center"
                  >
                    <TextField
                      size="small"
                      onChange={(e) => handleHrsChange("unplanned", "hours", e)}
                      placeholder="00"
                      variant="outlined"
                      inputProps={{
                        maxLength: 2,
                        style: {
                          textAlign: "center",
                          backgroundColor: "#ffffff",
                        },
                      }}
                      disabled={timesheetStatus === TIMESHEET_STATUS.approved}
                      sx={{ width: "60px", marginRight: 1, marginLeft: 1 }}
                      type="number"
                      value={unPlannedHrs?.split(":")[0]} // Extract hours part
                    />
                    <InputAdornment position="end">:</InputAdornment>
                    <TextField
                      onChange={(e) =>
                        handleHrsChange("unplanned", "minutes", e)
                      }
                      placeholder="00"
                      size="small"
                      variant="outlined"
                      inputProps={{
                        maxLength: 2,
                        style: {
                          textAlign: "center",
                          backgroundColor: "#ffffff",
                        },
                      }}
                      sx={{ width: "60px" }}
                      type="number"
                      value={unPlannedHrs?.split(":")[1]}
                      disabled={timesheetStatus === TIMESHEET_STATUS.approved}
                    />
                  </Box>
                  {
                    <Typography sx={{ color: "red", fontSize: "0.8rem" }}>
                      {errorMessageUnplanned}
                    </Typography>
                  }
                </Grid>
                <Grid item xs={7.7} sx={{ position: "relative" }}>
                  <label
                    style={{
                      display: "block",
                      color: "#4a5568",
                      fontWeight: "500",
                      marginBottom: "8px",
                    }}
                  >
                    Comments
                  </label>
                  <TextField
                    onChange={handleUnplannedHrsCmtAdded}
                    onBlur={() => {
                      if (unPlannedHrsCmtError.includes("/")) {
                        setUnPlannedHrsCmtError("");
                      }
                    }}
                    placeholder="Add comments"
                    fullWidth
                    variant="outlined"
                    InputProps={{ style: { backgroundColor: "#ffffff" } }}
                    value={unPlannedHrsCmt}
                    disabled={timesheetStatus === TIMESHEET_STATUS.approved}
                  />
                  {unPlannedHrsCmtError && (
                    <Typography
                      sx={{
                        color: unPlannedHrsCmtError.includes("/")
                          ? "black"
                          : "red",
                        fontSize: "0.8rem",
                        position: "absolute",
                        bottom: "-20px",
                        left: 0,
                        width: "100%",
                      }}
                    >
                      {unPlannedHrsCmtError}
                    </Typography>
                  )}
                </Grid>
              </Grid>
              <Grid
                sx={{
                  marginTop: 1,
                  backgroundColor: "#f8f6f0",
                  display: "flex",
                  alignItems: "center",
                  borderRadius: "10px",
                  padding: "10px",
                }}
                container
              >
                <Grid item xs={4} sx={{ width: "25%", padding: 2.5 }}>
                  <label
                    style={{
                      display: "block",
                      color: "#4a5568",
                      fontWeight: "500",
                      marginBottom: "8px",
                    }}
                  >
                    Time Off (Sickness/PTO)
                  </label>
                  <Box
                    sx={{
                      border: "1px solid #dce0e4",
                      borderRadius: "5px",
                      paddingTop: 0.9,
                      paddingBottom: 0.9,
                      backgroundColor: "#ffffff",
                      position: "relative", // Add this line
                    }}
                    display="flex"
                    alignItems="center"
                  >
                    <TextField
                      size="small"
                      onChange={(e) => handleHrsChange("timeOff", "hours", e)}
                      placeholder="00"
                      variant="outlined"
                      inputProps={{
                        maxLength: 2,
                        style: {
                          textAlign: "center",
                          backgroundColor: "#ffffff",
                        },
                      }}
                      sx={{ width: "60px", marginRight: 1, marginLeft: 1 }}
                      type="number"
                      value={timeOffHrs?.split(":")[0]}
                      disabled={timesheetStatus === TIMESHEET_STATUS.approved}
                    />
                    <InputAdornment position="end">:</InputAdornment>
                    <TextField
                      onChange={(e) => handleHrsChange("timeOff", "minutes", e)}
                      placeholder="00"
                      size="small"
                      variant="outlined"
                      inputProps={{
                        maxLength: 2,
                        style: {
                          textAlign: "center",
                          backgroundColor: "#ffffff",
                        },
                      }}
                      sx={{ width: "60px", marginLeft: 0 }}
                      type="number"
                      value={timeOffHrs?.split(":")[1]}
                      disabled={timesheetStatus === TIMESHEET_STATUS.approved}
                    />
                  </Box>
                  {
                    <Typography
                      sx={{
                        color: "red",
                        fontSize: "0.8rem",
                        position: "absolute",

                        width: "100%",
                      }}
                    >
                      {errorMessageTimeOff}
                    </Typography>
                  }
                </Grid>
                <Grid item xs={7.7} sx={{ position: "relative" }}>
                  <label
                    style={{
                      display: "block",
                      color: "#4a5568",
                      fontWeight: "500",
                      marginBottom: "8px",
                    }}
                  >
                    Comments
                  </label>
                  <TextField
                    onChange={handleTimeOffHrsCmtAdded}
                    onBlur={() => {
                      if (timeOffHrsCmtError.includes("/")) {
                        setTimeOffHrsCmtError("");
                      }
                    }}
                    placeholder="Add comments"
                    fullWidth
                    variant="outlined"
                    InputProps={{ style: { backgroundColor: "#ffffff" } }}
                    value={timeOffHrsCmt}
                    disabled={timesheetStatus === TIMESHEET_STATUS.approved}
                  />

                  <Typography
                    sx={{
                      color: timeOffHrsCmtError.includes("/") ? "black" : "red",
                      fontSize: "0.8rem",
                      position: "absolute",

                      left: 0,
                      width: "100%",
                    }}
                  >
                    {timeOffHrsCmtError}
                  </Typography>
                </Grid>
              </Grid>
            </Box>
            <Box
              sx={{
                marginTop: 1,
                display: "flex",
                alignItems: "center",
                justifyContent: "flex-end",
              }}
            >
              <Button
                onClick={handleClose}
                variant="outlined"
                sx={{ marginRight: 2 }}
              >
                Back
              </Button>
              <Button
                disabled={isSubmitDisabled()}
                variant="contained"
                onClick={onSubmitTimesheetClick}
              >
                {timesheetStatus === TIMESHEET_STATUS.recall ||
                timesheetStatus === TIMESHEET_STATUS.submitted
                  ? "Update"
                  : "Submit"}
              </Button>
            </Box>
          </Box>
        </>
      )}
    </Box>
  );
}
