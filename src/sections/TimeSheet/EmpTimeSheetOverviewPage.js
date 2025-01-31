import React, { useEffect, useState } from "react";
import useLocales from "../../hooks/useLocales";
import { Box, CircularProgress, Grid, Typography } from "@mui/material";
import { createStyles } from "@mui/styles";
import { useTheme } from "@emotion/react";
import EmpTimeSheetTabs from "./EmpTimeSheetTabs";
import TimeSheetAPI from "../../services/TimeSheetService";
import { useData } from "../../contexts/DataContext";
import { axiosPrivate } from "../../services/axios";
import { isValidResponse } from "../../hooks/useAxiosPrivate";
import Page from "../../components/Page";

export default function EmpTimeSheetOverviewPage() {
  const { translate } = useLocales();
  const theme = useTheme();
  const styles = useStyles(theme);
  const [timesheetEmpArray, setEmpTimesheetArray] = useState([]);
  const [empTimesheetData, setEmpTimesheetData] = useState([]);
  const [ongoingProjectArr, setOngoingProjectArr] = useState([]);

  const [completedProjectArr, setCompletedProjectArr] = useState([]);
  const [employeeId, setEmployeeId] = useState("");
  const [totalUnPlannedHrsCount, setTotalUnplannedHrsCount] = useState(0);
  const [totalTimeOffHrs, setTotalTimeOffHrs] = useState(0);
  const [loading, setLoading] = useState(true);
  const { userData } = useData();
  const [refresh, setRefresh] = useState(true);
  const pageTitle = "Timesheets";

  useEffect(() => {
    const userEmail = userData?.user_info?.email;
    const payload = {
      employee_email: userEmail,
    };
    fetchTimesheetData(payload);
  }, [userData, refresh]);

  async function fetchTimesheetData(payload) {
    setLoading(true);
    try {
      const response = await TimeSheetAPI.TIMESHEETMAINPAGE(
        axiosPrivate,
        payload
      );
      if (isValidResponse(response)) {
        setEmpTimesheetData(response?.data);
        setOngoingProjectArr(response?.data.ongoing_projects);
        setCompletedProjectArr(response?.data.completed_projects);
        setTotalUnplannedHrsCount(response?.data.total_unplanned_hours);
        setTotalTimeOffHrs(response?.data.non_billable_hours);
      }
      if (response.data.error === "Employee not found.") {
        setOngoingProjectArr([]);
        setEmpTimesheetData([]);
        setCompletedProjectArr([]);
      }
    } catch (error) {
      console.log("error while getting list ongoing timesheet", error);
    } finally {
      setLoading(false); // Stop loading
    }
  }

  useEffect(() => {
    updatePageData();
    setEmployeeId(empTimesheetData?.employee_id);
  }, [empTimesheetData]);

  async function updatePageData() {
    setEmpTimesheetArray([
      {
        id: "Employee Id",
        value: empTimesheetData ? empTimesheetData?.employee_id : "--",
      },
      {
        id: "Name",
        value: empTimesheetData ? empTimesheetData?.employee_name : "--",
      },
      {
        id: "Role",
        value: empTimesheetData ? empTimesheetData?.employee_role : "--",
      },
      {
        id: "Ongoing Projects",
        value: empTimesheetData
          ? empTimesheetData?.ongoing_projects_counts
          : "--",
      },
      {
        id: "Completed Projects",
        value: empTimesheetData
          ? empTimesheetData?.completed_projects_counts
          : "--",
      },
    ]);
  }

  const TimesheetItem = ({ translateLabelId, value }) => {
    return (
      <Box>
        <Typography sx={styles.costLabel}>
          {translate(translateLabelId)}
        </Typography>
        <Typography sx={styles.costValue}>{value}</Typography>
      </Box>
    );
  };
  const TimesheetEmpContainer = () => {
    return (
      <Box>
        <Box
          sx={{
            background: "#F9FCFF",
            border: "1px solid #D9DFE9",
            borderRadius: "4px",
            margin: 2,
          }}
        >
          <Grid
            container
            spacing={{ xs: 2, sm: 3, md: 4 }}
            columns={{ xs: 1, sm: 2, md: 4, lg: 5 }}
            padding={3}
          >
            {timesheetEmpArray.map((item, index) => (
              <Grid item xs={1} key={index}>
                <TimesheetItem translateLabelId={item.id} value={item.value} />
              </Grid>
            ))}
          </Grid>
        </Box>
      </Box>
    );
  };

  return (
    <Box sx={styles.backgroundWhite}>
      <Box sx={{ paddingTop: 1, paddingBottom: 0.5, paddingLeft: 0.5 }}>
        <Typography sx={styles.title}>Timesheet</Typography>
        <Page title={pageTitle} />
      </Box>
      {loading ? (
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          height="100vh"
        >
          <CircularProgress />
        </Box>
      ) : (
        <>
          <TimesheetEmpContainer />
          <EmpTimeSheetTabs
            employeeId={employeeId}
            ongoingProjectArr={ongoingProjectArr}
            completedProjectArr={completedProjectArr}
            totalTimeOffHrs={totalTimeOffHrs}
            totalUnPlannedHrsCount={totalUnPlannedHrsCount}
            setRefresh={setRefresh}
            refresh={refresh}
            empTimesheetData={empTimesheetData}
          />
        </>
      )}
    </Box>
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
  title: {
    color: theme.palette.text.primary,
    fontFamily: "Inter",
    fontSize: "20px",
    fontStyle: "normal",
    fontWeight: "700",
    lineHeight: "normal",
    whiteSpace: "nowrap",
    marginTop: 1,
    marginLeft: 1,
  },
  backgroundWhite: {
    background: theme.palette.background.paper,
  },
}));
