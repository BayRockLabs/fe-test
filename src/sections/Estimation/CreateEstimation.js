import * as React from "react";
import Stack from "@mui/material/Stack";
import { Typography, Box, Button, Grid } from "@mui/material";
import FormControl from "@mui/material/FormControl";
import InputLabel from "@mui/material/InputLabel";
import OutlinedInput from "@mui/material/OutlinedInput";
import EstimationAPI from "../../services/EstimationService";
import useAxiosPrivate from "../../hooks/useAxiosPrivate";
import { useSnackbar } from "notistack";
import { displayError } from "../../utils/handleErrors";
import useLocales from "../../hooks/useLocales";
import { anchorOrigin } from "../../utils/constants";

export default function CreateEstimation({
  detailData,
  clientId,
  tableData,
  estimationName,
  onFormSubmitted,
  isEditDelete = false,
  formDisabled,
  billingName,
  clientName,
}) {
  const [costData, setCostData] = React.useState({});

  const axiosPrivate = useAxiosPrivate();
  const { enqueueSnackbar } = useSnackbar();
  const { translate } = useLocales();
  const isEditMode = detailData ? true : false;

  const [contractStartDate, setContractStartDate] = React.useState(null);
  const [contractEndDate, setContractEndDate] = React.useState(null);

  React.useEffect(() => {
    if (tableData && tableData?.length > 0) {
      const dates = tableData?.map((resource) => ({
        start: new Date(resource.id_start_date),
        end: new Date(resource.id_end_date),
      }));

      const earliestStartDate = new Date(
        Math.min(...dates.map((date) => date.start))
      );
      const latestEndDate = new Date(
        Math.max(...dates.map((date) => date.end))
      );

      setContractStartDate(earliestStartDate);
      setContractEndDate(latestEndDate);
    }
  }, [tableData]);

  React.useEffect(() => {
    let priceCost = 0;
    let companyCost = 0;
    let marketCost = 0;

    // Iterate through each item in the table data
    tableData?.forEach((item) => {
      // Ensure item.id_estimation_hour is valid
      const estimationHours = item.id_estimation_hour ?? 0;
      if (estimationHours === 0) return; // Skip item if estimation hours are zero

      // Calculate the price cost only if id_pay_rate is greater than zero
      const payRate = item.id_pay_rate ?? 0;
      if (payRate > 0) {
        priceCost += estimationHours * payRate;
      }

      // Determine the company rate using a helper function (and exclude zero values)
      const idOtherPayRateData = item.id_other_pay_rate_data ?? {};
      const companyRate =
        idOtherPayRateData?.companyRate ?? idOtherPayRateData?.payrate ?? 0;
      if (companyRate > 0) {
        companyCost += estimationHours * companyRate;
      }

      // Calculate the market cost only if marketRate is greater than zero
      const marketRate = idOtherPayRateData?.marketrate ?? 0;
      if (marketRate > 0) {
        marketCost += estimationHours * marketRate;
      }
    });

    // Set the calculated costs and margins
    const totalCompanyCost = companyCost;
    const totalMarketCost = marketCost;
    const totalCompanyPrice = priceCost; // Price is static at 35% more from company cost
    const totalMarketPrice = 1.35 * marketCost;

    // Prevent division by zero or invalid calculations for Gross Margin
    const totalCompanyGM =
      totalCompanyPrice > 0 && totalCompanyCost > 0
        ? (
            ((totalCompanyPrice - totalCompanyCost) / totalCompanyPrice) *
            100
          ).toFixed(2)
        : "0"; // Prevent -Infinity and NaN

    const totalMarketGM =
      totalMarketPrice > 0 && totalMarketCost > 0
        ? ((totalMarketPrice - totalMarketCost) / totalMarketPrice) * 100
        : 0; // Prevent NaN and ensure valid margin

    setCostData({
      companyCost: totalCompanyCost,
      marketCost: totalMarketCost,
      companyPrice: totalCompanyPrice,
      marketPrice: totalMarketPrice,
      companyGrossMargin: totalCompanyGM,
      marketGrossMargin: totalMarketGM,
    });
  }, [tableData]);

  const isCreateDisabled = () => {
    let status =
      estimationName.length === 0 ||
      !tableData ||
      tableData.length === 0 ||
      billingName.length === 0;

    if (!status) {
      if (isEditMode) {
        status = !(
          detailData?.name.length !== 0 ||
          estimationName.length !== 0 ||
          isEditDelete ||
          billingName.length !== 0
        );
      }
    }

    return status;
  };

  const handleCreateEstimation = async () => {
    let resourceList = [];
    resourceList = tableData.map((item) => {
      return {
        role: item.id_role,
        region: item.id_region,
        billability: item.id_billability,
        skill: item.id_skill,
        total_estimation_hour: item.id_estimation_hour,
        pay_rate: item.id_pay_rate,
        start_date: item.id_start_date,
        end_date: item.id_end_date,
        pay_rate_info: item.id_other_pay_rate_data,
        total_available_hour: item.id_cost_hrs
          ? item.id_cost_hrs
          : item.id_working_hours,
        Estimation_Data: item.id_estimation_Data
          ? item.id_estimation_Data
          : item.id_time_data,
        num_of_resources: item.id_num_of_resources,
        experience: item.id_experience,
        initial_estimation_data: item.id_initial_estimation_datewise,
        checkboxtype: item.id_checkbox,
      };
    });
    const payload = {
      name: estimationName,
      company_avg_cost: costData.companyCost,
      company_avg_price: costData.companyPrice,
      company_avg_gm: costData.companyGrossMargin,
      market_cost: costData.marketCost,
      market_price: costData.marketPrice,
      market_gm: costData.marketGrossMargin,
      resource: resourceList,
      estimation_archived: false,
      client: clientId,
      contract_end_date: contractEndDate,
      contract_start_date: contractStartDate,
      billing: billingName,
      client_name: clientName,
    };

    requestAddEstimation(payload);
  };
  function getFormattedValue(value) {
    const numberValue = parseFloat(value) || 0;
    return numberValue.toFixed(2);
  }

  async function requestAddEstimation(payload) {
    try {
      let response;
      if (isEditMode) {
        response = await EstimationAPI.UpdateEstimation(
          axiosPrivate,
          detailData.uuid,
          payload
        );
      } else {
        response = await EstimationAPI.AddEstimation(axiosPrivate, payload);
      }
      if (response?.status === 200 || response?.status === 201) {
        onFormSubmitted(response?.data);
      }
    } catch (error) {
      displayError(enqueueSnackbar, error, { anchorOrigin });
    }
  }

  return (
    <Box paddingTop={5}>
      <Stack
        component="form"
        sx={{
          width: "100%",
          maxWidth: "78ch",
          textAlign: "left",
          display: "flex",
          flexDirection: "column",
        }}
        spacing={2}
        noValidate
        autoComplete="off"
      >
        <Typography variant="h5" sx={{ m: 1, alignSelf: "center" }}>
          Added {tableData?.length ?? 0} Resources
        </Typography>

        <Grid
          container
          spacing={2}
          sx={{ width: "100%", display: "flex", justifyContent: "flex-start" }}
        >
          {/* Conditionally render this Grid item based on a boolean flag */}
          {false && (
            <Grid
              item
              xs={12}
              sm={4}
              sx={{ display: "flex", justifyContent: "flex-end" }}
            >
              <FormControl sx={{ width: "100%" }}>
                <InputLabel htmlFor="outlined-adornment-clientId">
                  Total Cost to Company
                </InputLabel>
                <OutlinedInput
                  id="outlined-adornment-clientId"
                  label="Total Cost(company Avg)"
                  size="small"
                  name="company_Avg-cost"
                  value={getFormattedValue(costData?.companyCost)}
                  sx={{ borderRadius: "12px" }}
                />
              </FormControl>
            </Grid>
          )}

          <Grid
            item
            xs={12}
            sm={4}
            sx={{ display: "flex", justifyContent: "flex-end" }}
          >
            <FormControl
              sx={{ width: "100%", marginBottom: "16px" }}
              variant="outlined"
            >
              <InputLabel htmlFor="outlined-adornment-total-bill">
                Total Bill Amount (Customer)
              </InputLabel>
              <OutlinedInput
                id="outlined-adornment-total-bill"
                label="Total Bill Amount (Customer)"
                size="medium"
                name="company_Avg_price"
                value={getFormattedValue(costData?.companyPrice)}
                sx={{ borderRadius: "12px" }}
              />
            </FormControl>
          </Grid>

          <Grid
            item
            xs={12}
            sm={4}
            sx={{ display: "flex", justifyContent: "flex-end" }}
          >
            <FormControl sx={{ width: "100%" }} variant="outlined">
              <InputLabel htmlFor="outlined-adornment-gross-margin">
                Gross Margin (%)
              </InputLabel>
              <OutlinedInput
                error={costData?.companyGrossMargin < 0}
                id="outlined-adornment-gross-margin"
                label="Gross Margin (%)"
                size="medium"
                name="company_Avg_gm"
                value={getFormattedValue(costData?.companyGrossMargin)}
                sx={{
                  color: costData?.companyGrossMargin < 0 ? "red" : "",
                  borderRadius: "12px",
                }}
              />
            </FormControl>
          </Grid>
        </Grid>
      </Stack>

      <Button
        sx={{ marginTop: 2, float: "right" }}
        variant="contained"
        color="primary"
        onClick={handleCreateEstimation}
        disabled={isEditMode ? formDisabled : isCreateDisabled()}
      >
        {translate(
          isEditMode
            ? "Estimations.UPDATE_ESTIMATION"
            : "Estimations.CREATE_ESTIMATION"
        )}
      </Button>
    </Box>
  );
}
