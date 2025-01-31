import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Button,
  Typography,
} from "@mui/material";
import PageHeader from "../../components/PageHeader";
import useLocales from "../../hooks/useLocales";
import { createStyles } from "@mui/styles";
import { useTheme } from "@emotion/react";
import TimeSheetAPI from "../../services/TimeSheetService";
import useAxiosPrivate, { isValidResponse } from "../../hooks/useAxiosPrivate";
import { useLocation } from "react-router-dom";
import { useSnackbar } from "notistack";
import { anchorOrigin } from "../../utils/constants";

import { timesheetAccess } from "../../utils/rolesAccessMapping";
import { useData } from "../../contexts/DataContext";
import AddFormModal from "../../components/AddFormModal";
import TerminateEmployee from "./TerminateEmployee";
export default function TimesheetOverview() {
  const theme = useTheme();
  const styles = useStyles(theme);
  const { userData } = useData();
  const { translate } = useLocales();
  const { state } = useLocation();
  const { enqueueSnackbar } = useSnackbar();
  const axiosPrivate = useAxiosPrivate();
  const [visibleCount, setVisibleCount] = useState(1);
  const [timesheetArray, setTimesheetArray] = useState([]);
  const [employeeData, setEmployeeData] = useState([]);
  const [ongoingProjectsTableData, setOngoingProjectsTableData] = useState([]);
  const [completedProjectsTableData, setCompletedProjectsTableData] = useState(
    []
  );
  const isPmoUser = timesheetAccess.terminateEmployee(userData);
  const resourceId = state?.resource_id ?? "";
  const [isTerminateOpen, setTerminateOpen] = useState(false);

  const showTerminateModal = () => {
    setTerminateOpen(true);
  };
  const closeTerminateModal = () => {
    setTerminateOpen(false);
  };

  useEffect(() => {
    getDetail();
  }, []);

  const onError = (message) => {
    enqueueSnackbar("AllocationDetail - " + message, {
      anchorOrigin,
      variant: "error",
    });
  };
  async function getDetail() {
    try {
      const response = await TimeSheetAPI.OVERVIEW(axiosPrivate, resourceId);
      if (isValidResponse(response)) {
        setEmployeeData(response?.data);
        setOngoingProjectsTableData(response?.data?.ongoing_projects);
        setCompletedProjectsTableData(response?.data?.completed_projects);
      } else {
        onError(translate("error.fetch"));
      }
    } catch (error) {
      console.log("Error in C - ", error);
      onError(translate("error.fetch"));
    }
  }

  useEffect(() => {
    updatePageData();
  }, [employeeData]);

  async function updatePageData() {
    setTimesheetArray([
      {
        id: "Employe Id",
        value: employeeData ? employeeData?.employee_number : "--",
      },

      {
        id: "Name",
        value: employeeData ? employeeData?.employee_full_name : "--",
      },
      {
        id: "Role",
        value: employeeData ? employeeData?.resource_role : "--",
      },
      {
        id: "Active Projects",
        value: employeeData ? employeeData?.ongoing_projects?.length : "--",
      },
      {
        id: "Projects Completed",
        value: employeeData ? employeeData?.completed_projects?.length : "--",
      },
      {
        id: "Planned Hrs",
        value: employeeData ? employeeData?.total_planned_hours : "--",
      },
    ]);
  }

  const TimesheetItem = ({ translateLabelId, value }) => {
    return (
      <Box sx={styles.costItemBox}>
        <Typography sx={styles.costLabel}>
          {translate(translateLabelId)}
        </Typography>
        <Typography sx={styles.costValue}>{value}</Typography>
      </Box>
    );
  };

  const TimesheetContainer = () => {
    return (
      <Box sx={styles.costBox}>
        <Grid
          container
          spacing={{ xs: 2, md: 3 }}
          columns={{ xs: 4, sm: 8, md: 12 }}
          padding={3}
        >
          {timesheetArray.map((item, index) => (
            <Grid item xs={2} sm={4} md={4} key={index}>
              <TimesheetItem translateLabelId={item.id} value={item.value} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  const viewMoreData = () => {
    setVisibleCount((prevCount) => prevCount + 3);
  };

  const OngoingProjectsTable = () => {
    if (ongoingProjectsTableData.length === 0) {
      return (
        <TableContainer component={Paper} sx={{ marginTop: "12px" }}>
          <Typography sx={styles.costTitle}>
            {translate("Active Projects")}
          </Typography>
          <Table sx={styles.table} aria-label="resource table">
            <TableHead sx={{ marginTop: "10px" }}>
              <TableRow>
                <TableCell sx={styles.headerCell}>Client Name</TableCell>
                <TableCell sx={styles.headerCell}>Contract Name</TableCell>
                <TableCell sx={styles.headerCell}>Start Date</TableCell>
                <TableCell sx={styles.headerCell}>End Date</TableCell>
                <TableCell sx={styles.headerCell}>Planned Hrs</TableCell>
                <TableCell sx={styles.headerCell}>Timesheet Hrs</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: "center" }}>
                  <Typography sx={{ fontWeight: "bold" }}>
                    The employee has no active projects.
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      );
    }
    return (
      <TableContainer component={Paper}>
        <Typography sx={styles.costTitle}>
          {translate("Active Projects")}
        </Typography>
        <Table sx={styles.table} aria-label="resource table">
          <TableHead sx={{ marginTop: "10px" }}>
            <TableRow>
              <TableCell sx={styles.headerCell}>Client Name</TableCell>
              <TableCell sx={styles.headerCell}>Contract Name</TableCell>
              <TableCell sx={styles.headerCell}>Start Date</TableCell>
              <TableCell sx={styles.headerCell}>End Date</TableCell>
              <TableCell sx={styles.headerCell}>Planned Hrs</TableCell>
              <TableCell sx={styles.headerCell}>Timesheet Hrs</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {ongoingProjectsTableData?.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.client_name}</TableCell>
                <TableCell>{item.contractsow_name}</TableCell>
                <TableCell>{item.start_date}</TableCell>
                <TableCell>{item.end_date}</TableCell>
                <TableCell>{item.allocated_hours} Hrs</TableCell>
                <TableCell>{item.planned_hours} Hrs</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  const CompletedProjectsTable = () => {
    if (completedProjectsTableData.length === 0) {
      return (
        <TableContainer component={Paper} sx={{ marginTop: "12px" }}>
          <Typography sx={styles.costTitle}>
            {translate("Completed Projects")}
          </Typography>
          <Table sx={styles.table} aria-label="resource table">
            <TableHead sx={{ marginTop: "10px" }}>
              <TableRow>
                <TableCell sx={styles.headerCell}>Client Name</TableCell>
                <TableCell sx={styles.headerCell}>Contract Name</TableCell>
                <TableCell sx={styles.headerCell}>Start Date</TableCell>
                <TableCell sx={styles.headerCell}>End Date</TableCell>
                <TableCell sx={styles.headerCell}>Planned Hrs</TableCell>
                <TableCell sx={styles.headerCell}>Timesheet Hrs</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              <TableRow>
                <TableCell colSpan={6} sx={{ textAlign: "center" }}>
                  <Typography sx={{ fontWeight: "bold" }}>
                    The employee has no completed projects.
                  </Typography>
                </TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </TableContainer>
      );
    }
    return (
      <TableContainer component={Paper} sx={{ marginTop: "12px" }}>
        <Typography sx={styles.costTitle}>
          {translate("Completed Projects")}
        </Typography>
        <Table sx={styles.table} aria-label="resource table">
          <TableHead sx={{ marginTop: "10px" }}>
            <TableRow>
              <TableCell sx={styles.headerCell}>Client Name</TableCell>
              <TableCell sx={styles.headerCell}>Contract Name</TableCell>
              <TableCell sx={styles.headerCell}>Start Date</TableCell>
              <TableCell sx={styles.headerCell}>End Date</TableCell>
              <TableCell sx={styles.headerCell}>Planned Hrs</TableCell>
              <TableCell sx={styles.headerCell}>Timesheet Hrs</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {completedProjectsTableData
              .slice(0, visibleCount)
              .map((item, index) => (
                <TableRow key={index}>
                  <TableCell>{item.client_name}</TableCell>
                  <TableCell>{item.contractsow_name}</TableCell>
                  <TableCell>{item.start_date}</TableCell>
                  <TableCell>{item.end_date}</TableCell>
                  <TableCell>{item.allocated_hours} Hrs</TableCell>
                  <TableCell>{item.planned_hours} Hrs</TableCell>
                </TableRow>
              ))}
            {visibleCount < employeeData?.completed_projects?.length && (
              <TableRow sx={styles.footer}>
                <TableCell colSpan={6} sx={{ textAlign: "center" }}>
                  <span
                    style={{ cursor: "pointer", fontWeight: "bold" }}
                    onClick={viewMoreData}
                  >
                    View More
                  </span>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    );
  };

  return (
    <>
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        sx={{ mt: 1 }}
      >
        <PageHeader
          primaryTitle={translate("Timesheet Overview")}
          showSecondaryTitle={false}
          buttonText={translate("")}
          onClickButton={""}
          showBack={true}
          buttonStyle={""}
          isDisabled={""}
        />
        {isPmoUser && (
          <Button variant="contained" onClick={showTerminateModal}>
            Terminate Employee
          </Button>
        )}

        {isTerminateOpen && (
          <AddFormModal onClose={closeTerminateModal}>
            <TerminateEmployee handleClose={closeTerminateModal} />
          </AddFormModal>
        )}
      </Box>

      <TimesheetContainer />
      <OngoingProjectsTable />
      <CompletedProjectsTable />
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
