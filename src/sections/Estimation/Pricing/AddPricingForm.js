import * as React from "react";
import MenuItem from "@mui/material/MenuItem";
import TextField from "@mui/material/TextField";
import Box from "@mui/material/Box";
import HighlightOffIcon from "@mui/icons-material/HighlightOff";
import useAxiosPrivate, {
  isValidResponse,
} from "../../../hooks/useAxiosPrivate";
import Button from "@mui/material/Button";
import { useSnackbar } from "notistack";
import palette from "../../../theme/palette";
import useLocales from "../../../hooks/useLocales";
import { useState, useEffect } from "react";
import EstimationAPI from "../../../services/EstimationService";
import { displayError } from "../../../utils/handleErrors";
import { InputLabel, Stack, Typography } from "@mui/material";
import PricingAPI from "../../../services/PricingService";
import { fCurrency } from "../../../utils/formatNumber";
import useClient from "../../../hooks/useClient";
import MandatoryTextField from "../../../pages/MandatoryTextField";
import { anchorOrigin } from "../../../utils/constants";

function AddPricingForm({ detailData, handleClose, onPricingAdded }) {
  const isEditMode = detailData ? true : false;

  const axiosPrivate = useAxiosPrivate();
  const { enqueueSnackbar } = useSnackbar();
  const { translate } = useLocales();
  const { selectedClient } = useClient();

  const [isLoading, setIsLoading] = useState(true);
  const [estimationDataList, setEstimationDataList] = useState([]);
  const [selectedEstimation, setSelectedEstimation] = React.useState(
    getSelectedEstimation({})
  );
  const [pricingName, setPricingName] = useState(detailData?.name ?? "");
  const [discount, setDiscount] = useState(detailData?.discount ?? "");
  const [finalPrice, setFinalPrice] = useState(
    detailData?.final_offer_price ?? ""
  );
  const [finalMargin, setFinalMargin] = useState(
    detailData?.final_offer_margin ?? ""
  );
  const [finalMarginPercentage, setFinalMarginPercentage] = useState(
    detailData?.final_offer_gross_margin_percentage ?? ""
  );
  const [gmMarketAvg, setGmMarketAvg] = useState(
    detailData?.company_avg_gm ?? ""
  );
  const [enable, setEnable] = useState(false);

  useEffect(() => {
    fetchEstimations();
  }, []);

  useEffect(() => {
    const estimatedPrice = parseFloat(selectedEstimation.company_avg_price);
    const estimatedCost = parseFloat(selectedEstimation.company_avg_cost);

    if (!isEditMode) {
      const calculatedFinalPrice = estimatedPrice * ((100 - discount) / 100);
      const calculatedFinalMargin = calculatedFinalPrice - estimatedCost;
      const calculatedFOMP =
        ((calculatedFinalPrice - estimatedCost) / calculatedFinalPrice) * 100;

      setFinalPrice(calculatedFinalPrice.toFixed(2));
      setFinalMargin(calculatedFinalMargin.toFixed(2));
      setFinalMarginPercentage(calculatedFOMP.toFixed(2));
    }
    setGmMarketAvg(estimatedPrice - estimatedCost);
  }, [selectedEstimation]);

  const onPriceAddedSuccess = () => {
    enqueueSnackbar(
      translate(isEditMode ? "message.update" : "message.create"),
      { anchorOrigin }
    );
    onPricingAdded();
  };

  const handlePriceNameChange = (event) => {
    const fieldValue = event.target.value;
    setPricingName(fieldValue);
  };
  const [error, setError] = useState("");

  const handleDiscountChange = (event) => {
    const fieldValue = event.target.value;
    setIsButtonEnabled(true);
    let errorMessage = "";

    if (fieldValue === "") {
      setDiscount("");
      setFinalPrice("");
      setFinalMargin("");
      setFinalMarginPercentage("");
      setEnable(false);
      setError("Discount required");
      return;
    }

    if (!isNaN(fieldValue) && /^-?\d+(\.\d{1,2})?$/.test(fieldValue)) {
      const discount = parseFloat(fieldValue);

      if (discount > 100) {
        errorMessage = "Discount cannot be more than 100";
      } else {
        setDiscount(fieldValue);

        const estimatedPrice = parseFloat(selectedEstimation.company_avg_price);
        const estimatedCost = parseFloat(selectedEstimation.company_avg_cost);

        const calculatedFinalPrice = estimatedPrice * ((100 - discount) / 100);
        const calculatedFinalMargin = calculatedFinalPrice - estimatedCost;
        const calculatedFOMP =
          ((calculatedFinalPrice - estimatedCost) / calculatedFinalPrice) * 100;

        setFinalPrice(calculatedFinalPrice.toFixed(2));
        setFinalMargin(calculatedFinalMargin.toFixed(2));
        setFinalMarginPercentage(
          isNaN(calculatedFOMP) || !isFinite(calculatedFOMP)
            ? -100
            : calculatedFOMP.toFixed(2)
        );

        setEnable(!!pricingName && !!selectedEstimation.uuid && !!fieldValue);
      }
    } else {
      errorMessage = "Only digits are valid";
    }

    setError(errorMessage);
  };

  const onEstimationChange = (event) => {
    const estimationItem = event.target.value;
    setSelectedEstimation(getSelectedEstimation(estimationItem));
  };

  function getFormattedValue(value) {
    return fCurrency(value);
  }

  function getSelectedEstimation(estimationItem) {
    return {
      market_cost: estimationItem.market_cost ?? "",
      market_price: estimationItem.market_price ?? "",

      company_avg_cost: estimationItem.company_avg_cost ?? "",
      company_avg_price: estimationItem.company_avg_price ?? "",

      market_gm: estimationItem.market_gm ?? "",
      company_avg_gm: estimationItem.company_avg_gm ?? "",

      name: estimationItem.name ?? "",
      uuid: estimationItem.uuid,
      client: estimationItem.client,
    };
  }

  const onError = (message) => {
    enqueueSnackbar("Pricing - " + message, {
      anchorOrigin,
      variant: "error",
    });
  };

  const handleCreatePricing = async () => {
    if (selectedClient.uuid) {
      // if(isEditMode) {
      //   const payload = {
      //     discount: discount,
      //   };
      //   requestAddPricing(payload);
      // } else {
      const payload = {
        name: pricingName,
        discount: discount,
        final_offer_price: finalPrice ? finalPrice : null,
        final_offer_margin: finalMargin ? finalMargin : null,
        final_offer_gross_margin_percentage: finalMarginPercentage,

        estimated_market_cost: selectedEstimation.market_cost
          ? selectedEstimation.market_cost
          : null,
        estimated_market_price: selectedEstimation.market_price
          ? selectedEstimation.market_price
          : null,
        estimated_company_avg_cost: selectedEstimation.company_avg_cost
          ? selectedEstimation.company_avg_cost
          : null,
        estimated_company_avg_price: selectedEstimation.company_avg_price
          ? selectedEstimation.company_avg_price
          : 0,
        market_gm: selectedEstimation.market_gm
          ? selectedEstimation.market_gm
          : null,
        company_avg_gm: selectedEstimation.company_avg_gm
          ? selectedEstimation.company_avg_gm
          : 0,

        estimation_name: selectedEstimation.name,
        estimation: selectedEstimation.uuid,
        client: selectedClient.uuid,
      };
      requestAddPricing(payload);
      // }
    }
  };

  const onHandleFinalOfferPriceChange = (event) => {
    const newFinalPrice = parseFloat(event.target.value);
    setIsButtonEnabled(true);
    setFinalPrice(newFinalPrice);

    const estimatedPrice = parseFloat(selectedEstimation.company_avg_price);
    const estimatedCost = parseFloat(selectedEstimation.company_avg_cost);

    const newDiscount = 100 * (1 - newFinalPrice / estimatedPrice);
    setDiscount(newDiscount.toFixed(2));

    const newFinalMargin = newFinalPrice - estimatedCost;
    setFinalMargin(newFinalMargin.toFixed(2));

    const calculatedFOMP =
      ((newFinalPrice - estimatedCost) / newFinalPrice) * 100;
    setFinalMarginPercentage(calculatedFOMP.toFixed(2));
  };

  const onHandleFinalOfferGMChange = (event) => {
    const newFinalMargin = parseFloat(event.target.value);
    setIsButtonEnabled(true);
    setFinalMargin(newFinalMargin);

    const estimatedCost = parseFloat(selectedEstimation.company_avg_cost);
    const newFinalPrice = estimatedCost + newFinalMargin;
    setFinalPrice(newFinalPrice.toFixed(2));

    const estimatedPrice = parseFloat(selectedEstimation.company_avg_price);
    const newDiscount = 100 * (1 - newFinalPrice / estimatedPrice);
    setDiscount(newDiscount.toFixed(2));

    const calculatedFOMP =
      ((newFinalPrice - estimatedCost) / newFinalPrice) * 100;
    setFinalMarginPercentage(calculatedFOMP.toFixed(2));
  };

  const onHandleFinalOfferGMPChange = (event) => {
    const estimatedCost = parseFloat(selectedEstimation.company_avg_cost);
    const newFinalMarginPercentage = parseFloat(event.target.value);
    setIsButtonEnabled(true);
    setFinalMarginPercentage(newFinalMarginPercentage);

    const marginDecimal = newFinalMarginPercentage / 100;
    const newFinalPrice = estimatedCost / (1 - marginDecimal);
    setFinalPrice(newFinalPrice.toFixed(2));

    const newFinalMargin = newFinalPrice - estimatedCost;
    setFinalMargin(newFinalMargin.toFixed(2));

    const estimatedPrice = parseFloat(selectedEstimation.company_avg_price);
    const newDiscount = 100 * (1 - newFinalPrice / estimatedPrice);
    setDiscount(newDiscount.toFixed(2));
  };

  async function requestAddPricing(payload) {
    try {
      const response = isEditMode
        ? await PricingAPI.UPDATE(axiosPrivate, detailData.uuid, payload)
        : await PricingAPI.ADD(axiosPrivate, payload);
      onPriceAddedSuccess(response?.data);
    } catch (error) {
      console.log("Error in requestAddPricing ", error);
      displayError(enqueueSnackbar, error, { anchorOrigin });
    }
  }
  const [isButtonEnabled, setIsButtonEnabled] = useState(false);
  const [initialValues, setInitialValues] = useState({
    discount: "",
    finalPrice: "",
    finalMargin: "",
    finalMarginPercentage: "",
  });

  function isCreateDisabled() {
    return (
      !pricingName ||
      !selectedEstimation.uuid ||
      isLoading ||
      discount === "" ||
      (discount === initialValues.discount &&
        finalPrice === initialValues.finalPrice &&
        finalMargin === initialValues.finalMargin &&
        finalMarginPercentage === initialValues.finalMarginPercentage)
    );
  }
  useEffect(() => {
    setInitialValues({
      discount,
      finalPrice,
      finalMargin,
      finalMarginPercentage,
    });
  }, []);

  useEffect(() => {
    if (isEditMode && detailData) {
      const estimation = estimationDataList?.find(
        (item) => item.uuid === detailData.estimation
      );
      if (estimation) {
        setSelectedEstimation(getSelectedEstimation(estimation));
      }
    }
  }, [estimationDataList, detailData, isEditMode]);
  async function fetchEstimations() {
    if (selectedClient.uuid) {
      try {
        const response = await EstimationAPI.LIST(
          axiosPrivate,
          selectedClient.uuid,
          1,
          1000
        );

        if (isValidResponse(response)) {
          setEstimationDataList(response.data.results);
          setIsLoading(false);
        } else {
          onError("Invalid response from Estimation List API ");
        }
      } catch (error) {
        console.log("Error in fetchEstimations : ", error);
        onError(translate("error.fetch"));
      }
    }
  }

  const PricingTextField = ({ label, value }) => {
    return <TextField fullWidth label={label} value={value} disabled />;
  };

  return (
    <div>
      <>
        <Box
          sx={{
            margin: "15px",
            fontFamily: "Inter",
            fontSize: "24px",
            fontWeight: "700",
            lineHeight: "29px",
            color: palette.dark.common.black,
            height: "50px",
          }}
        >
          <HighlightOffIcon
            onClick={handleClose}
            sx={{ height: "50px", width: "30px", margin: "10px" }}
          />
          <span>
            {translate(
              isEditMode
                ? "PriceEstimation.EDIT_PRICING"
                : "PriceEstimation.ADD_PRICING"
            )}
          </span>
        </Box>

        <Stack direction={"row"} spacing={5} margin={4}>
          <TextField
            fullWidth
            disabled={isEditMode}
            label={
              <MandatoryTextField
                label={translate("PriceEstimation.PRICING_NAME")}
              />
            }
            value={pricingName}
            inputProps={{ maxLength: 25 }}
            name="pricingName"
            onChange={(e) => {
              const newValue = e.target.value.replace(/[^A-Za-z0-9\s]/g, "");
              handlePriceNameChange({ target: { value: newValue } });
            }}
          />

          <TextField
            select
            fullWidth
            disabled={isEditMode}
            label={
              <MandatoryTextField
                label={translate("PriceEstimation.ESTIMATION_NAME")}
              />
            }
            value={
              estimationDataList?.find(
                (estimation) => estimation.uuid === selectedEstimation.uuid
              ) || ""
            }
            onChange={onEstimationChange}
          >
            {estimationDataList?.map((estimation) => (
              <MenuItem key={estimation.uuid} value={estimation}>
                {estimation.name}
              </MenuItem>
            ))}
          </TextField>
        </Stack>
        <Box
          component="form"
          sx={{
            "& .MuiTextField-root": { mt: 5, ml: 3, width: "30%" },
          }}
          margin={2}
        >
          {/* <div>
            <PricingTextField
              label={translate("PriceEstimation.ESTIMATED_COST")}
              value={getFormattedValue(selectedEstimation.market_cost)}
            />

            <PricingTextField
              label={translate("PriceEstimation.ESTIMATION_PRICE")}
              value={getFormattedValue(selectedEstimation.market_price)}
            />

            <PricingTextField
              label={translate("PriceEstimation.GM_MARKET")}
              value={getFormattedValue(selectedEstimation.company_avg_gm)}
            />
          </div> */}
          <div>
            <PricingTextField
              label={translate("Total Cost to Company")}
              value={getFormattedValue(selectedEstimation.company_avg_cost)}
            />

            <PricingTextField
              label={translate("Total Bill Amount(Customer)")}
              value={getFormattedValue(selectedEstimation.company_avg_price)}
            />

            <PricingTextField
              label={translate("Gross Margin")}
              value={getFormattedValue(gmMarketAvg)}
            />
          </div>
          <div>
            <TextField
              fullWidth
              type="number"
              label={
                <MandatoryTextField
                  label={translate("PriceEstimation.DISCOUNT")}
                />
              }
              value={discount}
              name="discount"
              onChange={handleDiscountChange}
              inputProps={{
                inputMode: "numeric", // Enable numeric input mode
                pattern: "[0-9]*", // Only allow numeric input
              }}
              error={!!error} // Highlight field if there's an error
              helperText={error || ""} // Display error message if exists
            />
            <TextField
              fullWidth
              type="number"
              label={translate("PriceEstimation.FINAL_OFFER_PRICE")}
              value={finalPrice}
              name="FinalOfferPrice"
              inputProps={{
                inputMode: "numeric",
                pattern: "[0-9]*",
              }}
              onChange={onHandleFinalOfferPriceChange}
            />
            <TextField
              type="number"
              fullWidth
              label={translate("Final Offer Gross Margin")}
              value={finalMargin}
              name="finalOfferGM"
              inputProps={{
                inputMode: "numeric",
                pattern: "[0-9]*",
              }}
              onChange={onHandleFinalOfferGMChange}
            />
            <TextField
              type="number"
              fullWidth
              label={translate("Final Offer Gross Margin %")}
              value={finalMarginPercentage}
              name="finalOfferGMP"
              inputProps={{
                inputMode: "numeric",
                pattern: "[0-9]*",
              }}
              onChange={onHandleFinalOfferGMPChange}
            />
          </div>
        </Box>

        <Button
          disabled={isCreateDisabled() || !isButtonEnabled}
          onClick={handleCreatePricing}
          sx={{
            float: "right",
            m: 6,
          }}
          variant="contained"
        >
          {isLoading
            ? "Loading..."
            : translate(
                isEditMode
                  ? "PriceEstimation.UPDATE_PRICING"
                  : "PriceEstimation.CREATE_PRICING"
              )}
        </Button>
      </>
    </div>
  );
}

export default AddPricingForm;
