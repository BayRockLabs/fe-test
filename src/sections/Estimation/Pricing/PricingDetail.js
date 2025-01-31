import * as React from "react";
import Card from "@mui/material/Card";
import Box from "@mui/material/Box";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";
import useLocales from "../../../hooks/useLocales";
import AddFormModal from "../../../components/AddFormModal";
import AddPricingForm from "../Pricing/AddPricingForm";
import Item from "../../../common/Item";
import PageHeader from "../../../components/PageHeader";
import { Grid } from "@mui/material";
import { fCapitalizeFirst } from "../../../utils/formatString";
import { useLocation } from "react-router-dom";
import { useState, useEffect } from "react";
import PricingAPI from "../../../services/PricingService";
import useAxiosPrivate from "../../../hooks/useAxiosPrivate";
import LoadingScreen from "../../../components/LoadingScreen";

const DetailItem = ({ label, value }) => (
  <Item sx={{ alignItems: "baseline" }}>
    <Typography variant="body2" color="textSecondary">
      {label}
    </Typography>
    <Typography
      variant="subtitle2"
      color="textPrimary"
      sx={{ whiteSpace: "nowrap" }}
    >
      {value}
    </Typography>
  </Item>
);

export default function PricingDetails() {
  const { translate } = useLocales();

  const [isAddModel, setAddModel] = React.useState(false);

  const location = useLocation();
  const axiosPrivate = useAxiosPrivate();

  const uuid = location.state.data;
  const [pricingData, setPricingData] = useState(null);
  const openAddClientModel = () => {
    setAddModel(true);
  };

  const onCloseAddClientModel = () => {
    setAddModel(false);
  };

  async function getSinglePricing(uuid) {
    try {
      const response = await PricingAPI.DETAIL(axiosPrivate, uuid);
      setPricingData(response.data);
    } catch (error) {
      console.log(error);
    }
  }

  useEffect(() => {
    getSinglePricing(uuid);
  }, [uuid]);

  const onPricingUpdated = () => {
    onCloseAddClientModel();
    getSinglePricing(uuid);
  };

  function getPagePrimaryText() {
    return (
      fCapitalizeFirst(pricingData?.name ?? "") + " " + translate("overview")
    );
  }

  function getFormattedValue(value) {
    return value ? `$ ${value}` : "--";
  }

  const isButtonDisabled = pricingData?.is_price_utilized;
  return (
    <>
      <PageHeader
        primaryTitle={getPagePrimaryText()}
        buttonText={translate("edit")}
        showBack={true}
        onClickButton={openAddClientModel}
        buttonStyle={
          isButtonDisabled ? { opacity: 0.3, pointerEvents: "none" } : {}
        }
        isPricingDisabled={isButtonDisabled}
        screen="Pricing"
      />
      <Box spacing={2} height="100vh">
        <Box xs={12}>
          {pricingData === null ? (
            <LoadingScreen isDashboard={false} />
          ) : (
            <>
              <Card>
                <Stack spacing={1} sx={{ p: 3 }}>
                  <Grid container columns={{ xs: 4, sm: 8, md: 12 }}>
                    <Grid xs={2} sm={4} md={4}>
                      <DetailItem
                        label={translate("PriceEstimation.PRICING_NAME")}
                        value={pricingData?.name}
                      />
                    </Grid>
                    <Grid xs={2} sm={4} md={4}>
                      <DetailItem
                        label={translate("PriceEstimation.ESTIMATION_NAME")}
                        value={pricingData?.estimation_name}
                      />
                    </Grid>
                    {/* <Grid xs={2} sm={4} md={4}>
                      <DetailItem
                        label={translate("PriceEstimation.TOTAL_COST")}
                        value={getFormattedValue(
                          pricingData?.estimated_market_cost
                        )}
                      />
                    </Grid>
                    <Grid xs={2} sm={4} md={4}>
                      <DetailItem
                        label={translate("PriceEstimation.TOTAL_PRICE")}
                        value={getFormattedValue(
                          pricingData?.estimated_market_price
                        )}
                      />
                    </Grid>
                    <Grid xs={2} sm={4} md={4}>
                      <DetailItem
                        label={translate("PriceEstimation.TOTAL_GM_MARKET")}
                        value={getFormattedValue(pricingData?.market_gm)}
                      />
                    </Grid> */}
                    <Grid xs={2} sm={4} md={4}>
                      <DetailItem
                        label={translate("PriceEstimation.ESTIMATED_COST_AVG")}
                        value={getFormattedValue(
                          pricingData?.estimated_company_avg_cost
                        )}
                      />
                    </Grid>
                    <Grid xs={2} sm={4} md={4}>
                      <DetailItem
                        label={translate(
                          "PriceEstimation.ESTIMATION_PRICE_AVG"
                        )}
                        value={getFormattedValue(
                          pricingData?.estimated_company_avg_price
                        )}
                      />
                    </Grid>
                    <Grid xs={2} sm={4} md={4}>
                      <DetailItem
                        label={translate("PriceEstimation.TOTAL_GM")}
                        value={`${pricingData?.company_avg_gm}%`}
                      />
                    </Grid>
                    <Grid xs={2} sm={4} md={4}>
                      <DetailItem
                        label={translate("PriceEstimation.DISCOUNT")}
                        value={`${pricingData?.discount}%`}
                      />
                    </Grid>
                    <Grid xs={2} sm={4} md={4}>
                      <DetailItem
                        label={translate("PriceEstimation.FINAL_OFFER_PRICE")}
                        value={getFormattedValue(
                          pricingData?.final_offer_price
                        )}
                      />
                    </Grid>
                    <Grid xs={2} sm={4} md={4}>
                      <DetailItem
                        label={translate("PriceEstimation.FINAL_OFFER_MARGIN")}
                        value={getFormattedValue(
                          pricingData?.final_offer_margin
                        )}
                      />
                    </Grid>
                    <Grid xs={2} sm={4} md={4}>
                      <DetailItem
                        label={translate("Final Offer Gross Margin(%)")}
                        value={`${pricingData?.final_offer_gross_margin_percentage}%`}
                      />
                    </Grid>
                  </Grid>
                </Stack>
              </Card>
            </>
          )}
        </Box>
      </Box>

      {isAddModel && (
        <AddFormModal onClose={onCloseAddClientModel}>
          <AddPricingForm
            handleClose={onCloseAddClientModel}
            setOpen={isAddModel}
            detailData={pricingData}
            onPricingAdded={onPricingUpdated}
          />
        </AddFormModal>
      )}
    </>
  );
}
