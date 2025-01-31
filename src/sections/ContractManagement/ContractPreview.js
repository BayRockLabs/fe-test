import React, { useEffect, useState } from "react";
import Card from "@mui/material/Card";
import Grid from "@mui/material/Grid";
import Stack from "@mui/material/Stack";
import Typography from "@mui/material/Typography";

import useLocales from "../../hooks/useLocales";
import AddFormModal from "../../components/AddFormModal";
import Item from "../../common/Item";
import PageHeader from "../../components/PageHeader";
import { Box } from "@mui/material";

import { useLocation } from "react-router-dom";
import ContractAPI from "../../services/ContractService";
import useAxiosPrivate, { isValidResponse } from "../../hooks/useAxiosPrivate";
import { displayError } from "../../utils/handleErrors";
import { useSnackbar } from "notistack";
import { fDateDMY, fDateMDY } from "../../utils/formatTime";
import { fCurrency } from "../../utils/formatNumber";
import PreviewContractFile from "./PreviewContractFile";
import AddContractForm from "./AddContractForm";
import LoadingScreen from "../../components/LoadingScreen";
import { anchorOrigin } from "../../utils/constants";

const DetailItem = ({ label, value }) => (
  <Item sx={{ alignItems: "baseline" }}>
    <Typography
      className="text-base text-gray-900_02 w-auto"
      size="txtInterBold16"
      variant="body1"
    >
      {label}
    </Typography>
    <Typography
      className="text-base text-dark w-auto"
      size="txtInterBold16"
      variant="subtitle2"
      align="center"
    >
      {value}
    </Typography>
  </Item>
);

const ContractDetails = () => {
  const { translate } = useLocales();
  const axiosPrivate = useAxiosPrivate();
  const { enqueueSnackbar } = useSnackbar();
  const [isAddModel, setAddModel] = useState(false);
  const [detailData, setDetailData] = useState();
  const { state } = useLocation();
  const uuid = state?.uuid;

  const navigateToContractModel = () => {
    setAddModel(true);
  };

  const onCloseAddContractModel = () => {
    setAddModel(false);
  };

  useEffect(() => {
    getDetail();
  }, []);

  const onError = (message) => {
    enqueueSnackbar("ContractDetail - " + message, {
      anchorOrigin,
      variant: "error",
    });
  };

  async function onDetailLoaded(data) {
    setDetailData(data);
  }

  async function getDetail() {
    try {
      const response = await ContractAPI.DETAIL(axiosPrivate, uuid);

      if (isValidResponse(response)) {
        onDetailLoaded(response.data);
      } else {
        onError(translate("error.fetch"));
      }
    } catch (error) {
      console.log("Error in Contract.getClientDetail() - ", error);
      onError(translate("error.fetch"));
    }
  }

  function formatDate(date) {
    return date ? fDateMDY(date) : "";
  }

  const onContractUpdated = () => {
    onCloseAddContractModel();
    getDetail();
  };

  return (
    <>
      <PageHeader
        primaryTitle={translate("Contracts")}
        buttonText={translate("edit")}
        showBack={true}
        onClickButton={navigateToContractModel}
        screen="Contracts"
      />
      <Box spacing={2} height="100vh">
        <Box xs={12}>
          {detailData === null ? (
            <LoadingScreen isDashboard={false} />
          ) : (
            <>
              <Card>
                <Stack spacing={1} sx={{ p: 3 }}>
                  <Grid container columns={{ sm: 8, md: 12 }}>
                    <Grid xs={2} sm={4} md={4}>
                      <DetailItem
                        label={translate("CONTRACTS.CONTRACT_NAME")}
                        value={detailData?.contractsow_name ?? ""}
                      />
                    </Grid>
                    <Grid xs={2} sm={4} md={4}>
                      <DetailItem
                        label={translate("Estimations.ESTIMATION_NAME")}
                        value={detailData?.estimation_name ?? ""}
                      />
                    </Grid>
                    <Grid xs={2} sm={4} md={4}>
                      <DetailItem
                        label={translate("PriceEstimation.PRICING_NAME")}
                        value={detailData?.pricing_name ?? ""}
                      />
                    </Grid>
                    <Grid xs={2} sm={4} md={4}>
                      <DetailItem
                        label={translate("CONTRACTS.TOTAL_CONTRACT_AMOUNT")}
                        value={fCurrency(
                          detailData?.total_contract_amount ?? ""
                        )}
                      />
                    </Grid>
                    <Grid xs={2} sm={4} md={4}>
                      <DetailItem
                        label={translate("CONTRACTS.CONTRACT_TYPE")}
                        value={detailData?.contractsow_type ?? ""}
                      />
                    </Grid>
                    <Grid xs={2} sm={4} md={4}>
                      <DetailItem
                        label={translate("CONTRACTS.PAYMENT_TERMS_CONTRACT")}
                        value={detailData?.payment_term_contract ?? ""}
                      />
                    </Grid>
                    <Grid xs={2} sm={4} md={4}>
                      <DetailItem
                        label={translate("CONTRACTS.START_DATE")}
                        value={formatDate(detailData?.start_date)}
                      />
                    </Grid>
                    <Grid xs={2} sm={4} md={4}>
                      <DetailItem
                        label={translate("CONTRACTS.END_DATE")}
                        value={formatDate(detailData?.end_date)}
                      />
                    </Grid>
                    <Grid xs={2} sm={4} md={4}>
                      <DetailItem
                        label={translate("CONTRACTS.CONTRACT_EXT")}
                        value={
                          detailData?.parent_contract_name
                            ? detailData?.parent_contract_nameL
                            : "--"
                        }
                      />
                    </Grid>
                    {/* <Grid  xs={2} sm={4} md={4}>
                      <DetailItem
                        label={translate("CONTRACTS.PAYMENT_TERMS_CLIENT")}
                        value={detailData?.payment_term_client ?? ""}
                      />
                    </Grid> */}
                    <Grid xs={2} sm={4} md={4}>
                      {(detailData?.document?.length ?? 0) > 0 && (
                        <Stack>
                          <Typography
                            variant="body1"
                            color="textSecondary"
                            sx={{ paddingLeft: 2, paddingTop: 2 }}
                          >
                            {translate("CONTRACTS.CONTRACT_DOCUMENTS")}
                          </Typography>
                          <PreviewContractFile
                            filesData={detailData?.document}
                          />
                        </Stack>
                      )}
                    </Grid>
                  </Grid>
                </Stack>
              </Card>
            </>
          )}
        </Box>
      </Box>

      {isAddModel && (
        <AddFormModal onClose={onCloseAddContractModel}>
          <AddContractForm
            handleClose={onCloseAddContractModel}
            setOpen={isAddModel}
            detailData={detailData}
            onContractAdded={onContractUpdated}
          />
        </AddFormModal>
      )}
    </>
  );
};

export default ContractDetails;
