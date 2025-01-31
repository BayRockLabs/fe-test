import React, { useEffect, useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Button,
  Grid,
  TextField,
  Box,
  createStyles,
  Link,
  CircularProgress,
} from "@mui/material";
import { DatePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import SearchTableToolbar from "../clients/SearchTableToolbar";
import { useTheme } from "@emotion/react";
import axios, { axiosPrivate } from "../../services/axios";
import RESOURCE from "../../services/ResourceUtlilization";
import dayjs from "dayjs";
import { displayError } from "../../utils/handleErrors";
import { useSnackbar } from "notistack";
import { anchorOrigin } from "../../utils/constants";

const useStyles = createStyles((theme) => ({
  loading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100vh",
  },
  searchInput: {
    backgroundColor: theme.palette.primary.contrastText,
    borderRadius: "12px",
    width: "40%",
  },
  searchBarContainer: {
    display: "flex",
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 2,
    marginBottom: 2,
  },
}));

const ResourceUtilization = () => {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const { enqueueSnackbar } = useSnackbar();
  const theme = useTheme();
  const styles = useStyles(theme);
  const [page, setPage] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [startDate, setStartDate] = useState(
    dayjs().startOf("month").format("YYYY-MM-DD") // First day of the current month
  );
  const [endDate, setEndDate] = useState(
    dayjs().endOf("month").format("YYYY-MM-DD") // Last day of the current month
  );
  console.log(startDate, endDate);

  const currentYear = new Date().getFullYear();
  const defaultStartDate = `${currentYear}-01-01`;
  const defaultEndDate = new Date().toISOString().split("T")[0];
  const handleSearch = React.useCallback((query) => {
    setSearchTerm(query);
  }, []);
  const handleNext = (index) => {
    setPage((prev) => ({ ...prev, [index]: (prev[index] || 0) + 1 }));
  };

  const handlePrev = (index) => {
    setPage((prev) => ({
      ...prev,
      [index]: Math.max((prev[index] || 0) - 1, 0),
    }));
  };

  const fetchData = async (start, end) => {
    setLoading(true);
    try {
      const response = await RESOURCE.UTLIZATION_REPORT(
        axiosPrivate,
        start,
        end
      );
      setData(response.data.data);
    } catch (err) {
      displayError(enqueueSnackbar, error, { anchorOrigin });
      setError(err.message || "An error occurred");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Fetch default data for the entire current month
    fetchData(startDate, endDate);
  }, []);

  const handleGetDetails = () => {
    fetchData(startDate, endDate);
  };
  const filteredData = data
    ?.map((group) => ({
      ...group,
      employees: group.employees.filter((employee) =>
        employee.name.toLowerCase().includes(searchTerm.toLowerCase())
      ),
    }))
    .filter((group) => group.employees.length > 0);

  if (loading) {
    return (
      <Box sx={styles.loading}>
        <CircularProgress />
      </Box>
    );
  }
  return (
    <div style={{ padding: "20px" }}>
      {/* Header */}
      <Typography variant="h4" gutterBottom>
        Resource Utilization
      </Typography>

      {/* Search and Filters */}
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        marginBottom={4}
        sx={{ marginTop: "20px" }}
      >
        <Box sx={{ ...styles.searchInput, width: "40%", marginLeft: "2px" }}>
          <SearchTableToolbar
            searchQuery={searchTerm}
            onSearch={handleSearch}
            tableSearchBy={" by Employee"}
          />
        </Box>
        <Box
          display="flex"
          alignItems="center"
          gap={2}
          sx={{ marginRight: "-9px" }}
        >
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Select Start Date"
              value={dayjs(startDate)}
              onChange={(newValue) =>
                setStartDate(newValue?.format("YYYY-MM-DD"))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="medium"
                  style={{
                    background: "#ffffff",
                    borderRadius: "9px",
                    width: "150px",
                  }}
                />
              )}
            />
          </LocalizationProvider>
          <LocalizationProvider dateAdapter={AdapterDayjs}>
            <DatePicker
              label="Select End Date"
              value={dayjs(endDate)}
              onChange={(newValue) =>
                setEndDate(newValue?.format("YYYY-MM-DD"))
              }
              renderInput={(params) => (
                <TextField
                  {...params}
                  size="medium"
                  style={{
                    background: "#ffffff",
                    borderRadius: "9px",
                    width: "150px",
                  }}
                />
              )}
            />
          </LocalizationProvider>

          <Button
            variant="contained"
            style={{
              backgroundColor: "#00c4ff",
              color: "black",
              textTransform: "none",
              padding: "0.5rem 1rem",
              borderRadius: "9px",
              fontWeight: "bold",
            }}
            onClick={handleGetDetails}
          >
            Get Details
          </Button>
        </Box>
      </Box>

      {/* Cards */}
      <Grid container spacing={3}>
        {filteredData?.map((group, index) => {
          const currentPage = page[index] || 0;
          const employeesToShow = group.employees.slice(
            currentPage * 5,
            (currentPage + 1) * 5
          );
          const hasNextPage = (currentPage + 1) * 5 < group.employees.length;
          const hasPrevPage = currentPage > 0;

          return (
            <Grid item xs={12} md={6} key={index}>
              <Card
                sx={{
                  height: "692px",
                  display: "flex",
                  flexDirection: "column",
                }}
              >
                <CardContent
                  sx={{
                    flex: "1 1 auto",
                    display: "flex",
                    flexDirection: "column",
                    justifyContent: "space-between",
                  }}
                >
                  {/* Header Section */}
                  <Box>
                    <Box
                      display="flex"
                      justifyContent="space-between"
                      alignItems="center"
                      marginBottom={2}
                    >
                      <Typography variant="h6">
                        Utilization: {group.range}
                      </Typography>
                      <Typography variant="subtitle1">
                        Count: {group.count}
                      </Typography>
                    </Box>

                    {/* Table Section */}
                    <Table>
                      <TableHead>
                        <TableRow>
                          <TableCell>Employee Name</TableCell>
                          <TableCell>Billability Status (%)</TableCell>
                        </TableRow>
                      </TableHead>
                      <TableBody>
                        {employeesToShow.map((employee, i) => (
                          <TableRow key={i}>
                            <TableCell>{employee.name}</TableCell>
                            <TableCell>
                              <Box
                                display="flex"
                                flexDirection="column"
                                alignItems="flex-start"
                                justifyContent="center"
                              >
                                <Typography variant="body2" color="textPrimary">
                                  Billable:<span>{employee.billable}</span>
                                </Typography>
                                <Typography variant="body2" color="textPrimary">
                                  Non-Billable:{" "}
                                  <span>
                                    {employee.non_billable ||
                                      employee["non-billable"]}
                                  </span>
                                </Typography>
                                {employee.unknown > 0 && (
                                  <Typography
                                    variant="body2"
                                    color="textPrimary"
                                  >
                                    Unknown:<span>{employee.unknown}</span>
                                  </Typography>
                                )}
                              </Box>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </Box>

                  {/* Pagination Section */}
                  <Box
                    display="flex"
                    justifyContent="space-between"
                    alignItems="center"
                    sx={{
                      marginTop: "auto",
                      padding: "16px 0",
                    }}
                  >
                    <Link
                      component="button"
                      underline="hover"
                      disabled={!hasPrevPage}
                      onClick={() => handlePrev(index)}
                      sx={{
                        cursor: hasPrevPage ? "pointer" : "default",
                        color: hasPrevPage ? "primary.main" : "gray",
                      }}
                    >
                      Previous
                    </Link>
                    <Link
                      component="button"
                      underline="hover"
                      disabled={!hasNextPage}
                      onClick={() => handleNext(index)}
                      sx={{
                        cursor: hasNextPage ? "pointer" : "default",
                        color: hasNextPage ? "primary.main" : "gray",
                      }}
                    >
                      Next
                    </Link>
                  </Box>
                </CardContent>
              </Card>
            </Grid>
          );
        })}
      </Grid>
    </div>
  );
};

export default ResourceUtilization;
