import * as React from "react";
import Box from "@mui/material/Box";
import Tab from "@mui/material/Tab";
import TabContext from "@mui/lab/TabContext";
import TabList from "@mui/lab/TabList";
import TabPanel from "@mui/lab/TabPanel";
import { createStyles } from "@mui/styles";
import useLocales from "../../hooks/useLocales";
import { useTheme } from "@emotion/react";
import {
  Button,
  CircularProgress,
  InputAdornment,
  Paper,
  Stack,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from "@mui/material";
import { Table } from "react-bootstrap";
import { AdapterDateFns } from "@mui/x-date-pickers/AdapterDateFns";
import { LocalizationProvider } from "@mui/x-date-pickers/LocalizationProvider";
import SearchIcon from "@mui/icons-material/Search";
import AddFormModal from "../../components/AddFormModal";
import EmpAddTimesheet from "./EmpAddTimesheet";
import { useNavigate } from "react-router-dom";
import { PATH_PAGE } from "../../routes/paths";
import TimesheetManagerView from "./TimesheetManagerView";
import ErrorIcon from "@mui/icons-material/Error";
import ROLES from "../../routes/Roles";
import { useData } from "../../contexts/DataContext";
import TimesheetContext from "../../contexts/TimesheetContext";
import { timesheetAccess } from "../../utils/rolesAccessMapping";
import TimeSheetAPI from "../../services/TimeSheetService";
import { axiosPrivate } from "../../services/axios";

export default function EmpTimeSheetTabs({
  employeeId,
  ongoingProjectArr,
  completedProjectArr,
  totalTimeOffHrs,
  totalUnPlannedHrsCount,
  refresh,
  setRefresh,
  empTimesheetData,
}) {
  const {
    getPendingApprovalCount,
    isTimesheetApprover,
    isTimesheetAdmin,
    isGuestUser,
  } = React.useContext(TimesheetContext);
  const [isAddModel, setAddModel] = React.useState(false);
  const [searchOngoing, setSearchOngoing] = React.useState("");
  const [searchCompleted, setSearchCompleted] = React.useState("");
  const { userData } = useData();
  const [missingTimesheets, setMissingTimesheets] = React.useState({});
  const [isLoading, setLoading] = React.useState(false);
  const hasManagerTabAcess = timesheetAccess.timesheetManagerTab(userData);
  const hasOngoingCompletedTabAccess =
    timesheetAccess.ongoingCompletedProjects(userData);
  const [value, setValue] = React.useState(
    isGuestUser || isTimesheetAdmin ? "3" : "1"
  );
  const { translate } = useLocales();
  const theme = useTheme();
  const styles = useStyles(theme);
  const navigate = useNavigate();

  const [isOngoingWeek, setIsOngoingWeek] = React.useState(false);
  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const onCloseAddModel = () => {
    refresh ? setRefresh(false) : setRefresh(true);
    setAddModel(false);
  };

  const onNavigateToAddTimesheet = () => {
    openAddModel();
    setIsOngoingWeek(true);
  };
  const openAddModel = () => {
    setAddModel(true);
  };

  const handleRowClick = (item) => {
    navigate(PATH_PAGE.timesheetManagement.ongoinProjectTimesheetList, {
      state: { selectedItem: item, employeeId: employeeId },
    });
  };

  const navigateToMissingTimesheets = () => {
    navigate(PATH_PAGE.timesheetManagement.missingTimesheets, {
      state: { employeeId: employeeId },
    });
  };

  const handleUnplannedHrsClick = () => {
    navigate(PATH_PAGE.timesheetManagement.empTimesheetTotalHrs, {
      state: { countPage: "unplanned" },
    });
  };
  const handleTimeOffHrs = () => {
    navigate(PATH_PAGE.timesheetManagement.empTimesheetTotalHrs, {
      state: { countPage: "timeOff" },
    });
  };

  const filteredOngoingProjects = ongoingProjectArr.filter(
    (item) =>
      item.client_name.toLowerCase().includes(searchOngoing.toLowerCase()) ||
      item.contractsow_name.toLowerCase().includes(searchOngoing.toLowerCase())
  );

  const filteredCompletedProjects = completedProjectArr.filter(
    (item) =>
      item.client_name.toLowerCase().includes(searchCompleted.toLowerCase()) ||
      item.contractsow_name.toLowerCase().includes(searchOngoing.toLowerCase())
  );
  const Project_Count = empTimesheetData?.ongoing_projects_counts;

  React.useEffect(() => {
    if (isTimesheetApprover) {
      getPendingApprovalCount();
    }
  }, [isTimesheetApprover, value, getPendingApprovalCount]);

  const fetchMissingTimesheets = async () => {
    try {
      setLoading(true);
      const payload = { employee_email: userData?.user_info?.email };
      const response = await TimeSheetAPI.MISSING_TIMESHEETS(
        axiosPrivate,
        payload
      );
      setMissingTimesheets(response.data);
    } catch (error) {
      console.error("Error fetching pending approval count:", error);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    fetchMissingTimesheets();
  }, []);

  return (
    <>
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
        <Box sx={{ margin: 1 }}>
          <LocalizationProvider dateAdapter={AdapterDateFns}>
            <TabContext value={value}>
              <Box sx={{ borderBottom: 1, borderColor: "divider" }}>
                <TabList
                  onChange={handleChange}
                  aria-label="lab API tabs example"
                >
                  {hasOngoingCompletedTabAccess && (
                    <Tab
                      label={`Ongoing Projects ${
                        Project_Count ? `(${Project_Count})` : ""
                      }`}
                      value="1"
                    />
                  )}
                  {hasOngoingCompletedTabAccess && (
                    <Tab label="Completed Projects" value="2" />
                  )}
                  {hasManagerTabAcess && <Tab label="Manager View" value="3" />}
                </TabList>
              </Box>
              <TabPanel value="1">
                <Box>
                  <Box
                    sx={{
                      marginTop: 1,
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      flexDirection: { xs: "column", sm: "row" }, // stack on mobile
                    }}
                  >
                    <Box
                      sx={{
                        width: { xs: "100%", sm: "70%" }, // Adjust width for mobile
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        flexDirection: { xs: "column", sm: "row" }, // stack on mobile
                      }}
                    >
                      <TextField
                        onChange={(e) => setSearchOngoing(e.target.value)}
                        sx={{
                          marginLeft: "1rem",
                          marginTop: "0.5rem",
                          width: { xs: "100%", sm: "auto" }, // full width on mobile
                        }}
                        size="small"
                        placeholder="Search"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                    </Box>

                    <Box
                      sx={{
                        display: "flex",
                        justifyContent: "space-between",
                        alignItems: "center",
                        gap: 2,
                        marginTop: { xs: "1rem", sm: "0" }, // add margin-top on mobile
                      }}
                    >
                      {missingTimesheets?.count > 0 && (
                        <Button
                          onClick={navigateToMissingTimesheets}
                          variant="contained"
                          sx={{
                            whiteSpace: "nowrap",
                          }}
                        >
                          {translate("Missing Timesheets")}
                        </Button>
                      )}
                      <Button
                        onClick={onNavigateToAddTimesheet}
                        variant="contained"
                        sx={{
                          whiteSpace: "nowrap",
                        }}
                        disabled={ongoingProjectArr.length === 0}
                      >
                        {translate("Submit Timesheet")}
                      </Button>
                    </Box>
                  </Box>
                  <Box sx={{ marginTop: "0.8rem", marginLeft: "1rem" }}>
                    <Stack
                      sx={{
                        backgroundColor: "#f3efff",
                        height: { sm: "90px", md: "60px", lg: "40px" },
                        display: "flex",
                        alignItems: "center",
                        borderRadius: "4px",
                        flexDirection: { xs: "column", sm: "row" }, // Stack vertically on mobile
                        padding: "0.5rem", // Adjust padding for smaller screens
                      }}
                      direction={"row"}
                      spacing={1}
                    >
                      <Typography
                        onClick={handleUnplannedHrsClick}
                        sx={{
                          cursor: "pointer",
                          paddingLeft: { xs: "0", sm: "10px" }, // adjust padding on mobile
                          marginBottom: { xs: "0.5rem", sm: "0" }, // bottom margin on mobile
                        }}
                      >
                        Total Unplanned Hrs -{" "}
                        {totalUnPlannedHrsCount
                          ? totalUnPlannedHrsCount
                          : "00:00"}
                      </Typography>
                      <Typography
                        sx={{
                          display: { xs: "none", sm: "inline" }, // Hide divider on mobile
                        }}
                      >
                        |
                      </Typography>
                      <Typography
                        onClick={handleTimeOffHrs}
                        sx={{
                          cursor: "pointer",
                          paddingRight: { xs: "0", sm: "10px" }, // adjust padding on mobile
                        }}
                      >
                        Total Time Off Hrs -{" "}
                        {totalTimeOffHrs ? totalTimeOffHrs : "00:00"}
                      </Typography>
                    </Stack>
                  </Box>
                  <TableContainer
                    sx={{ marginTop: "0.8rem", marginLeft: 1, height: "500px" }}
                    component={Paper}
                  >
                    <Table sx={styles.table} aria-label="resource table">
                      <TableHead>
                        <TableRow sx={styles.headerCell}>
                          <TableCell sx={styles.headerCell}>
                            Client Name
                          </TableCell>
                          <TableCell sx={styles.headerCell}>
                            Contract Name
                          </TableCell>
                          <TableCell sx={styles.headerCell}>
                            Start Date
                          </TableCell>
                          <TableCell sx={styles.headerCell}>End Date</TableCell>
                          <TableCell sx={styles.headerCell}>
                            Allocated Hrs
                          </TableCell>
                          <TableCell sx={styles.headerCell}>
                            Timesheet Hrs
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredOngoingProjects &&
                        filteredOngoingProjects.length > 0 ? (
                          filteredOngoingProjects.map((item, index) => (
                            <TableRow
                              style={{
                                backgroundColor: "inherit",
                              }}
                              sx={{ cursor: "pointer" }}
                              hover
                              onClick={() => handleRowClick(item)}
                              key={index}
                            >
                              <TableCell>{item.client_name}</TableCell>
                              <TableCell>
                                {item.contractsow_name}
                                {item.recall_count > 0
                                  ? ` (${item.recall_count})`
                                  : ""}
                                {item.recall_count > 0 && (
                                  <Tooltip title="Timesheet recalled. Please resubmit.">
                                    <ErrorIcon
                                      style={{
                                        color: "red",
                                        marginLeft: "8px",
                                        verticalAlign: "middle",
                                        fontSize: "18px",
                                      }}
                                    />
                                  </Tooltip>
                                )}
                              </TableCell>

                              <TableCell>{item.start_date}</TableCell>
                              <TableCell>{item.end_date}</TableCell>
                              <TableCell>{item.allocated_hours} Hrs</TableCell>
                              <TableCell>{item.planned_hours} Hrs</TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow hover>
                            {ongoingProjectArr.length > 0 ? (
                              <TableCell
                                sx={{ fontWeight: "bold" }}
                                colSpan={6}
                                align="center"
                              >
                                No Search result found.
                              </TableCell>
                            ) : (
                              <TableCell
                                sx={{ fontWeight: "bold" }}
                                colSpan={6}
                                align="center"
                              >
                                There are no ongoing projects
                              </TableCell>
                            )}
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </TabPanel>
              <TabPanel value="2">
                <Box>
                  <Box
                    sx={{
                      marginTop: 1,
                      width: "100%",
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                    }}
                  >
                    <Box
                      sx={{
                        width: "70%",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                      }}
                    >
                      <TextField
                        onChange={(e) => setSearchCompleted(e.target.value)}
                        sx={{ marginTop: "0.5rem", marginLeft: "1rem" }}
                        size="small"
                        placeholder="Search"
                        InputProps={{
                          startAdornment: (
                            <InputAdornment position="start">
                              <SearchIcon />
                            </InputAdornment>
                          ),
                        }}
                      />
                      {/* <DatePicker
                                        label="Start Date"
                                        value={startDate}
                                        onChange={(newValue) => setStartDate(newValue)}
                                        renderInput={(params) => <TextField size="small" {...params} sx={{ width: '200px', marginLeft: 1 }} />}
                                    />
                                    <DatePicker
                                        label="End Date"
                                        value={endDate}
                                        onChange={(newValue) => setEndDate(newValue)}
                                        renderInput={(params) => <TextField size="small" {...params} sx={{ width: '200px', marginLeft: 1 }} />}
                                    /> */}
                    </Box>
                  </Box>
                  <Box sx={{ marginTop: "0.8rem", marginLeft: "1rem" }}>
                    <Stack
                      sx={{
                        backgroundColor: "#f3efff",
                        height: "40px",
                        display: "inline-flex",
                        alignItems: "center",
                        borderRadius: "4px",
                      }}
                      direction={"row"}
                      spacing={1}
                    >
                      <Typography
                        onClick={handleUnplannedHrsClick}
                        sx={{ cursor: "pointer", paddingLeft: "10px" }}
                      >
                        Total Unplanned Hrs - {totalUnPlannedHrsCount}
                      </Typography>
                      <Typography>|</Typography>
                      <Typography
                        onClick={handleTimeOffHrs}
                        sx={{ cursor: "pointer", paddingRight: "10px" }}
                      >
                        Total Time Off Hrs - {totalTimeOffHrs}
                      </Typography>
                    </Stack>
                  </Box>
                  <TableContainer
                    sx={{ marginTop: "0.8rem", marginLeft: 1, height: "500px" }}
                    component={Paper}
                  >
                    <Table sx={styles.table} aria-label="resource table">
                      <TableHead>
                        <TableRow sx={styles.headerCell}>
                          <TableCell sx={styles.headerCell}>
                            Client Name
                          </TableCell>
                          <TableCell sx={styles.headerCell}>
                            Contract Name
                          </TableCell>
                          <TableCell sx={styles.headerCell}>
                            Start Date
                          </TableCell>
                          <TableCell sx={styles.headerCell}>End Date</TableCell>
                          <TableCell sx={styles.headerCell}>
                            Total Timesheet Hrs
                          </TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {filteredCompletedProjects &&
                        filteredCompletedProjects.length > 0 ? (
                          filteredCompletedProjects.map((item, index) => (
                            <TableRow key={index}>
                              <TableCell>{item.client_name} </TableCell>
                              <TableCell>{item.contractsow_name}</TableCell>
                              <TableCell>{item.start_date}</TableCell>
                              <TableCell>{item.end_date} </TableCell>
                              <TableCell>{item.planned_hours} </TableCell>
                            </TableRow>
                          ))
                        ) : (
                          <TableRow hover>
                            {completedProjectArr.length > 0 ? (
                              <TableCell
                                sx={{ fontWeight: "bold" }}
                                colSpan={5}
                                align="center"
                              >
                                No search result found
                              </TableCell>
                            ) : (
                              <TableCell
                                sx={{ fontWeight: "bold" }}
                                colSpan={5}
                                align="center"
                              >
                                There are no completed projects
                              </TableCell>
                            )}
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </TableContainer>
                </Box>
              </TabPanel>
              <TabPanel value="3">
                <TimesheetManagerView />
              </TabPanel>
            </TabContext>
          </LocalizationProvider>
          {isAddModel && (
            <AddFormModal onClose={onCloseAddModel}>
              <EmpAddTimesheet
                employeeId={employeeId}
                handleClose={onCloseAddModel}
                ongoingProjectArr={ongoingProjectArr}
                isOngoingWeek={isOngoingWeek}
              />
            </AddFormModal>
          )}
        </Box>
      )}
    </>
  );
}

const useStyles = createStyles((theme) => ({
  costBox: {
    borderRadius: "8px",
    marginTop: 2,
    padding: 2,
    background: theme.palette.background.paper,
    marginBottom: 2,
  },
  costItemBox: {
    padding: theme.spacing(1),
  },
  costLabel: {
    fontFamily: "Inter",
    fontSize: "12px",
    fontStyle: "normal",
    fontWeight: "500",
    lineHeight: "normal",
    color: theme.palette.text.secondary,
  },
  costValue: {
    fontFamily: "Inter",
    fontSize: "13px",
    fontStyle: "normal",
    fontWeight: "500",
    lineHeight: "normal",
    color: theme.palette.text.primary,
    marginTop: theme.spacing(0.5),
  },
  table: {
    minWidth: 650,
    marginTop: 1,
  },
  footer: {
    backgroundColor: "#DFDAEF",
    fontWeight: "bold",
  },
  headerCell: {
    fontWeight: "bold",
    backgroundColor: "#F0F0F0",
  },
  footerCell: {
    textAlign: "center",
    fontWeight: "bold",
  },
  costTitle: {
    fontFamily: "Inter",
    fontSize: "16px",
    fontStyle: "normal",
    fontWeight: "700",
    lineHeight: "normal",
    color: "#1C1D24",
    padding: "14px",
  },
}));
