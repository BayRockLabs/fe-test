  import * as React from "react";
  import Box from "@mui/material/Box";
  import Item from "../../common/Item";
  import { Card, Grid, Typography } from "@mui/material";
  import { useState, useEffect } from "react";
  import palette from "../../theme/palette";
  import TableDataComponent from "../../sections/clients/TableDataComponent";
  import { useSnackbar } from "notistack";
  import ClientAPI from "../../services/ClientService";
  import Stack from "@mui/material/Stack";
  import useLocales from "../../hooks/useLocales";
  import { displayError } from "../../utils/handleErrors";
  import { makeStyles } from "@mui/styles";
  import useAxiosPrivate, { isValidResponse } from "../../hooks/useAxiosPrivate";
  import AddFormModal from "../../components/AddFormModal";

  import PageHeader from "../../components/PageHeader";
  import { fCapitalizeFirst } from "../../utils/formatString";
  import useClient from "../../hooks/useClient";
  import { fDateMDY } from "../../utils/formatTime";
  import { useTheme } from "@emotion/react";
  import PreviewContractFile from "../ContractManagement/PreviewContractFile";
  import AddClientStepper from "./AddClientStepper";
  import { useData } from "../../contexts/DataContext";
  import { anchorOrigin } from "../../utils/constants";
  import { format, parseISO } from "date-fns";

  import { countryData } from "./CountryData";
  import { stateData } from "./StateData";
  import { cityData } from "./CityData";

  const useStyles = makeStyles((theme) => ({
    container: {
      width: "100%",
      height: "auto",
      margin: "20px 0px 0px 0px",
    },
    backButton: {
      display: "inline-flex",
      alignItems: "center",
      verticalAlign: "middle",
    },
    title: {
      variant: "h5",
      color: palette.light.text.primary,
    },
    editButton: {
      float: "right",
      background: palette.dark.primary.theme_blue,
      padding: "0px 4px",
    },
    card: {
      width: "100%",
      display: "flex-start",
      margin: "20px 0px",
      padding: "15px",
      background: palette.dark.primary.contrastText,
    },
    cardContent: {
      padding: "20px",
    },
    cardSubtitle: {
      color: palette.dark,
      padding: "0 14px",
      fontWeight: 700,
      fontSize: "16px",
      marginBottom: "20px",
    },
    stack: {
      display: "flex",
      flexWrap: "nowrap",
      alignItems: "center",
    },
    fileImage: {
      width: "50px",
      height: "50px",
    },
  }));

  export default function ClientDetails() {
    const { userData } = useData();
    const [isAddModel, setAddModel] = useState(false);

    const theme = useTheme();
    const styles = useStyles(theme);
    const axiosPrivate = useAxiosPrivate();
    const { translate } = useLocales();
    const { enqueueSnackbar } = useSnackbar();
    const { selectedClient } = useClient();

    const [clientData, setClientData] = useState(null);
    const [contractData, setContractData] = useState(null);

    const uuid = selectedClient?.uuid ?? "";

    const openAddClientModel = () => {
      setAddModel(true);
    };
    const onCloseAddClientModel = () => {
      setAddModel(false);
    };

    useEffect(() => {
      getClientDetail(uuid);
    }, []);

    async function onClientDetailLoaded(clientDetailFromAPI) {
      const clientData = clientDetailFromAPI ?? {};
      clientData.name = fCapitalizeFirst(clientData?.name ?? "");
      clientData.address = clientData?.address ?? "";

      const contract = clientData.client_contracts?.[0] ?? {};

      contract.name = contract.name ? fCapitalizeFirst(contract.name) : "";
      contract.start_date = contract.start_date
        ? fDateMDY(contract.start_date)
        : "";
      contract.end_date = contract.end_date ? fDateMDY(contract.end_date) : "";
      contract.end_type = contract.end_type ?? "";
      contract.contract_version = contract.contract_version ?? "";

      clientData.client_contracts[0] = contract;
      setClientData(clientData);
      setContractData(contract);
    }
    const onError = (message) => {
      enqueueSnackbar("ClientDetail - " + message, {
        anchorOrigin,
        variant: "error",
      });
    };

    const onItemAdded = () => {
      onCloseAddClientModel();
      getClientDetail(uuid);
    };
    const clientCreationDate = clientData?.client_creation_date
      ? format(parseISO(clientData.client_creation_date), "yyyy-MM-dd")
      : "Invalid date";

    async function getClientDetail(clientId) {
      try {
        const response = await ClientAPI.DETAIL(axiosPrivate, clientId);
        if (isValidResponse(response)) {
          onClientDetailLoaded(response.data);
        } else {
          displayError(
            enqueueSnackbar(translate("Error in Fetching Client Detail"), {
              anchorOrigin,
              variant: "error", // You might want to specify the variant as well
            })
          );
          onError("Invalid response from Client Detail API");
        }
      } catch (error) {
        console.log("Error in ClientDetail.getClientDetail() - ", error);
        onError("Error in Client Detail API");
      }
    }

    function getPagePrimaryText() {
      // return `${clientData?.name ?? ""} ${translate("overview")}`;
      return `${translate("overview")}`;
    }

    let apiRoles = userData?.user_roles;
    let roles = apiRoles || [];

    const getCountryName = countryData.find(
      (country) => country.country_id === clientData?.country
    );

    const getStateName = stateData.find(
      (state) => state.state_id === clientData?.state
    );
    const getCityName = cityData.find(
      (city) => city.city_id === clientData?.city
    );

    return (
  <>
    <PageHeader
      primaryTitle={getPagePrimaryText()}
      buttonText={translate("Edit")}
      showBack={true}
      onClickButton={openAddClientModel}
      showSecondaryTitle={clientData?.name ?? ""}
      screen="Client"
    />

    <Box sx={{ padding: "16px" }}>
      {/* Client Details Card */}
      <Card sx={{ marginBottom: "16px", padding: "16px 26px" }}  >
        <Typography variant="h6" gutterBottom>
          {translate("ClientPreviewScreen.CLIENT_DETAILS")}
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body1" color="textSecondary">
              {translate("ClientPreviewScreen.CLIENT_NAME")}
            </Typography>
            <Typography variant="subtitle2">{clientData?.name || "--"}</Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body1" color="textSecondary">
              {translate("ClientPreviewScreen.BUSINESS_UNIT")}
            </Typography>
            <Typography variant="subtitle2">
              {clientData?.business_unit || "--"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body1" color="textSecondary">
              {translate("ClientPreviewScreen.CLIENT_ADDRESS")}
            </Typography>
            <Typography variant="subtitle2">
              {clientData?.address || "--"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body1" color="textSecondary">
              {translate("City")}
            </Typography>
            <Typography variant="subtitle2">
              {getCityName?.city_name?.trim() || "--"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body1" color="textSecondary">
              {translate("State")}
            </Typography>
            <Typography variant="subtitle2">
              {getStateName?.state_name?.trim() || "--"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body1" color="textSecondary">
              {translate("Country")}
            </Typography>
            <Typography variant="subtitle2">
              {getCountryName?.sortname?.trim() || "--"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body1" color="textSecondary">
              {translate("ZipCode")}
            </Typography>
            <Typography variant="subtitle2">
              {clientData?.zip_code?.trim() || "--"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body1" color="textSecondary">
              {translate("ClientPreviewScreen.CLIENT_CREATION_DATE")}
            </Typography>
            <Typography variant="subtitle2">
              {clientCreationDate?.trim() || "--"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body1" color="textSecondary">
              {translate("ClientPreviewScreen.CLIENT_CREATED_BY")}
            </Typography>
            <Typography variant="subtitle2">
              {clientData?.client_created_by || "--"}
            </Typography>
          </Grid>
        </Grid>
      </Card>

      {/* Organization Contract Details */}
      <Card sx={{ marginBottom: "16px", padding: "16px 26px" }}>
        <Typography variant="h6" gutterBottom>
          {translate("ClientPreviewScreen.ORG_DETAILS")}
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body1" color="textSecondary">
              {translate("ClientPreviewScreen.CONTRACT_NAME")}
            </Typography>
            <Typography variant="subtitle2">
              {contractData?.name || "--"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body1" color="textSecondary">
              {translate("ClientPreviewScreen.CONTRACT_TYPE")}
            </Typography>
            <Typography variant="subtitle2">
              {contractData?.end_type || "--"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body1" color="textSecondary">
              {translate("ClientPreviewScreen.CONTRACT_START_DATE")}
            </Typography>
            <Typography variant="subtitle2">
              {contractData?.start_date || "--"}
            </Typography>
          </Grid>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="body1" color="textSecondary">
              {translate("ClientPreviewScreen.CONTRACT_END_DATE")}
            </Typography>
            <Typography variant="subtitle2">
              {contractData?.end_date || "--"}
            </Typography>
          </Grid>
                        {/* <Grid xs={2} sm={4} md={4}>
                <Item>
                  <div className="flex flex-col items-start justify-start w-auto">
                    <Typography
                      className="text-base text-gray-900_02 w-auto"
                      size="txtInterBold16"
                      variant="body1"
                    >
                      {translate("ClientPreviewScreen.CONTRACT_VERSION")}
                    </Typography>
                    <Typography
                      className="text-base text-dark w-auto"
                      size="txtInterBold16"
                      variant="subtitle2"
                      align="center"
                    >
                      {contractData?.contract_version}
                    </Typography>
                  </div>
                </Item>
              </Grid> */}
        </Grid>
        <Box>
              {contractData?.files?.length > 0 && (
                <>
                  <Typography
                    spacing={4}
                    variant="body1"
                    padding={0}
                    marginTop={2}
                    color={palette.light.grey[500]}
                  >
                    {translate("ClientPreviewScreen.UPLOAD_FILES")}
                  </Typography>
                  <PreviewContractFile filesData={contractData?.files} />
                </>
              )}
            </Box>
      </Card>

      {/* Global Payment Details */}
      <Card sx={{ marginBottom: "16px", padding: "16px 26px"}}>
        <Typography variant="h6" gutterBottom>
          {translate("ClientPreviewScreen.GLOBAL_PAYMENNT_DETAILS")}
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6} md={4}>
            <Typography variant="subtitle2" color="textSecondary">
              {translate("ClientPreviewScreen.CLIENT_PAYMENT_TERMS")}
            </Typography>
            <Typography variant="body1">
              {clientData?.client_payment_terms?.trim() || "--"}
            </Typography> 
          </Grid>
                        {/* <Grid xs={2} sm={4} md={4}>
                <Item>
                  <div className="flex flex-col items-start justify-start w-auto">
                    <Typography
                      className="text-base text-gray-900_02 w-auto"
                      size="txtInterBold16"
                      variant="body1"
                    >
                      {translate("ClientPreviewScreen.CLIENT_INVOICE_PROCESS")}
                    </Typography>
                    <Typography
                      className="text-base text-dark w-auto"
                      size="txtInterBold16"
                      variant="subtitle2"
                      align="center"
                    >
                      {fCapitalizeFirst(clientData?.client_invoice_terms)}
                    </Typography>
                  </div>
                </Item>
              </Grid> */}
        </Grid>
        <Box styles={{ width: "50%", margin: "20px 0px" }}>
        {clientData?.client_ap_details.length > 0 && (
          <TableDataComponent
            data={
              Array.isArray(clientData?.client_ap_details)
                ? clientData?.client_ap_details
                : []
            }
          />
        )}
        </Box>
      </Card>
      {isAddModel && (
        <AddFormModal onClose={onCloseAddClientModel}>
          <AddClientStepper
            handleClose={onCloseAddClientModel}
            clientData={clientData}
            onClientAdded={onItemAdded}
            userData={userData}
          />
        </AddFormModal>
      )}
    </Box>
  </>
    );
  }
