import React, { useEffect, useState } from "react";
import { Box, Button, Grid, Typography } from "@mui/material";
import PageHeader from "../../components/PageHeader";
import useLocales from "../../hooks/useLocales";
import AddFormModal from "../../components/AddFormModal";
import AddEstimationForm from "./AddEstimationForm";
import { createStyles } from "@mui/styles";
import { useTheme } from "@emotion/react";
import EstimationAPI from "../../services/EstimationService";
import { useSnackbar } from "notistack";
import useAxiosPrivate, { isValidResponse } from "../../hooks/useAxiosPrivate";
import { displayError } from "../../utils/handleErrors";
import { useLocation } from "react-router-dom";
import ResourceTable, { createAddResourceData } from "./ResourceTable";
import { anchorOrigin } from "../../utils/constants";
import * as XLSX from "xlsx";
import { saveAs } from "file-saver";
import moment from "moment";
import DownloadIcon from "@mui/icons-material/Download";

const exportToExcel = (data, estimationName, clientName) => {
  const headers = [
    { role: "Resource Role" },
    { num_of_resources: "No of Resources" },
    { region: "Region" },
    { skill: "Skill" },
    { total_estimation_hour: "Estimation Hours" },
    { pay_rate: "Bill Rate" },
    { start_date: "Start Date" },
    { end_date: "End Date" },
  ];

  const processWeeklyData = (weeklyHours) => {
    const weekMap = {};

    weeklyHours.forEach((entry, index) => {
      const weekLabel = `Week ${index + 1}`;
      weekMap[weekLabel] = entry.hours;
    });

    return weekMap;
  };

  const formattedData = data.map((item) => {
    const weeklyData = processWeeklyData(
      item.weekly_pdf_estimated_hours.weekly
    );
    return {
      "Resource Role": item.role,
      "No of Resources": item.num_of_resources,
      Region: item.region,
      Skill: item.skill,
      "Estimation Hours": item.total_estimation_hour,
      "Bill Rate": item.pay_rate,
      "Start Date": moment(item.start_date).format("YYYY-MM-DD"),
      "End Date": moment(item.end_date).format("YYYY-MM-DD"),
      ...weeklyData,
    };
  });

  const allWeeks = new Set();
  data.forEach((item) => {
    item.weekly_pdf_estimated_hours.weekly.forEach((entry, index) => {
      allWeeks.add(`Week ${index + 1}`); // Week starts from 1
    });
  });

  const dynamicHeaders = [
    ...headers,
    ...Array.from(allWeeks).map((week) => ({ [week]: week })),
  ];

  const headerNames = dynamicHeaders.map((header) => Object.values(header)[0]);

  const wb = XLSX.utils.book_new();
  const ws = XLSX.utils.json_to_sheet(formattedData, {
    header: headerNames,
  });
  XLSX.utils.book_append_sheet(wb, ws, "Sheet1");

  const wbout = XLSX.write(wb, { bookType: "xlsx", type: "array" });

  const blob = new Blob([wbout], {
    type: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  });

  const fileName = `${estimationName}_${clientName}.xlsx`.replace(/\s+/g, "_");

  saveAs(blob, fileName);
};

const exportToDailyExcel = (
  data,
  startDate,
  endDate,
  estimationName,
  clientName
) => {
  const formatDate = (date) => {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  // Parse start and end date
  const start = new Date(startDate);
  const end = new Date(endDate);

  // Generate date headers based on start and end date
  const dateHeaders = [];
  const dateMap = {};
  let currentDate = new Date(start);
  while (currentDate <= end) {
    const formattedDate = formatDate(currentDate); // Format the date as DD/MM/YYYY
    dateHeaders.push(formattedDate);
    dateMap[formattedDate] = currentDate.toISOString(); // Store ISO string for later comparison
    currentDate.setDate(currentDate.getDate() + 1);
  }

  // Prepare data rows for each entry
  const rows = data.map((item) => {
    const row = [
      item.role,
      item.num_of_resources,
      item.skill,
      item.region,
      item.experience,
      item.start_date,
      item.end_date,
      item.pay_rate,
      item.total_estimation_hour,
    ];

    // Add daily hours for each date
    dateHeaders.forEach((date) => {
      const dailyData = item.Estimation_Data.daily.find(
        (entry) => entry.date === date // Compare the date in DD/MM/YYYY format
      );
      row.push(dailyData ? dailyData.hours : "-");
    });

    return row;
  });

  // Prepare the header row
  const header = [
    "Role",
    "Number of Resources",
    "Skill",
    "Region",
    "Experience",
    "Start Date",
    "End Date",
    "Bill Rate",
    "Estimation Hours",
    ...dateHeaders,
  ];

  // Combine header and data
  const worksheet = XLSX.utils.aoa_to_sheet([header, ...rows]);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, "Estimation Data");

  // Generate and download Excel file
  XLSX.writeFile(workbook, `daily_${estimationName}_${clientName}.xlsx`);
};

export default function EstimationPreview() {
  const theme = useTheme();
  const styles = useStyles(theme);

  const { translate } = useLocales();
  const { enqueueSnackbar } = useSnackbar();
  const axiosPrivate = useAxiosPrivate();
  const { state } = useLocation();

  const [isAddModel, setAddModel] = useState(false);
  const [detailData, setDetailData] = useState({});
  const [tableData, setTableData] = useState([]);

  const [costArray, setCostArray] = useState([]);

  const estimationId = state?.uuid ?? "";

  const openEditEstimationModel = () => {
    setAddModel(true);
  };

  const onCloseEditEstimationModel = () => {
    setAddModel(false);
  };

  const onEstimationAdded = () => {
    onCloseEditEstimationModel();
    onEstimationUpdated();
  };

  const onError = (message) => {
    enqueueSnackbar("EstimationDetail - " + message, {
      anchorOrigin,
      variant: "error",
    });
  };

  useEffect(() => {
    getDetail();
  }, []);

  useEffect(() => {
    updatePageData();
  }, [detailData]);

  async function updatePageData() {
    setCostArray([
            // {
      //   id: "PriceEstimation.TOTAL_COST_MARKET",
      //   value: detailData.market_cost,
      // },

      // {
      //   id: "PriceEstimation.TOTAL_PRICE_MARKET",
      //   value: detailData.market_price,
      // },

      // {
      //   id: "PriceEstimation.TOTAL_GM_MARKET",
      //   value: detailData.market_gm,
      // },

      {
        id: "PriceEstimation.TOTAL_COST_COMPANY",
        value: detailData.company_avg_cost,
      },

      {
        id: "PriceEstimation.TOTAL_PRICE_COMPANY",
        value: detailData.company_avg_price,
      },
      {
        id: "Estimations.GROSS_MARGIN",
        value: detailData.company_avg_gm,
      },
    ]);

    setTableData(
      detailData?.resource?.map((item) => {
        return createAddResourceData(
          item.role,
          item.region,
          item.billability,
          item.skill,
          item.total_estimation_hour,
          item.pay_rate,
          item.start_date,
          item.end_date,
          item.pay_rate_info,
          item.total_available_hour,
          item.Estimation_Data,
          item.time_data,
          item.working_hours,
          item.num_of_resources,
          item.experience,
          item.initial_estimation_data,
          item.checkboxtype
        );
      })
    );
  }
  async function onDetailLoaded(data) {
    setDetailData(data);
  }
  async function getDetail() {
    try {
      const response = await EstimationAPI.GetDetail(
        axiosPrivate,
        estimationId
      );
      if (isValidResponse(response)) {
        onDetailLoaded(response.data);
      } else {
        onError(translate("error.fetch"));
      }
    } catch (error) {
      console.log("Error in ClientDetail.getClientDetail() - ", error);
      onError(translate("error.fetch"));
    }
  }

  async function onEstimationUpdated() {
    getDetail();
  }

  const EstimationItem = ({ translateLabelId, value }) => {
    return (
      <Box sx={styles.costItemBox}>
        <Typography
          className="text-base text-gray-900_02 w-auto"
          size="txtInterBold16"
          variant="body1"
        >
          {translate(translateLabelId)}
        </Typography>
        <Typography
          className="text-base text-dark w-auto"
          size="txtInterBold16"
          variant="subtitle2"
        >
          {value}
        </Typography>
      </Box>
    );
  };
  const EstimationCostContainer = () => {
    return (
      <Box sx={styles.costBox}>
        <Typography sx={styles.costTitle}>
          {translate("PriceEstimation.TOTAL_ESTIMATION")}
        </Typography>
        <Grid
          container
          spacing={2}
          columns={12}
          sx={{ alignItems: "stretch" }}
        >
          {costArray.map((item, index) => (
            <Grid item xs={12} sm={6} md={4} key={index}>
              <EstimationItem
                translateLabelId={item.id}
                value={
                  item.id === "PriceEstimation.TOTAL_GM_COMPANY"
                    ? item.value + " %"
                    : "$ " + item.value
                }
              />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };
  const isButtonDisabled =
    detailData?.is_utilized && !process.env.REACT_APP_UNLOCKED_ESTIMATION_EDIT
      ? true
      : false;
  return (
    <>
      <PageHeader
        primaryTitle={translate("estimations")}
        buttonText={translate("edit")}
        onClickButton={openEditEstimationModel}
        showBack={true}
        buttonStyle={
          isButtonDisabled ? { opacity: 0.3, pointerEvents: "none" } : {}
        }
        isDisabled={isButtonDisabled}
        screen="Estimation"
      />
      <Box sx={styles.costBox}>
        <EstimationItem
          translateLabelId={"Estimations.ESTIMATION_NAME"}
          value={detailData?.name ?? ""}
        />
      </Box>
      <EstimationCostContainer />
      <Box sx={styles.costBox}>
      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: "center", justifyContent: { xs: "center", sm: "space-between" }, marginBottom: "4px", gap: { xs: 1, sm: 2 } }}>
  <Button
    onClick={() => {
      exportToDailyExcel(
        detailData?.resource,
        detailData?.contract_start_date,
        detailData?.contract_end_date,
        detailData?.name,
        detailData?.client_name
      );
    }}
    endIcon={<DownloadIcon />}
    sx={{
      color: "black",
      boxShadow: "none",
      textAlign: "center",
      width: { xs: "100%", sm: "auto" }, // Full-width for mobile, auto for larger screens
    }}
    variant="contained"
  >
    Download RLS(Day)
  </Button>
  <Button
    endIcon={<DownloadIcon />}
    sx={{
      color: "black",
      boxShadow: "none",
      textAlign: "left",
      width: { xs: "100%", sm: "auto" }, // Full-width for mobile, auto for larger screens
    }}
    variant="contained"
    onClick={() =>
      exportToExcel(
        detailData.resource,
        detailData?.name,
        detailData?.client_name
      )
    }
  >
    Download RLS(Week)
  </Button>
</Box>
        <ResourceTable isEdit={false} tableData={tableData} />
      </Box>
      {isAddModel && (
        <AddFormModal onClose={onCloseEditEstimationModel}>
          <AddEstimationForm
            detailData={detailData}
            resourceTableData={tableData}
            handleClose={onCloseEditEstimationModel}
            onEstimationAdded={onEstimationAdded}
          />
        </AddFormModal>
      )}
    </>
  );
}

const useStyles = createStyles((theme) => ({
  costBox: {
    borderRadius: "8px",
    marginTop: theme.spacing(2),
    padding: theme.spacing(2),
    background: theme.palette.background.paper,
  },
  costTitle: {
    fontFamily: "Inter",
    fontSize: "16px",
    fontWeight: "700",
    color: theme.palette.text.primary,
    paddingBottom: theme.spacing(1),
  },
  costItemBox: {
    padding: theme.spacing(1),
    display: "flex",
    flexDirection: "column",
    alignItems: "left",
    height: "100%",
  },
}));
