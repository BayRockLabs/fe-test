import * as React from "react";
import PageHeader from "../../components/PageHeader";
import useLocales from "../../hooks/useLocales";
import {
  Box,
  CircularProgress,
  createStyles,
  Grid,
  Typography,
} from "@mui/material";
import {
  Bar,
  BarChart,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { axiosPrivate } from "../../services/axios";
import DASHBOARDAPI from "../../services/DashBoardService";
import { isValidResponse } from "../../hooks/useAxiosPrivate";
import { useTheme } from "@emotion/react";
const useStyles = createStyles((theme) => ({
  loading: {
    display: "flex",
    flexDirection: "column",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    height: "100vh",
  },
}));
const DashBoardCustomView = () => {
  const { translate } = useLocales();
  const theme = useTheme();
  const styles = useStyles(theme);
  const [loading, setLoading] = React.useState(true);
  const [sowContractData, setSowContractData] = React.useState({});

  const [invoicesData, seInvoicesData] = React.useState({});

  const [sowVsMilestone, setSowVsMilestone] = React.useState({});

  React.useEffect(() => {
    fetchData();
  }, []);
  async function fetchData() {
    setLoading(true);
    try {
      const response = await DASHBOARDAPI.DATA(axiosPrivate);
      if (isValidResponse(response)) {
        setSowContractData(response?.data?.dashboard?.active_sows);

        seInvoicesData(response?.data?.dashboard?.active_invoices);

        setSowVsMilestone(
          response?.data?.dashboard?.sow_vs_milestones_comparison
        );
      }
    } catch (error) {
      console.log("error while fetching data", error);
    } finally {
      setLoading(false);
    }
  }

  function formatCurrency(num) {
    const isNegative = num < 0;
    num = Math.abs(num);

    let suffix = "";
    let formattedNumber = num;

    if (num >= 1e12) {
      formattedNumber = (num / 1e12).toFixed(1);
      suffix = "T";
    } else if (num >= 1e9) {
      formattedNumber = (num / 1e9).toFixed(1);
      suffix = "B";
    } else if (num >= 1e6) {
      formattedNumber = (num / 1e6).toFixed(1);
      suffix = "M";
    } else if (num >= 1e3) {
      formattedNumber = (num / 1e3).toFixed(1);
      suffix = "K";
    }

    formattedNumber = formattedNumber.toString();

    if (formattedNumber.endsWith(".0")) {
      formattedNumber = formattedNumber.slice(0, -2);
    }

    const result = `$${formattedNumber}${suffix}`;

    return isNegative ? `-${result}` : result;
  }

  const groupedData = [
    {
      group: "SOW",
      total_active_sow_amount: sowVsMilestone?.total_active_sow_amount || 0,
    },
    {
      group: "Milestone",
      total_active_sow_amount: sowVsMilestone?.total_milestone_amount || 0,
    },
  ];
  if (loading) {
    return (
      <Box sx={styles.loading}>
        <CircularProgress />
      </Box>
    );
  }
  return (
    <>
      <Box
        sx={{ paddingRight: "1rem", paddingLeft: "1rem", minHeight: "81vh" }}
      >
        <Box sx={{ marginLeft: "1rem" }}>
          <PageHeader
            primaryTitle={translate("Insights")}
            showSecondaryTitle={false}
          />
        </Box>

        <Grid container spacing={2}>
          {/* Active SOW Contracts */}
          <Grid item xs={12} sm={6} md={4} lg={4}>
            <Box
              sx={{
                height: 250,
                background: "linear-gradient(135deg, #eef2ff, #c7d2fe)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
                borderRadius: "12px",
                transition:
                  "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: "0px 8px 18px rgba(0, 0, 0, 0.2)",
                },
              }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontWeight: "bold",
                  fontSize: "3rem",
                  color: "#1e3a8a",
                  textAlign: "center",
                }}
              >
                {sowContractData?.active_sow_count}
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: "600",
                  fontSize: "1.1rem",
                  color: "#4338ca",
                  textAlign: "center",
                }}
              >
                Active SOW Contracts
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  color: "#312e81",
                  textAlign: "center",
                }}
              >
                {formatCurrency(sowVsMilestone?.total_active_sow_amount)}
              </Typography>
            </Box>
          </Grid>

          {/* Active Invoices */}
          <Grid item xs={12} sm={6} md={4} lg={4}>
            <Box
              sx={{
                height: 250, // Uniform height
                background: "linear-gradient(135deg, #e0f7fa, #b2ebf2)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
                borderRadius: "12px",
                transition:
                  "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: "0px 8px 18px rgba(0, 0, 0, 0.2)",
                },
              }}
            >
              <Typography
                variant="h1"
                sx={{
                  fontWeight: "bold",
                  fontSize: "3rem",
                  color: "#006064",
                  textAlign: "center",
                }}
              >
                {invoicesData?.active_invoice_count}
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: "600",
                  fontSize: "1.1rem",
                  color: "#00838f",
                  textAlign: "center",
                }}
              >
                Active Invoices
              </Typography>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: "bold",
                  color: "#004d40",
                  textAlign: "center",
                }}
              >
                {formatCurrency(invoicesData?.total_active_invoice_amount)}
              </Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={6} md={4} lg={4}>
            <Box
              sx={{
                height: 250, // Made uniform
                background: "linear-gradient(135deg, #eef2ff, #c7d2fe)",
                display: "flex",
                flexDirection: "column",
                justifyContent: "center",
                alignItems: "center",
                boxShadow: "0px 6px 12px rgba(0, 0, 0, 0.15)",
                borderRadius: "12px",
                padding: "1rem",
                transition:
                  "transform 0.3s ease-in-out, box-shadow 0.3s ease-in-out",
                "&:hover": {
                  transform: "scale(1.05)",
                  boxShadow: "0px 8px 18px rgba(0, 0, 0, 0.2)",
                },
              }}
            >
              <Typography
                variant="subtitle1"
                sx={{
                  fontWeight: "600",
                  fontSize: "1.1rem",
                  color: "#4338ca",
                  mb: 1,
                  textAlign: "center",
                }}
              >
                SOW Vs Milestone
              </Typography>
              <ResponsiveContainer width={280} height={200}>
                <BarChart
                  data={groupedData}
                  margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                >
                  <XAxis dataKey="group" axisLine={true} tickLine={false} />
                  <YAxis
                    axisLine={true}
                    tickLine={false}
                    tickFormatter={(value) => {
                      if (value >= 1000000) return `$${value / 1000000}M`; // Format as M for millions
                      if (value >= 1000) return `$${value / 1000}K`; // Format as K for thousands
                      return `$${value}`; // Default format
                    }}
                  />
                  <Tooltip />
                  <Bar dataKey="total_active_sow_amount" name="Amount">
                    {groupedData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.group === "SOW" ? "#08ab5f" : "#69e0bd"}
                      />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </Box>
          </Grid>
        </Grid>
      </Box>
    </>
  );
};
export default DashBoardCustomView;
