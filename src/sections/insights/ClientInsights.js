import React, { useState, useEffect } from "react";
import { Box, MenuItem, TextField, Tooltip, Typography } from "@mui/material";
import { useSnackbar } from "notistack";
import { axiosPrivate } from "../../services/axios";
import { isValidResponse } from "../../hooks/useAxiosPrivate";
import ReportsAPI from "../../services/Reports";
import useLocales from "../../hooks/useLocales";
import ClientAPI from "../../services/ClientService";
import { displayError } from "../../utils/handleErrors";
import { anchorOrigin } from "../../utils/constants";
import useClient from "../../hooks/useClient";
import PageHeader from "../../components/PageHeader";
import {
  Bar,
  BarChart,
  LabelList,
  Legend,
  Line,
  LineChart,
  ResponsiveContainer,
  XAxis,
  YAxis,
} from "recharts";

export default function ClientInsights() {
  const { enqueueSnackbar } = useSnackbar();
  const { translate } = useLocales();
  const { selectedClient } = useClient();

  const [clientData, setClientData] = useState({});
  const [contractData, setContractData] = useState([]);
  const [selectedContract, setSelectedContract] = useState("");
  const [contractSowId, setContractSowId] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [resourceCount, setResourceCount] = useState({});
  const [financialData, setFinancialData] = useState(null);
  const [burndownData, setBurndownData] = useState(null);

  const clientId = clientData.uuid;

  const onError = (message) => {
    enqueueSnackbar("ClientDetail - " + message, {
      anchorOrigin,
      variant: "error",
    });
  };

  const getClientDetail = async () => {
    try {
      const response = await ClientAPI.DETAIL(
        axiosPrivate,
        selectedClient.uuid
      );
      if (isValidResponse(response)) {
        setClientData(response.data);
        setContractData(response.data.client_contracts || []);
      } else {
        displayError(
          enqueueSnackbar(translate("Error in Fetching Client Detail"), {
            anchorOrigin,
            variant: "error",
          })
        );
        onError("Invalid response from Client Detail API");
      }
    } catch (error) {
      onError("Error in Client Detail API");
    }
  };

  const fetchResourceCount = async () => {
    try {
      const resourceCountResponse = await ReportsAPI.RESOURCE_COUNTS(
        axiosPrivate,
        clientId,
        contractSowId,
        startDate,
        endDate
      );
      setResourceCount(resourceCountResponse.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchFinancialData = async () => {
    try {
      const financialResponse = await ReportsAPI.FINANCIAL_DATA(
        axiosPrivate,
        clientId,
        contractSowId,
        startDate,
        endDate
      );
      setFinancialData(financialResponse.data);
    } catch (error) {
      console.error(error);
    }
  };

  const fetchBurndownData = async () => {
    try {
      const burndownReport = await ReportsAPI.BURNDOWN(
        axiosPrivate,
        contractSowId
      );
      setBurndownData(burndownReport.data);
    } catch (error) {
      console.error(error);
    }
  };
  useEffect(() => {
    getClientDetail();
  }, []);

  useEffect(() => {
    console.log("Client ID:", clientId);
    console.log("Contract SOW ID:", contractSowId);
    console.log("Start Date:", startDate);
    console.log("End Date:", endDate);
    console.log("Resource Count:", resourceCount);
    console.log("financialData:", financialData);
    console.log("burndownData :", burndownData);
  }, [
    clientId,
    contractSowId,
    startDate,
    endDate,
    resourceCount,
    burndownData,
    financialData,
  ]);
  useEffect(() => {
    if (contractSowId) {
      fetchResourceCount();
      fetchFinancialData();
      fetchBurndownData();
    }
  }, [contractSowId]); // This ensures API call runs after contractSowId is updated

  const handleContractChange = (event) => {
    const selectedContractId = event.target.value;
    setSelectedContract(selectedContractId);

    const selectedContractData = contractData.find(
      (contract) => contract.uuid === selectedContractId
    );

    if (selectedContractData) {
      setContractSowId(selectedContractData.uuid);
      setStartDate(selectedContractData.start_date || "");
      setEndDate(selectedContractData.end_date || "");
    }
  };
  const mockFinancialdata = [
    {
      name: "Financials",
      Revenue: 68400,
      "Cost to Company": 50400,
      "Profit/Loss": 18000,
    },
  ];

  const burndownMockData = [
    {
      week: 1,
      planned_budget: 20000,
      actual_cost: 20000,
      allocation_cost: 0,
      remaining_budget: 80000,
      week_start_date: "2025-01-01T00:00:00",
      week_end_date: "2025-01-05T00:00:00",
    },
    {
      week: 2,
      planned_budget: 20000,
      actual_cost: 35000,
      allocation_cost: 0,
      remaining_budget: 45000,
      week_start_date: "2025-01-08T00:00:00",
      week_end_date: "2025-01-12T00:00:00",
    },
    {
      week: 3,
      planned_budget: 20000,
      actual_cost: 25000,
      allocation_cost: 0,
      remaining_budget: 20000,
      week_start_date: "2025-01-15T00:00:00",
      week_end_date: "2025-01-19T00:00:00",
    },
    {
      week: 4,
      planned_budget: 20000,
      actual_cost: 15000,
      allocation_cost: 0,
      remaining_budget: 5000,
      week_start_date: "2025-01-22T00:00:00",
      week_end_date: "2025-01-26T00:00:00",
    },
    {
      week: 5,
      planned_budget: 20000,
      actual_cost: 5000,
      allocation_cost: 0,
      remaining_budget: 0,
      week_start_date: "2025-01-29T00:00:00",
      week_end_date: "2025-02-02T00:00:00",
    },
  ];

  return (
    <Box>
      <PageHeader primaryTitle={translate("Insights")} />
      <Box
        display="flex"
        justifyContent="space-between"
        sx={{ marginBottom: 2 }}
      >
        <TextField
          select
          label="Select Contract"
          value={selectedContract}
          onChange={handleContractChange}
          sx={{ width: 300 }}
        >
          {contractData?.map((item) => (
            <MenuItem key={item.uuid} value={item.uuid}>
              {item.name}
            </MenuItem>
          ))}
        </TextField>
        <Box
          display="flex"
          justifyContent="center"
          alignItems="center"
          sx={{
            width: "45%",
            padding: "10px",
            borderRadius: 1,
            border: "1px solid #e0e0e0",
          }}
        >
          <Box
            sx={{
              display: "flex",
              flexDirection: "row",
              width: "100%",
              flexWrap: "nowrap",
            }}
          >
            <Box sx={{ flex: 1, textAlign: "center", paddingRight: 1 }}>
              <Box
                sx={{ fontWeight: "bold", marginBottom: 1, color: "#3a3a3a" }}
              >
                Billable Resources
              </Box>
              <Box sx={{ fontSize: "1.5rem", color: "#388e3c" }}>5</Box>
            </Box>

            <Box
              sx={{
                borderLeft: "1px solid #e0e0e0",
                height: "100%",
                margin: "0 10px",
              }}
            />

            <Box sx={{ flex: 1, textAlign: "center", paddingLeft: 1 }}>
              <Box
                sx={{
                  fontWeight: "bold",
                  marginBottom: 1,
                  color: "#3a3a3a",
                  whiteSpace: "nowrap",
                }}
              >
                Non-Billable Resources
              </Box>
              <Box sx={{ fontSize: "1.5rem", color: "#d32f2f" }}>3</Box>
            </Box>
          </Box>
        </Box>
      </Box>
      <Box className="financial-bar-chart" sx={{ width: 500, marginTop: 5 }}>
        <Typography variant="h6" gutterBottom>
          Financial Overview
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={mockFinancialdata}>
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="Revenue" fill="#2196F3">
              <LabelList dataKey="Revenue" position="top" />
            </Bar>
            <Bar dataKey="Cost to Company" fill="#F44336">
              <LabelList dataKey="Cost to Company" position="top" />
            </Bar>
            <Bar dataKey="Profit/Loss" fill="#4CAF50">
              <LabelList dataKey="Profit/Loss" position="top" />
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </Box>

      <Box className="financial-bar-chart" sx={{ width: 500, marginTop: 5 }}>
        <Typography variant="h6" gutterBottom>
          Burndown Report
        </Typography>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={burndownMockData}>
            <XAxis dataKey="week" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line type="monotone" dataKey="planned_budget" stroke="#4CAF50" />
            <Line type="monotone" dataKey="actual_cost" stroke="#F44336" />
            <Line type="monotone" dataKey="remaining_budget" stroke="#2196F3" />
          </LineChart>
        </ResponsiveContainer>
      </Box>
    </Box>
  );
}
